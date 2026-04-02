// src/marketplace/marketplace.controller.ts — Contrôleur de la marketplace
import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MarketplaceService } from './marketplace.service';

@ApiTags('marketplace')
@Controller('marketplace')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Get('offers')
  @ApiOperation({ summary: "Lister les offres d'énergie disponibles" })
  @ApiQuery({ name: 'lat', type: Number, required: false })
  @ApiQuery({ name: 'lng', type: Number, required: false })
  @ApiQuery({ name: 'maxPrice', type: Number, required: false })
  @ApiQuery({ name: 'minKwh', type: Number, required: false })
  @ApiQuery({ name: 'pmoId', type: String, required: false })
  @ApiQuery({ name: 'radius', type: Number, required: false })
  async getOffers(
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('minKwh') minKwh?: string,
    @Query('pmoId') pmoId?: string,
    @Query('radius') radius?: string,
  ) {
    return this.marketplaceService.findOffers({
      latitude: lat ? parseFloat(lat) : undefined,
      longitude: lng ? parseFloat(lng) : undefined,
      maxPricePerKwh: maxPrice ? parseFloat(maxPrice) : undefined,
      minKwh: minKwh ? parseFloat(minKwh) : undefined,
      pmoId,
      radiusKm: radius ? parseFloat(radius) : undefined,
    });
  }

  @Post('offers')
  @ApiOperation({ summary: "Créer une offre de vente d'énergie" })
  async createOffer(
    @Request() req: { user: { id: string } },
    @Body()
    body: {
      pricePerKwh: number;
      availableKwh: number;
      minPurchaseKwh?: number;
      startDate: string;
      endDate: string;
      pmoId?: string;
      description?: string;
    },
  ) {
    return this.marketplaceService.createOffer(req.user.id, body);
  }

  @Post('buy')
  @ApiOperation({ summary: "Acheter de l'énergie" })
  async buy(
    @Request() req: { user: { id: string } },
    @Body() body: { offerId: string; kwh: number },
  ) {
    return this.marketplaceService.purchaseEnergy(
      req.user.id,
      body.offerId,
      body.kwh,
    );
  }

  @Get('match')
  @ApiOperation({ summary: 'Matching automatique producteur/consommateur' })
  @ApiQuery({ name: 'kwh', type: Number, description: 'Quantité souhaitée en kWh' })
  @ApiQuery({ name: 'maxPrice', type: Number, required: false })
  async match(
    @Request() req: { user: { id: string } },
    @Query('kwh') kwh: string,
    @Query('maxPrice') maxPrice?: string,
  ) {
    return this.marketplaceService.matchOffers(
      req.user.id,
      parseFloat(kwh),
      maxPrice ? parseFloat(maxPrice) : undefined,
    );
  }
}
