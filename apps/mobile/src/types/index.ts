// src/types/index.ts — Types TypeScript pour l'application Sovoltt

/** Rôle de l'utilisateur */
export type UserRole = 'PRODUCTEUR' | 'CONSOMMATEUR' | 'PMO_ADMIN';

/** Utilisateur */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  address?: string;
  city?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  stripeCustomerId?: string;
  stripeAccountId?: string;
  expoPushToken?: string;
  createdAt: string;
}

/** PMO — Personne Morale Organisatrice */
export type PMOType = 'URBAIN' | 'PERIURBAIN' | 'RURAL';
export type PMOStatus = 'EN_CREATION' | 'ACTIVE' | 'SUSPENDUE' | 'FERMEE';

export interface PMO {
  id: string;
  name: string;
  siret: string;
  address: string;
  city?: string;
  latitude: number;
  longitude: number;
  type: PMOType;
  radiusKm: number;
  maxPowerMW: number;
  status: PMOStatus;
  members?: PMOMember[];
  distanceKm?: number;
}

/** Membre d'une PMO */
export interface PMOMember {
  id: string;
  userId: string;
  pmoId: string;
  role: 'ADMIN' | 'PRODUCTEUR' | 'CONSOMMATEUR';
  joinedAt: string;
  user?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>;
}

/** Offre de vente d'énergie */
export type OfferStatus = 'ACTIVE' | 'EXPIREE' | 'ANNULEE' | 'TERMINEE';

export interface Offer {
  id: string;
  producerId: string;
  pmoId?: string;
  pricePerKwh: number;
  availableKwh: number;
  minPurchaseKwh?: number;
  startDate: string;
  endDate: string;
  status: OfferStatus;
  description?: string;
  producer?: Pick<User, 'id' | 'firstName' | 'lastName' | 'city' | 'latitude' | 'longitude'>;
  pmo?: Pick<PMO, 'id' | 'name'>;
  distanceKm?: number;
  matchScore?: number;
}

/** Transaction d'achat d'énergie */
export type TransactionStatus = 'EN_ATTENTE' | 'CONFIRMEE' | 'PAYEE' | 'ANNULEE' | 'REMBOURSEE';

export interface Transaction {
  id: string;
  offerId: string;
  buyerId: string;
  sellerId: string;
  kwh: number;
  pricePerKwh: number;
  totalAmount: number;
  platformFee: number;
  status: TransactionStatus;
  createdAt: string;
  buyer?: Pick<User, 'id' | 'firstName' | 'lastName'>;
  seller?: Pick<User, 'id' | 'firstName' | 'lastName'>;
}

/** Compteur Linky */
export interface LinkyMeter {
  id: string;
  userId: string;
  prm: string;
  address?: string;
  type: 'PRODUCTION' | 'CONSOMMATION';
  lastSync?: string;
}

/** Relevé de compteur */
export interface MeterReading {
  id: string;
  meterId: string;
  timestamp: string;
  valueWh: number;
  type: 'PRODUCTION' | 'CONSOMMATION';
}

/** Données de production temps réel */
export interface ProductionData {
  producerId: string;
  currentKw: number;
  todayKwh: number;
  surplusKwh: number;
  selfConsumedKwh: number;
  timestamp: string;
}

/** Notification */
export type NotificationType =
  | 'OFFRE_DISPONIBLE'
  | 'TRANSACTION_CONFIRMEE'
  | 'PAIEMENT_RECU'
  | 'SURPLUS_ALERTE'
  | 'PMO_INVITATION'
  | 'COMPTEUR_SYNC'
  | 'SYSTEM';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  read: boolean;
  data?: Record<string, unknown>;
  createdAt: string;
}

/** Réponse d'authentification */
export interface AuthResponse {
  user: Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'role'>;
  accessToken: string;
}

/** Statistiques de production */
export interface ProductionStats {
  totalKwh: number;
  avgDailyKwh: number;
  readings: Array<{ timestamp: string; valueKwh: number }>;
}
