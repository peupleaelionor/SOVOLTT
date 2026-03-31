// src/prisma/prisma.service.ts — Service Prisma pour l'accès à la base de données
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
    console.log('🗄️  Connexion à la base de données établie');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
