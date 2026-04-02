// src/pmo/pmo.service.ts — Service de gestion des PMO
// Personne Morale Organisatrice — Article L315-2 du Code de l'énergie
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/** Limites réglementaires selon le décret 2017-676 */
const PMO_LIMITS = {
  URBAIN: { maxRadiusKm: 2, description: 'Zone urbaine dense' },
  PERIURBAIN: { maxRadiusKm: 10, description: 'Zone périurbaine' },
  RURAL: { maxRadiusKm: 20, description: 'Zone rurale' },
};

@Injectable()
export class PMOService {
  constructor(private readonly prisma: PrismaService) {}

  /** Crée une nouvelle PMO avec validation réglementaire */
  async create(
    adminId: string,
    data: {
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
    // Validation du rayon selon le type de zone
    const limit = PMO_LIMITS[data.type];
    if (data.radiusKm > limit.maxRadiusKm) {
      throw new BadRequestException(
        `Le rayon maximum pour une zone ${data.type.toLowerCase()} est de ${limit.maxRadiusKm} km`,
      );
    }

    // Validation de la puissance maximale
    const maxPower = data.maxPowerMW || 5.0;
    if (maxPower > 10) {
      throw new BadRequestException(
        'La puissance maximale ne peut pas dépasser 10 MW (collectivités)',
      );
    }

    // Création de la PMO
    const pmo = await this.prisma.pMO.create({
      data: {
        name: data.name,
        siret: data.siret,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        latitude: data.latitude,
        longitude: data.longitude,
        type: data.type,
        radiusKm: data.radiusKm,
        maxPowerMW: maxPower,
        status: 'EN_CREATION',
        // L'administrateur est automatiquement ajouté comme membre
        members: {
          create: {
            userId: adminId,
            role: 'ADMIN',
          },
        },
      },
      include: { members: { include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } } } },
    });

    return pmo;
  }

  /** Récupère les détails d'une PMO */
  async findOne(pmoId: string) {
    const pmo = await this.prisma.pMO.findUnique({
      where: { id: pmoId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true, role: true },
            },
          },
        },
        offers: { where: { status: 'ACTIVE' } },
      },
    });

    if (!pmo) {
      throw new NotFoundException('PMO non trouvée');
    }

    return pmo;
  }

  /** Liste les PMO à proximité */
  async findNearby(latitude: number, longitude: number, radiusKm: number = 20) {
    const pmos = await this.prisma.$queryRaw`
      SELECT 
        id, name, siret, address, city, latitude, longitude,
        type, radius_km as "radiusKm", max_power_mw as "maxPowerMW", status,
        (6371 * acos(
          cos(radians(${latitude})) * cos(radians(latitude)) *
          cos(radians(longitude) - radians(${longitude})) +
          sin(radians(${latitude})) * sin(radians(latitude))
        )) AS distance_km
      FROM pmos
      WHERE status IN ('ACTIVE', 'EN_CREATION')
      HAVING distance_km <= ${radiusKm}
      ORDER BY distance_km ASC
    `;

    return pmos;
  }

  /** Rejoindre une PMO existante */
  async join(
    userId: string,
    pmoId: string,
    role: 'PRODUCTEUR' | 'CONSOMMATEUR' = 'CONSOMMATEUR',
  ) {
    const pmo = await this.prisma.pMO.findUnique({ where: { id: pmoId } });
    if (!pmo) {
      throw new NotFoundException('PMO non trouvée');
    }

    // Vérifier que l'utilisateur n'est pas déjà membre
    const existingMember = await this.prisma.pMOMember.findUnique({
      where: { userId_pmoId: { userId, pmoId } },
    });

    if (existingMember) {
      throw new BadRequestException('Vous êtes déjà membre de cette PMO');
    }

    return this.prisma.pMOMember.create({
      data: { userId, pmoId, role },
      include: { pmo: true },
    });
  }

  /** Quitter une PMO */
  async leave(userId: string, pmoId: string) {
    const member = await this.prisma.pMOMember.findUnique({
      where: { userId_pmoId: { userId, pmoId } },
    });

    if (!member) {
      throw new NotFoundException("Vous n'êtes pas membre de cette PMO");
    }

    if (member.role === 'ADMIN') {
      // Vérifier s'il y a d'autres admins
      const adminCount = await this.prisma.pMOMember.count({
        where: { pmoId, role: 'ADMIN' },
      });
      if (adminCount <= 1) {
        throw new ForbiddenException(
          'Vous ne pouvez pas quitter la PMO en tant que seul administrateur',
        );
      }
    }

    return this.prisma.pMOMember.delete({
      where: { userId_pmoId: { userId, pmoId } },
    });
  }

  /** Liste les PMO d'un utilisateur */
  async findByUser(userId: string) {
    return this.prisma.pMOMember.findMany({
      where: { userId },
      include: {
        pmo: {
          include: {
            members: {
              include: {
                user: { select: { id: true, firstName: true, lastName: true } },
              },
            },
          },
        },
      },
    });
  }
}
