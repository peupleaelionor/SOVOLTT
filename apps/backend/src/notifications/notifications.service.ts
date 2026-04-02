// src/notifications/notifications.service.ts — Service de notifications push Expo
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';

/** Structure d'un message de notification */
interface PushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: string;
  badge?: number;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly expoApiUrl = 'https://exp.host/--/api/v2/push/send';

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  /** Envoie une notification push à un utilisateur */
  async sendToUser(
    userId: string,
    title: string,
    body: string,
    type: 'OFFRE_DISPONIBLE' | 'TRANSACTION_CONFIRMEE' | 'PAIEMENT_RECU' | 'SURPLUS_ALERTE' | 'PMO_INVITATION' | 'COMPTEUR_SYNC' | 'SYSTEM',
    data?: Record<string, unknown>,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { expoPushToken: true },
    });

    if (!user?.expoPushToken) {
      this.logger.warn(`⚠️ Pas de token push pour l'utilisateur ${userId}`);
      return null;
    }

    // Sauvegarder la notification en base
    await this.prisma.notification.create({
      data: { userId, title, body, type, data: data || {} },
    });

    // Envoyer via Expo Push API
    return this.sendPushNotification({
      to: user.expoPushToken,
      title,
      body,
      data,
      sound: 'default',
    });
  }

  /** Envoie un lot de notifications push via l'API Expo */
  private async sendPushNotification(message: PushMessage) {
    try {
      const response = await axios.post(this.expoApiUrl, message, {
        headers: {
          'Content-Type': 'application/json',
          ...(this.configService.get('EXPO_ACCESS_TOKEN')
            ? {
                Authorization: `Bearer ${this.configService.get('EXPO_ACCESS_TOKEN')}`,
              }
            : {}),
        },
      });

      this.logger.log(`📱 Notification envoyée à ${message.to}`);
      return response.data;
    } catch (error) {
      this.logger.error('❌ Erreur envoi notification push', error);
      return null;
    }
  }

  /** Récupère les notifications d'un utilisateur */
  async getUserNotifications(userId: string, limit: number = 50) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /** Marque une notification comme lue */
  async markAsRead(notificationId: string) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }

  /** Marque toutes les notifications d'un utilisateur comme lues */
  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }
}
