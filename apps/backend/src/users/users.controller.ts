// src/users/users.controller.ts — Contrôleur utilisateurs
import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Récupérer mon profil' })
  async getProfile(@Request() req: { user: { id: string } }) {
    return this.usersService.getProfile(req.user.id);
  }

  @Put('me')
  @ApiOperation({ summary: 'Mettre à jour mon profil' })
  async updateProfile(
    @Request() req: { user: { id: string } },
    @Body() body: Record<string, unknown>,
  ) {
    return this.usersService.updateProfile(req.user.id, body);
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Trouver les producteurs à proximité' })
  @ApiQuery({ name: 'lat', type: Number, description: 'Latitude' })
  @ApiQuery({ name: 'lng', type: Number, description: 'Longitude' })
  @ApiQuery({ name: 'radius', type: Number, required: false, description: 'Rayon en km (défaut: 20)' })
  async findNearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius?: string,
  ) {
    return this.usersService.findNearbyProducers(
      parseFloat(lat),
      parseFloat(lng),
      radius ? parseFloat(radius) : 20,
    );
  }
}
