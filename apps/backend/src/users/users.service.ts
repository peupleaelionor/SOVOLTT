// src/users/users.service.ts — Service de gestion des utilisateurs
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Récupère le profil complet d'un utilisateur */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        address: true,
        city: true,
        postalCode: true,
        latitude: true,
        longitude: true,
        stripeCustomerId: true,
        stripeAccountId: true,
        createdAt: true,
        meters: true,
        pmoMemberships: { include: { pmo: true } },
      },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return user;
  }

  /** Met à jour le profil d'un utilisateur */
  async updateProfile(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      address?: string;
      city?: string;
      postalCode?: string;
      latitude?: number;
      longitude?: number;
      expoPushToken?: string;
    },
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        address: true,
        city: true,
        postalCode: true,
        latitude: true,
        longitude: true,
      },
    });
  }

  /**
   * Trouve les producteurs à proximité en utilisant la formule de Haversine
   * pour calculer la distance entre deux points géographiques
   */
  async findNearbyProducers(
    latitude: number,
    longitude: number,
    radiusKm: number = 20,
  ) {
    // Requête SQL brute avec la formule de Haversine pour PostgreSQL
    const users = await this.prisma.$queryRaw`
      SELECT 
        id, email, first_name as "firstName", last_name as "lastName",
        address, city, latitude, longitude,
        (6371 * acos(
          cos(radians(${latitude})) * cos(radians(latitude)) *
          cos(radians(longitude) - radians(${longitude})) +
          sin(radians(${latitude})) * sin(radians(latitude))
        )) AS distance_km
      FROM users
      WHERE role = 'PRODUCTEUR'
        AND latitude IS NOT NULL 
        AND longitude IS NOT NULL
      HAVING distance_km <= ${radiusKm}
      ORDER BY distance_km ASC
      LIMIT 50
    `;

    return users;
  }
}
