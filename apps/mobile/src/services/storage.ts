// src/services/storage.ts — Stockage sécurisé (SecureStore)
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'sovoltt_access_token';
const USER_KEY = 'sovoltt_user';

export const storage = {
  /** Sauvegarde le token JWT */
  async setToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },

  /** Récupère le token JWT */
  async getToken(): Promise<string | null> {
    return SecureStore.getItemAsync(TOKEN_KEY);
  },

  /** Supprime le token JWT */
  async deleteToken(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },

  /** Sauvegarde des données utilisateur */
  async setUser(user: Record<string, unknown>): Promise<void> {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  },

  /** Récupère les données utilisateur */
  async getUser(): Promise<Record<string, unknown> | null> {
    const data = await SecureStore.getItemAsync(USER_KEY);
    return data ? JSON.parse(data) : null;
  },
};
