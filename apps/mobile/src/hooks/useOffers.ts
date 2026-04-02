// src/hooks/useOffers.ts — Hook pour les offres marketplace
import { useState, useEffect, useCallback } from 'react';
import { useEnergyStore } from '../store/energyStore';
import { useLocation } from './useLocation';

export function useOffers() {
  const { offers, isLoading, fetchOffers } = useEnergyStore();
  const { location } = useLocation();
  const [filters, setFilters] = useState<{
    maxPrice?: number;
    radius?: number;
  }>({});

  /** Charger les offres avec la position actuelle */
  const loadOffers = useCallback(async () => {
    await fetchOffers({
      latitude: location?.latitude,
      longitude: location?.longitude,
      maxPrice: filters.maxPrice,
      radius: filters.radius || 20,
    });
  }, [location, filters]);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  return {
    offers,
    isLoading,
    filters,
    setFilters,
    refresh: loadOffers,
  };
}
