// src/navigation/types.ts — Types de navigation
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

/** Stack d'authentification */
export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  OnboardingStep1: undefined;
  OnboardingStep2: undefined;
  OnboardingStep3: undefined;
  OnboardingStep4: undefined;
};

/** Onglets principaux */
export type MainTabParamList = {
  Dashboard: undefined;
  Marketplace: undefined;
  Production: undefined;
  PMO: undefined;
  Profile: undefined;
};

/** Stack marketplace */
export type MarketplaceStackParamList = {
  MarketplaceHome: undefined;
  ProducerDetail: { producerId: string; offerId?: string };
  CreateOffer: undefined;
};

/** Stack PMO */
export type PMOStackParamList = {
  PMOHome: undefined;
  PMODetail: { pmoId: string };
};

// Props types
export type AuthScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type MainTabProps<T extends keyof MainTabParamList> =
  BottomTabScreenProps<MainTabParamList, T>;
