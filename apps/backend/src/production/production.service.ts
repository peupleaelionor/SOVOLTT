// src/production/production.service.ts — Service de suivi de production temps réel
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/** Données de production en temps réel d'un producteur */
export interface ProductionData {
  producerId: string;
  currentKw: number;      // Production instantanée en kW
  todayKwh: number;       // Production du jour en kWh
  surplusKwh: number;     // Surplus disponible à la vente
  selfConsumedKwh: number; // Autoconsommation
  timestamp: Date;
}

@Injectable()
export class ProductionService {
  private readonly logger = new Logger(ProductionService.name);

  /** Cache mémoire des dernières données de production par producteur */
  private productionCache: Map<string, ProductionData> = new Map();

  constructor(private readonly prisma: PrismaService) {}

  /** Met à jour les données de production d'un producteur */
  updateProduction(data: ProductionData): ProductionData {
    this.productionCache.set(data.producerId, {
      ...data,
      timestamp: new Date(),
    });
    return data;
  }

  /** Récupère les dernières données de production d'un producteur */
  getLatestProduction(producerId: string): ProductionData | null {
    return this.productionCache.get(producerId) || null;
  }

  /** Récupère les données de tous les producteurs (pour la marketplace) */
  getAllProduction(): ProductionData[] {
    return Array.from(this.productionCache.values());
  }

  /** Calcule les statistiques de production sur une période */
  async getProductionStats(producerId: string, days: number = 7) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const meters = await this.prisma.linkyMeter.findMany({
      where: { userId: producerId, type: 'PRODUCTION' },
    });

    if (meters.length === 0) {
      return { totalKwh: 0, avgDailyKwh: 0, readings: [] };
    }

    const readings = await this.prisma.meterReading.findMany({
      where: {
        meterId: { in: meters.map((m) => m.id) },
        timestamp: { gte: since },
        type: 'PRODUCTION',
      },
      orderBy: { timestamp: 'asc' },
    });

    const totalWh = readings.reduce((sum, r) => sum + r.valueWh, 0);
    const totalKwh = totalWh / 1000;
    const avgDailyKwh = days > 0 ? totalKwh / days : 0;

    return {
      totalKwh: Math.round(totalKwh * 100) / 100,
      avgDailyKwh: Math.round(avgDailyKwh * 100) / 100,
      readings: readings.map((r) => ({
        timestamp: r.timestamp,
        valueKwh: Math.round((r.valueWh / 1000) * 100) / 100,
      })),
    };
  }
}
