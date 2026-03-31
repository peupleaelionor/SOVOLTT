// src/enedis/enedis.module.ts — Module Enedis
import { Module } from '@nestjs/common';
import { EnedisService } from './enedis.service';
import { EnedisController } from './enedis.controller';

@Module({
  controllers: [EnedisController],
  providers: [EnedisService],
  exports: [EnedisService],
})
export class EnedisModule {}
