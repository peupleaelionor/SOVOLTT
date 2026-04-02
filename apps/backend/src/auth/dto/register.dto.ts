// src/auth/dto/register.dto.ts — DTO d'inscription
import {
  IsEmail,
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
  IsNumber,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum RegisterRole {
  PRODUCTEUR = 'PRODUCTEUR',
  CONSOMMATEUR = 'CONSOMMATEUR',
}

export class RegisterDto {
  @ApiProperty({ example: 'jean.dupont@email.fr' })
  @IsEmail({}, { message: "L'adresse email n'est pas valide" })
  email: string;

  @ApiProperty({ example: 'MotDePasse123!' })
  @IsString()
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  password: string;

  @ApiProperty({ example: 'Jean' })
  @IsString()
  @MinLength(2, { message: 'Le prénom doit contenir au moins 2 caractères' })
  firstName: string;

  @ApiProperty({ example: 'Dupont' })
  @IsString()
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caractères' })
  lastName: string;

  @ApiPropertyOptional({ example: '+33612345678' })
  @IsOptional()
  @Matches(/^\+33[1-9]\d{8}$/, {
    message: 'Le numéro de téléphone doit être au format français (+33...)',
  })
  phone?: string;

  @ApiProperty({ enum: RegisterRole, example: 'PRODUCTEUR' })
  @IsEnum(RegisterRole, { message: 'Le rôle doit être PRODUCTEUR ou CONSOMMATEUR' })
  role: RegisterRole;

  @ApiPropertyOptional({ example: '12 Rue du Soleil, 75001 Paris' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'Paris' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: '75001' })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiPropertyOptional({ example: 48.8566 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: 2.3522 })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}
