// src/production/production.module.ts — Module production temps réel
import { Module } from '@nestjs/common';
import { ProductionService } from './production.service';
import { ProductionGateway } from './production.gateway';

@Module({
  providers: [ProductionService, ProductionGateway],
  exports: [ProductionService],
})
export class ProductionModule {}
