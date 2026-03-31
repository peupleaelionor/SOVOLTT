// src/hooks/useProduction.ts — Hook pour les données de production temps réel
import { useState, useEffect, useCallback } from 'react';
import { wsService } from '../services/websocket';
import { useAuthStore } from '../store/authStore';
import { useEnergyStore } from '../store/energyStore';
import type { ProductionData } from '../types';

export function useProduction(producerId?: string) {
  const { token, user } = useAuthStore();
  const { setCurrentProduction } = useEnergyStore();
  const [isConnected, setIsConnected] = useState(false);

  const targetId = producerId || user?.id;

  useEffect(() => {
    if (!token || !targetId) return;

    // Connexion WebSocket
    wsService.connect(token);
    setIsConnected(true);

    // Abonnement aux données du producteur
    wsService.subscribeToProducer(targetId, (data: ProductionData) => {
      setCurrentProduction(data);
    });

    return () => {
      wsService.unsubscribeFromProducer(targetId);
      setIsConnected(false);
    };
  }, [token, targetId]);

  /** Envoie des données de production (simulateur ou IoT) */
  const sendData = useCallback(
    (data: Omit<ProductionData, 'producerId'>) => {
      if (user?.id) {
        wsService.sendProductionData({
          ...data,
          producerId: user.id,
        });
      }
    },
    [user?.id],
  );

  return { isConnected, sendData };
}
