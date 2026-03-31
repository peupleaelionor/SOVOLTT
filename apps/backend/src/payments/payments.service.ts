// src/payments/payments.service.ts — Service de paiement Stripe Connect
// Gestion marketplace : paiements, transferts, factures
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly stripe: Stripe;
  private readonly platformFeePercent: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY', ''),
      { apiVersion: '2023-10-16' as Stripe.LatestApiVersion },
    );
    this.platformFeePercent = this.configService.get<number>(
      'STRIPE_PLATFORM_FEE_PERCENT',
      5,
    );
  }

  /** Crée un compte Stripe Connect pour un producteur (Standard) */
  async createConnectAccount(userId: string, email: string) {
    try {
      const account = await this.stripe.accounts.create({
        type: 'standard',
        email,
        country: 'FR',
        metadata: { sovoltt_user_id: userId },
      });

      // Sauvegarder l'ID du compte Stripe en base
      await this.prisma.user.update({
        where: { id: userId },
        data: { stripeAccountId: account.id },
      });

      // Générer le lien d'onboarding Stripe
      const accountLink = await this.stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${this.configService.get('CORS_ORIGIN')}/stripe/refresh`,
        return_url: `${this.configService.get('CORS_ORIGIN')}/stripe/success`,
        type: 'account_onboarding',
      });

      return { accountId: account.id, onboardingUrl: accountLink.url };
    } catch (error) {
      this.logger.error('❌ Erreur création compte Stripe Connect', error);
      throw new BadRequestException('Impossible de créer le compte de paiement');
    }
  }

  /** Crée un PaymentIntent pour une transaction d'énergie */
  async createPaymentIntent(transactionId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { seller: true, buyer: true },
    });

    if (!transaction) {
      throw new BadRequestException('Transaction non trouvée');
    }

    if (!transaction.seller.stripeAccountId) {
      throw new BadRequestException(
        "Le vendeur n'a pas de compte de paiement configuré",
      );
    }

    try {
      // Montant en centimes d'euros
      const amountCents = Math.round(transaction.totalAmount * 100);
      const platformFeeCents = Math.round(transaction.platformFee * 100);

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amountCents,
        currency: 'eur',
        // Destination : le compte du producteur
        transfer_data: {
          destination: transaction.seller.stripeAccountId,
        },
        // Commission de la plateforme
        application_fee_amount: platformFeeCents,
        metadata: {
          transaction_id: transactionId,
          kwh: transaction.kwh.toString(),
          seller_id: transaction.sellerId,
          buyer_id: transaction.buyerId,
        },
        description: `Sovoltt — Achat ${transaction.kwh} kWh d'énergie solaire`,
      });

      // Enregistrer le PaymentIntent en base
      await this.prisma.transaction.update({
        where: { id: transactionId },
        data: { stripePaymentIntentId: paymentIntent.id },
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: transaction.totalAmount,
      };
    } catch (error) {
      this.logger.error('❌ Erreur création PaymentIntent', error);
      throw new BadRequestException('Impossible de créer le paiement');
    }
  }

  /** Traite les webhooks Stripe */
  async handleWebhook(payload: Buffer, signature: string) {
    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
      '',
    );

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
    } catch (error) {
      this.logger.error('❌ Signature webhook invalide', error);
      throw new BadRequestException('Signature webhook invalide');
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const intent = event.data.object as Stripe.PaymentIntent;
        const transactionId = intent.metadata.transaction_id;
        if (transactionId) {
          await this.prisma.transaction.update({
            where: { id: transactionId },
            data: { status: 'PAYEE' },
          });
          this.logger.log(`✅ Paiement confirmé pour transaction ${transactionId}`);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const failedIntent = event.data.object as Stripe.PaymentIntent;
        const failedTxId = failedIntent.metadata.transaction_id;
        if (failedTxId) {
          await this.prisma.transaction.update({
            where: { id: failedTxId },
            data: { status: 'ANNULEE' },
          });
          this.logger.warn(`⚠️ Paiement échoué pour transaction ${failedTxId}`);
        }
        break;
      }

      default:
        this.logger.log(`Événement Stripe non géré : ${event.type}`);
    }

    return { received: true };
  }

  /** Génère une facture mensuelle pour une opération de PMO */
  async generateMonthlyInvoice(operationId: string) {
    const operation = await this.prisma.energyOperation.findUnique({
      where: { id: operationId },
      include: {
        producer: true,
        consumer: true,
        pmo: true,
      },
    });

    if (!operation) {
      throw new BadRequestException('Opération non trouvée');
    }

    try {
      // Créer un client Stripe si nécessaire
      let customerId = operation.consumer.stripeCustomerId;
      if (!customerId) {
        const customer = await this.stripe.customers.create({
          email: operation.consumer.email,
          name: `${operation.consumer.firstName} ${operation.consumer.lastName}`,
          metadata: { sovoltt_user_id: operation.consumerId },
        });
        customerId = customer.id;
        await this.prisma.user.update({
          where: { id: operation.consumerId },
          data: { stripeCustomerId: customerId },
        });
      }

      // Créer la facture
      const invoice = await this.stripe.invoices.create({
        customer: customerId,
        auto_advance: true,
        collection_method: 'send_invoice',
        days_until_due: 30,
        metadata: {
          operation_id: operationId,
          period: operation.period,
          pmo_name: operation.pmo.name,
        },
      });

      // Ajouter la ligne de facturation
      await this.stripe.invoiceItems.create({
        customer: customerId,
        invoice: invoice.id,
        amount: Math.round(operation.priceTotal * 100),
        currency: 'eur',
        description: `Énergie solaire — ${operation.kwh} kWh — ${operation.period} — PMO ${operation.pmo.name}`,
      });

      // Finaliser et envoyer
      const finalizedInvoice = await this.stripe.invoices.finalizeInvoice(
        invoice.id,
      );

      // Sauvegarder l'URL de la facture
      await this.prisma.energyOperation.update({
        where: { id: operationId },
        data: { invoiceUrl: finalizedInvoice.hosted_invoice_url },
      });

      this.logger.log(
        `📄 Facture générée pour l'opération ${operationId} — ${operation.period}`,
      );

      return {
        invoiceId: invoice.id,
        invoiceUrl: finalizedInvoice.hosted_invoice_url,
        amount: operation.priceTotal,
      };
    } catch (error) {
      this.logger.error('❌ Erreur génération facture', error);
      throw new BadRequestException('Impossible de générer la facture');
    }
  }

  /** Liste les transactions/factures d'un utilisateur */
  async getUserTransactions(userId: string) {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
      include: {
        offer: true,
        buyer: { select: { id: true, firstName: true, lastName: true } },
        seller: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return transactions;
  }
}
