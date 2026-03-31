// src/app.module.ts — Module racine Sovoltt
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PMOModule } from './pmo/pmo.module';
import { MarketplaceModule } from './marketplace/marketplace.module';
import { EnedisModule } from './enedis/enedis.module';
import { PaymentsModule } from './payments/payments.module';
import { ProductionModule } from './production/production.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    // Configuration globale depuis .env
    ConfigModule.forRoot({ isGlobal: true }),
    // Protection contre les abus (100 requêtes / 60 secondes)
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    // Modules métier
    PrismaModule,
    AuthModule,
    UsersModule,
    PMOModule,
    MarketplaceModule,
    EnedisModule,
    PaymentsModule,
    ProductionModule,
    NotificationsModule,
  ],
})
export class AppModule {}
