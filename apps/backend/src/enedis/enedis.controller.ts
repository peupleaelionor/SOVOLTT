// src/enedis/enedis.controller.ts — Contrôleur Enedis / Linky
import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EnedisService } from './enedis.service';

@ApiTags('enedis')
@Controller('enedis')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EnedisController {
  constructor(private readonly enedisService: EnedisService) {}

  @Get('consumption')
  @ApiOperation({ summary: 'Données de consommation Linky' })
  @ApiQuery({ name: 'prm', type: String, description: 'Point Référence Mesure (14 chiffres)' })
  @ApiQuery({ name: 'start', type: String, description: 'Date de début (YYYY-MM-DD)' })
  @ApiQuery({ name: 'end', type: String, description: 'Date de fin (YYYY-MM-DD)' })
  async getConsumption(
    @Query('prm') prm: string,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.enedisService.getConsommation(prm, start, end);
  }

  @Get('production')
  @ApiOperation({ summary: 'Données de production Linky' })
  @ApiQuery({ name: 'prm', type: String })
  @ApiQuery({ name: 'start', type: String })
  @ApiQuery({ name: 'end', type: String })
  async getProduction(
    @Query('prm') prm: string,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.enedisService.getProduction(prm, start, end);
  }

  @Post('meters')
  @ApiOperation({ summary: 'Enregistrer un compteur Linky' })
  async registerMeter(
    @Request() req: { user: { id: string } },
    @Body() body: { prm: string; type: 'PRODUCTION' | 'CONSOMMATION'; address?: string },
  ) {
    return this.enedisService.registerMeter(
      req.user.id,
      body.prm,
      body.type,
      body.address,
    );
  }

  @Post('sync/:meterId')
  @ApiOperation({ summary: 'Synchroniser les données du compteur' })
  async syncMeter(@Param('meterId') meterId: string) {
    return this.enedisService.syncMeterData(meterId);
  }

  @Get('readings')
  @ApiOperation({ summary: 'Relevés stockés en base' })
  @ApiQuery({ name: 'type', enum: ['PRODUCTION', 'CONSOMMATION'], required: false })
  @ApiQuery({ name: 'days', type: Number, required: false })
  async getReadings(
    @Request() req: { user: { id: string } },
    @Query('type') type?: 'PRODUCTION' | 'CONSOMMATION',
    @Query('days') days?: string,
  ) {
    return this.enedisService.getUserReadings(
      req.user.id,
      type,
      days ? parseInt(days) : 30,
    );
  }
}
