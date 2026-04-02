// src/hooks/useLocation.ts — Hook de géolocalisation
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
}

export function useLocation() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Demande la permission et récupère la position */
  const requestLocation = async () => {
    setLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError("Permission de géolocalisation refusée");
        setLoading(false);
        return null;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Géocodage inverse pour obtenir la ville
      const [geocoded] = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      const data: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        city: geocoded?.city || geocoded?.subregion || undefined,
      };

      setLocation(data);
      setLoading(false);
      return data;
    } catch (err) {
      setError("Impossible de récupérer la position");
      setLoading(false);
      return null;
    }
  };

  return { location, loading, error, requestLocation };
}
