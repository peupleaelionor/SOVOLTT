// src/store/pmoStore.ts — Store de gestion des PMO Zustand
import { create } from 'zustand';
import type { PMO, PMOMember } from '../types';
import { api } from '../services/api';

interface PMOState {
  myPMOs: Array<{ pmo: PMO; role: string }>;
  nearbyPMOs: PMO[];
  selectedPMO: PMO | null;
  isLoading: boolean;
  
  // Actions
  fetchMyPMOs: () => Promise<void>;
  fetchNearbyPMOs: (lat: number, lng: number, radius?: number) => Promise<void>;
  fetchPMODetail: (pmoId: string) => Promise<void>;
  createPMO: (data: {
    name: string;
    siret: string;
    address: string;
    city?: string;
    latitude: number;
    longitude: number;
    type: 'URBAIN' | 'PERIURBAIN' | 'RURAL';
    radiusKm: number;
  }) => Promise<PMO>;
  joinPMO: (pmoId: string, role?: 'PRODUCTEUR' | 'CONSOMMATEUR') => Promise<void>;
  leavePMO: (pmoId: string) => Promise<void>;
}

export const usePMOStore = create<PMOState>((set) => ({
  myPMOs: [],
  nearbyPMOs: [],
  selectedPMO: null,
  isLoading: false,

  fetchMyPMOs: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/pmo/me');
      set({ myPMOs: response.data as Array<{ pmo: PMO; role: string }>, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchNearbyPMOs: async (lat, lng, radius = 20) => {
    set({ isLoading: true });
    try {
      const response = await api.get(
        `/pmo/nearby?lat=${lat}&lng=${lng}&radius=${radius}`,
      );
      set({ nearbyPMOs: response.data as PMO[], isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchPMODetail: async (pmoId) => {
    const response = await api.get(`/pmo/${pmoId}`);
    set({ selectedPMO: response.data as PMO });
  },

  createPMO: async (data) => {
    const response = await api.post('/pmo', data);
    const newPMO = response.data as PMO;
    set((state) => ({
      myPMOs: [...state.myPMOs, { pmo: newPMO, role: 'ADMIN' }],
    }));
    return newPMO;
  },

  joinPMO: async (pmoId, role) => {
    await api.post(`/pmo/${pmoId}/join`, { role });
    // Rafraîchir la liste
    const response = await api.get('/pmo/me');
    set({ myPMOs: response.data as Array<{ pmo: PMO; role: string }> });
  },

  leavePMO: async (pmoId) => {
    await api.delete(`/pmo/${pmoId}/leave`);
    set((state) => ({
      myPMOs: state.myPMOs.filter((m) => m.pmo.id !== pmoId),
    }));
  },
}));
