// src/production/production.gateway.ts — Gateway WebSocket pour la production temps réel
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ProductionService, ProductionData } from './production.service';

@WebSocketGateway({
  namespace: '/production',
  cors: { origin: '*' },
})
export class ProductionGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ProductionGateway.name);

  constructor(private readonly productionService: ProductionService) {}

  /** Connexion d'un client WebSocket */
  handleConnection(client: Socket) {
    this.logger.log(`🔌 Client connecté : ${client.id}`);
  }

  /** Déconnexion d'un client */
  handleDisconnect(client: Socket) {
    this.logger.log(`🔌 Client déconnecté : ${client.id}`);
  }

  /** Abonnement aux données de production d'un producteur */
  @SubscribeMessage('subscribe-to-producer')
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { producerId: string },
  ) {
    const room = `producer-${data.producerId}`;
    client.join(room);
    this.logger.log(`📡 Client ${client.id} abonné au producteur ${data.producerId}`);

    // Envoyer les dernières données immédiatement
    const latest = this.productionService.getLatestProduction(data.producerId);
    if (latest) {
      client.emit('production-update', latest);
    }

    return { event: 'subscribed', data: { producerId: data.producerId } };
  }

  /** Désabonnement */
  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { producerId: string },
  ) {
    const room = `producer-${data.producerId}`;
    client.leave(room);
    return { event: 'unsubscribed', data: { producerId: data.producerId } };
  }

  /** Réception de données de production (depuis un producteur ou un IoT) */
  @SubscribeMessage('production-data')
  handleProductionData(
    @MessageBody() data: ProductionData,
  ) {
    // Mettre à jour le cache
    const updated = this.productionService.updateProduction(data);

    // Diffuser aux abonnés de ce producteur
    const room = `producer-${data.producerId}`;
    this.server.to(room).emit('production-update', updated);

    // Alerte de surplus si > 1 kWh disponible
    if (data.surplusKwh > 1) {
      this.server.emit('surplus-alert', {
        producerId: data.producerId,
        surplusKwh: data.surplusKwh,
        timestamp: new Date(),
      });
    }

    return { event: 'received', data: { producerId: data.producerId } };
  }
}
