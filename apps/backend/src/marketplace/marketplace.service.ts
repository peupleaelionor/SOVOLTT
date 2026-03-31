// src/marketplace/marketplace.service.ts — Service de la marketplace d'énergie
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MarketplaceService {
  constructor(private readonly prisma: PrismaService) {}

  /** Crée une nouvelle offre de vente d'énergie */
  async createOffer(
    producerId: string,
    data: {
      pricePerKwh: number;
      availableKwh: number;
      minPurchaseKwh?: number;
      startDate: string;
      endDate: string;
      pmoId?: string;
      description?: string;
    },
  ) {
    // Vérifier que l'utilisateur est bien producteur
    const user = await this.prisma.user.findUnique({
      where: { id: producerId },
    });

    if (!user || user.role !== 'PRODUCTEUR') {
      throw new BadRequestException(
        'Seuls les producteurs peuvent créer des offres',
      );
    }

    // Validation du prix (le tarif réglementé est autour de 0.25€/kWh en France)
    if (data.pricePerKwh <= 0 || data.pricePerKwh > 0.50) {
      throw new BadRequestException(
        'Le prix doit être compris entre 0.01€ et 0.50€/kWh',
      );
    }

    return this.prisma.offer.create({
      data: {
        producerId,
        pricePerKwh: data.pricePerKwh,
        availableKwh: data.availableKwh,
        minPurchaseKwh: data.minPurchaseKwh,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        pmoId: data.pmoId,
        description: data.description,
        status: 'ACTIVE',
      },
      include: {
        producer: {
          select: { id: true, firstName: true, lastName: true, city: true },
        },
      },
    });
  }

  /** Liste les offres actives, triées par proximité si coordonnées fournies */
  async findOffers(filters?: {
    latitude?: number;
    longitude?: number;
    maxPricePerKwh?: number;
    minKwh?: number;
    pmoId?: string;
    radiusKm?: number;
  }) {
    const where: Record<string, unknown> = {
      status: 'ACTIVE',
      endDate: { gte: new Date() },
    };

    if (filters?.maxPricePerKwh) {
      where.pricePerKwh = { lte: filters.maxPricePerKwh };
    }

    if (filters?.minKwh) {
      where.availableKwh = { gte: filters.minKwh };
    }

    if (filters?.pmoId) {
      where.pmoId = filters.pmoId;
    }

    const offers = await this.prisma.offer.findMany({
      where,
      include: {
        producer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            city: true,
            latitude: true,
            longitude: true,
          },
        },
        pmo: { select: { id: true, name: true } },
      },
      orderBy: { pricePerKwh: 'asc' },
      take: 50,
    });

    // Si coordonnées fournies, calculer la distance et trier
    if (filters?.latitude && filters?.longitude) {
      const offersWithDistance = offers.map((offer) => {
        const distance = this.haversineDistance(
          filters.latitude!,
          filters.longitude!,
          offer.producer.latitude || 0,
          offer.producer.longitude || 0,
        );
        return { ...offer, distanceKm: Math.round(distance * 10) / 10 };
      });

      // Filtrer par rayon si spécifié
      const radiusKm = filters.radiusKm || 20;
      return offersWithDistance
        .filter((o) => o.distanceKm <= radiusKm)
        .sort((a, b) => a.distanceKm - b.distanceKm);
    }

    return offers;
  }

  /** Acheter de l'énergie — crée une transaction */
  async purchaseEnergy(
    buyerId: string,
    offerId: string,
    kwh: number,
  ) {
    const offer = await this.prisma.offer.findUnique({
      where: { id: offerId },
      include: { producer: true },
    });

    if (!offer) {
      throw new NotFoundException('Offre non trouvée');
    }

    if (offer.status !== 'ACTIVE') {
      throw new BadRequestException("Cette offre n'est plus disponible");
    }

    if (kwh > offer.availableKwh) {
      throw new BadRequestException(
        `Quantité demandée (${kwh} kWh) supérieure au surplus disponible (${offer.availableKwh} kWh)`,
      );
    }

    if (offer.minPurchaseKwh && kwh < offer.minPurchaseKwh) {
      throw new BadRequestException(
        `Achat minimum : ${offer.minPurchaseKwh} kWh`,
      );
    }

    // Calcul du montant total
    const totalAmount = Math.round(kwh * offer.pricePerKwh * 100) / 100;
    const platformFee = Math.round(totalAmount * 0.05 * 100) / 100; // 5% de commission

    // Création de la transaction
    const transaction = await this.prisma.transaction.create({
      data: {
        offerId,
        buyerId,
        sellerId: offer.producerId,
        kwh,
        pricePerKwh: offer.pricePerKwh,
        totalAmount,
        platformFee,
        status: 'EN_ATTENTE',
      },
      include: {
        offer: true,
        buyer: { select: { id: true, firstName: true, lastName: true } },
        seller: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    // Mettre à jour le surplus disponible de l'offre
    await this.prisma.offer.update({
      where: { id: offerId },
      data: {
        availableKwh: { decrement: kwh },
      },
    });

    return transaction;
  }

  /** Algorithme de matching automatique basé sur proximité et prix */
  async matchOffers(
    consumerId: string,
    desiredKwh: number,
    maxPricePerKwh?: number,
  ) {
    const consumer = await this.prisma.user.findUnique({
      where: { id: consumerId },
    });

    if (!consumer?.latitude || !consumer?.longitude) {
      throw new BadRequestException(
        'Votre position géographique est nécessaire pour le matching',
      );
    }

    // Récupérer les offres actives
    const offers = await this.findOffers({
      latitude: consumer.latitude,
      longitude: consumer.longitude,
      maxPricePerKwh: maxPricePerKwh || 0.30,
      radiusKm: 20,
    });

    // Score de matching : pondération prix (40%) + proximité (40%) + quantité (20%)
    const scored = (offers as Array<Record<string, unknown>>).map((offer: Record<string, unknown>) => {
      const priceScore = 1 - ((offer.pricePerKwh as number) / 0.50);
      const distanceScore = 1 - ((offer.distanceKm as number) / 20);
      const qtyScore = Math.min((offer.availableKwh as number) / desiredKwh, 1);
      const totalScore = priceScore * 0.4 + distanceScore * 0.4 + qtyScore * 0.2;
      return { ...offer, matchScore: Math.round(totalScore * 100) };
    });

    return scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, 10);
  }

  /** Calcul de distance avec la formule de Haversine */
  private haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
