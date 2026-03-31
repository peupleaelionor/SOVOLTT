// src/main.ts — Point d'entrée du serveur Sovoltt
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Sécurité HTTP
  app.use(helmet());
  app.use(compression());

  // CORS pour l'app mobile et le site web
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Validation globale des DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Préfixe global pour l'API
  app.setGlobalPrefix('api');

  // Documentation Swagger
  const config = new DocumentBuilder()
    .setTitle('Sovoltt API')
    .setDescription(
      "API de la marketplace d'énergie solaire pair-à-pair — Autoconsommation collective France",
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentification et inscription')
    .addTag('users', 'Gestion des utilisateurs')
    .addTag('pmo', 'Personnes Morales Organisatrices')
    .addTag('marketplace', "Offres d'énergie")
    .addTag('enedis', 'Intégration compteurs Linky')
    .addTag('payments', 'Paiements Stripe Connect')
    .addTag('production', 'Suivi de production temps réel')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🌞 Sovoltt API démarrée sur le port ${port}`);
  console.log(`📚 Documentation Swagger : http://localhost:${port}/api/docs`);
}

bootstrap();
