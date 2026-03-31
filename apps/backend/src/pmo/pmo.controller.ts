// src/pmo/pmo.controller.ts — Contrôleur PMO
import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PMOService } from './pmo.service';

@ApiTags('pmo')
@Controller('pmo')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PMOController {
  constructor(private readonly pmoService: PMOService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle PMO' })
  async create(
    @Request() req: { user: { id: string } },
    @Body() body: {
      name: string;
      siret: string;
      address: string;
      city?: string;
      postalCode?: string;
      latitude: number;
      longitude: number;
      type: 'URBAIN' | 'PERIURBAIN' | 'RURAL';
      radiusKm: number;
      maxPowerMW?: number;
    },
  ) {
    return this.pmoService.create(req.user.id, body);
  }

  @Get('me')
  @ApiOperation({ summary: 'Mes PMO' })
  async myPmos(@Request() req: { user: { id: string } }) {
    return this.pmoService.findByUser(req.user.id);
  }

  @Get('nearby')
  @ApiOperation({ summary: 'PMO à proximité' })
  @ApiQuery({ name: 'lat', type: Number })
  @ApiQuery({ name: 'lng', type: Number })
  @ApiQuery({ name: 'radius', type: Number, required: false })
  async findNearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius?: string,
  ) {
    return this.pmoService.findNearby(
      parseFloat(lat),
      parseFloat(lng),
      radius ? parseFloat(radius) : 20,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: "Détails d'une PMO" })
  async findOne(@Param('id') id: string) {
    return this.pmoService.findOne(id);
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Rejoindre une PMO' })
  async join(
    @Request() req: { user: { id: string } },
    @Param('id') pmoId: string,
    @Body() body: { role?: 'PRODUCTEUR' | 'CONSOMMATEUR' },
  ) {
    return this.pmoService.join(req.user.id, pmoId, body.role);
  }

  @Delete(':id/leave')
  @ApiOperation({ summary: 'Quitter une PMO' })
  async leave(
    @Request() req: { user: { id: string } },
    @Param('id') pmoId: string,
  ) {
    return this.pmoService.leave(req.user.id, pmoId);
  }
}
