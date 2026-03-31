// src/services/websocket.ts — Client WebSocket pour les données temps réel
import { io, Socket } from 'socket.io-client';
import type { ProductionData } from '../types';

const WS_URL = process.env.EXPO_PUBLIC_WS_URL || 'http://localhost:3000';

class WebSocketService {
  private socket: Socket | null = null;

  /** Connexion au namespace /production */
  connect(token: string): void {
    if (this.socket?.connected) return;

    this.socket = io(`${WS_URL}/production`, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    this.socket.on('connect', () => {
      console.log('🔌 WebSocket connecté');
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 WebSocket déconnecté');
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Erreur WebSocket :', error.message);
    });
  }

  /** Déconnexion */
  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  /** S'abonner aux mises à jour de production d'un producteur */
  subscribeToProducer(
    producerId: string,
    callback: (data: ProductionData) => void,
  ): void {
    this.socket?.emit('subscribe-to-producer', { producerId });
    this.socket?.on('production-update', callback);
  }

  /** Se désabonner */
  unsubscribeFromProducer(producerId: string): void {
    this.socket?.emit('unsubscribe', { producerId });
    this.socket?.off('production-update');
  }

  /** Écouter les alertes de surplus */
  onSurplusAlert(
    callback: (data: { producerId: string; surplusKwh: number }) => void,
  ): void {
    this.socket?.on('surplus-alert', callback);
  }

  /** Envoyer des données de production (pour les producteurs) */
  sendProductionData(data: ProductionData): void {
    this.socket?.emit('production-data', data);
  }
}

export const wsService = new WebSocketService();
