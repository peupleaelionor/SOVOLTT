// src/store/energyStore.ts — Store des données d'énergie Zustand
import { create } from 'zustand';
import type { Offer, Transaction, ProductionData, MeterReading } from '../types';
import { api } from '../services/api';

interface EnergyState {
  // Production temps réel
  currentProduction: ProductionData | null;
  
  // Offres marketplace
  offers: Offer[];
  myOffers: Offer[];
  
  // Transactions
  transactions: Transaction[];
  
  // Relevés de compteur
  readings: MeterReading[];
  
  // État du chargement
  isLoading: boolean;
  
  // Actions
  setCurrentProduction: (data: ProductionData) => void;
  fetchOffers: (filters?: {
    latitude?: number;
    longitude?: number;
    maxPrice?: number;
    radius?: number;
  }) => Promise<void>;
  createOffer: (data: {
    pricePerKwh: number;
    availableKwh: number;
    startDate: string;
    endDate: string;
    description?: string;
    pmoId?: string;
  }) => Promise<void>;
  purchaseEnergy: (offerId: string, kwh: number) => Promise<Transaction>;
  fetchTransactions: () => Promise<void>;
  fetchReadings: (type?: 'PRODUCTION' | 'CONSOMMATION', days?: number) => Promise<void>;
}

export const useEnergyStore = create<EnergyState>((set) => ({
  currentProduction: null,
  offers: [],
  myOffers: [],
  transactions: [],
  readings: [],
  isLoading: false,

  setCurrentProduction: (data) => {
    set({ currentProduction: data });
  },

  fetchOffers: async (filters) => {
    set({ isLoading: true });
    try {
      const params = new URLSearchParams();
      if (filters?.latitude) params.append('lat', filters.latitude.toString());
      if (filters?.longitude) params.append('lng', filters.longitude.toString());
      if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
      if (filters?.radius) params.append('radius', filters.radius.toString());

      const response = await api.get(`/marketplace/offers?${params.toString()}`);
      set({ offers: response.data as Offer[], isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createOffer: async (data) => {
    const response = await api.post('/marketplace/offers', data);
    set((state) => ({
      myOffers: [response.data as Offer, ...state.myOffers],
    }));
  },

  purchaseEnergy: async (offerId, kwh) => {
    const response = await api.post('/marketplace/buy', { offerId, kwh });
    const transaction = response.data as Transaction;
    set((state) => ({
      transactions: [transaction, ...state.transactions],
    }));
    return transaction;
  },

  fetchTransactions: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/payments/transactions');
      set({ transactions: response.data as Transaction[], isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchReadings: async (type, days = 30) => {
    set({ isLoading: true });
    try {
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      params.append('days', days.toString());
      const response = await api.get(`/enedis/readings?${params.toString()}`);
      set({ readings: response.data as MeterReading[], isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));
