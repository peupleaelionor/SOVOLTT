// src/payments/payments.controller.ts — Contrôleur paiements
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Headers,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('connect-account')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer un compte Stripe Connect (producteur)' })
  async createConnectAccount(@Request() req: { user: { id: string; email: string } }) {
    return this.paymentsService.createConnectAccount(req.user.id, req.user.email);
  }

  @Post('create-intent/:transactionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer un PaymentIntent pour une transaction' })
  async createPaymentIntent(@Param('transactionId') transactionId: string) {
    return this.paymentsService.createPaymentIntent(transactionId);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Webhook Stripe (ne pas appeler directement)' })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const rawBody = req.rawBody;
    if (!rawBody) {
      return { error: 'Corps brut manquant' };
    }
    return this.paymentsService.handleWebhook(rawBody, signature);
  }

  @Post('invoice/:operationId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Générer une facture mensuelle' })
  async generateInvoice(@Param('operationId') operationId: string) {
    return this.paymentsService.generateMonthlyInvoice(operationId);
  }

  @Get('transactions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Historique des transactions' })
  async getTransactions(@Request() req: { user: { id: string } }) {
    return this.paymentsService.getUserTransactions(req.user.id);
  }
}
