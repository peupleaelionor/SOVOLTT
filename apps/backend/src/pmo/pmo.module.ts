// src/pmo/pmo.module.ts — Module PMO
import { Module } from '@nestjs/common';
import { PMOService } from './pmo.service';
import { PMOController } from './pmo.controller';

@Module({
  controllers: [PMOController],
  providers: [PMOService],
  exports: [PMOService],
})
export class PMOModule {}
