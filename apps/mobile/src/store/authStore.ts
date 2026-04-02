// src/store/authStore.ts — Store d'authentification Zustand
import { create } from 'zustand';
import type { User, AuthResponse } from '../types';
import { storage } from '../services/storage';
import { api } from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'PRODUCTEUR' | 'CONSOMMATEUR';
    phone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    latitude?: number;
    longitude?: number;
  }) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await api.post<AuthResponse>('/auth/login', {
        email,
        password,
      });
      const { user, accessToken } = response.data;
      await storage.setToken(accessToken);
      set({
        user: user as User,
        token: accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const response = await api.post<AuthResponse>('/auth/register', data);
      const { user, accessToken } = response.data;
      await storage.setToken(accessToken);
      set({
        user: user as User,
        token: accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    await storage.deleteToken();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  loadStoredAuth: async () => {
    try {
      const token = await storage.getToken();
      if (token) {
        // Vérifier le token et récupérer le profil
        const response = await api.get('/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        set({
          user: response.data as User,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch {
      await storage.deleteToken();
      set({ isLoading: false });
    }
  },

  updateProfile: async (data) => {
    const response = await api.put('/users/me', data);
    set({ user: response.data as User });
  },
}));
