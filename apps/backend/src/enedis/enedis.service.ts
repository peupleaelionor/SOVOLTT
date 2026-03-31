// src/enedis/enedis.service.ts — Intégration de l'API Enedis SGE
// Récupération des données de consommation/production via les compteurs Linky
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { PrismaService } from '../prisma/prisma.service';

/** Structure des données de mesure Enedis */
interface EnedisMesure {
  date: string;
  valeur: number;
  unite: string;
}

@Injectable()
export class EnedisService {
  private readonly logger = new Logger(EnedisService.name);
  private readonly apiClient: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    // Client HTTP pour l'API Enedis SGE
    this.apiClient = axios.create({
      baseURL: this.configService.get<string>(
        'ENEDIS_API_URL',
        'https://ext.hml.api.enedis.fr',
      ),
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /** Authentification OAuth2 auprès d'Enedis */
  async authenticate(): Promise<string> {
    // Vérifier si le token est encore valide
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(
        `${this.configService.get('ENEDIS_API_URL')}/oauth2/v3/token`,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.configService.get<string>('ENEDIS_CLIENT_ID', ''),
          client_secret: this.configService.get<string>('ENEDIS_CLIENT_SECRET', ''),
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );

      this.accessToken = response.data.access_token;
      // Le token expire 1h après l'émission, on rafraîchit 5min avant
      this.tokenExpiry = new Date(Date.now() + (response.data.expires_in - 300) * 1000);

      this.logger.log('✅ Authentification Enedis réussie');
      return this.accessToken!;
    } catch (error) {
      this.logger.error("❌ Échec d'authentification Enedis", error);
      throw new BadRequestException(
        'Impossible de se connecter à Enedis. Vérifiez les identifiants API.',
      );
    }
  }

  /** Récupère les données de consommation quotidienne via le PRM Linky */
  async getConsommation(
    prm: string,
    dateDebut: string,
    dateFin: string,
  ): Promise<EnedisMesure[]> {
    const token = await this.authenticate();

    try {
      const response = await this.apiClient.get(
        `/metering_data_dc/v5/daily_consumption`,
        {
          params: {
            usage_point_id: prm,
            start: dateDebut,
            end: dateFin,
          },
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // Extraction des mesures depuis la réponse Enedis
      const intervalReadings =
        response.data?.meter_reading?.interval_reading || [];

      return intervalReadings.map(
        (reading: { date: string; value: string }) => ({
          date: reading.date,
          valeur: parseFloat(reading.value),
          unite: 'Wh',
        }),
      );
    } catch (error) {
      this.logger.error(`❌ Erreur récupération conso pour PRM ${prm}`, error);
      throw new BadRequestException(
        'Impossible de récupérer les données de consommation Enedis',
      );
    }
  }

  /** Récupère les données de production quotidienne */
  async getProduction(
    prm: string,
    dateDebut: string,
    dateFin: string,
  ): Promise<EnedisMesure[]> {
    const token = await this.authenticate();

    try {
      const response = await this.apiClient.get(
        `/metering_data_dp/v5/daily_production`,
        {
          params: {
            usage_point_id: prm,
            start: dateDebut,
            end: dateFin,
          },
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const intervalReadings =
        response.data?.meter_reading?.interval_reading || [];

      return intervalReadings.map(
        (reading: { date: string; value: string }) => ({
          date: reading.date,
          valeur: parseFloat(reading.value),
          unite: 'Wh',
        }),
      );
    } catch (error) {
      this.logger.error(`❌ Erreur récupération production pour PRM ${prm}`, error);
      throw new BadRequestException(
        'Impossible de récupérer les données de production Enedis',
      );
    }
  }

  /** Récupère les informations d'un compteur Linky */
  async getMeterInfo(prm: string) {
    const token = await this.authenticate();

    try {
      const response = await this.apiClient.get(
        `/customers_upc/v5/usage_points/${prm}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      return response.data;
    } catch (error) {
      this.logger.error(`❌ Erreur récupération info compteur ${prm}`, error);
      throw new BadRequestException(
        'Impossible de récupérer les informations du compteur',
      );
    }
  }

  /** Enregistre un compteur Linky pour un utilisateur */
  async registerMeter(
    userId: string,
    prm: string,
    type: 'PRODUCTION' | 'CONSOMMATION',
    address?: string,
  ) {
    // Vérifier que le PRM a 14 chiffres
    if (!/^\d{14}$/.test(prm)) {
      throw new BadRequestException(
        'Le PRM doit contenir exactement 14 chiffres',
      );
    }

    return this.prisma.linkyMeter.create({
      data: { userId, prm, type, address },
    });
  }

  /** Synchronise les données du compteur Linky en base de données */
  async syncMeterData(meterId: string) {
    const meter = await this.prisma.linkyMeter.findUnique({
      where: { id: meterId },
    });

    if (!meter) {
      throw new BadRequestException('Compteur non trouvé');
    }

    // Période de synchronisation : derniers 30 jours
    const dateFin = new Date().toISOString().split('T')[0];
    const dateDebut = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    // Récupérer les données selon le type de compteur
    const mesures =
      meter.type === 'PRODUCTION'
        ? await this.getProduction(meter.prm, dateDebut, dateFin)
        : await this.getConsommation(meter.prm, dateDebut, dateFin);

    // Sauvegarder les relevés en base
    const readings = mesures.map((m) => ({
      meterId,
      timestamp: new Date(m.date),
      valueWh: m.valeur,
      type: meter.type,
    }));

    // Insertion en lot (upsert pour éviter les doublons)
    for (const reading of readings) {
      await this.prisma.meterReading.create({ data: reading });
    }

    // Mettre à jour la date de dernière synchronisation
    await this.prisma.linkyMeter.update({
      where: { id: meterId },
      data: { lastSync: new Date() },
    });

    this.logger.log(
      `✅ Synchronisation réussie : ${readings.length} relevés pour le compteur ${meter.prm}`,
    );

    return { syncedReadings: readings.length, lastSync: new Date() };
  }

  /** Récupère les relevés stockés en base pour un utilisateur */
  async getUserReadings(
    userId: string,
    type?: 'PRODUCTION' | 'CONSOMMATION',
    days: number = 30,
  ) {
    const meters = await this.prisma.linkyMeter.findMany({
      where: { userId, ...(type ? { type } : {}) },
    });

    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const readings = await this.prisma.meterReading.findMany({
      where: {
        meterId: { in: meters.map((m) => m.id) },
        timestamp: { gte: since },
      },
      orderBy: { timestamp: 'asc' },
    });

    return readings;
  }
}
