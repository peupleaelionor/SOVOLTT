// src/services/api.ts — Client HTTP Axios avec intercepteurs
import axios from 'axios';
import { storage } from './storage';

// URL de base de l'API (modifiable via variables d'environnement)
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur de requête : ajoute le token JWT
api.interceptors.request.use(
  async (config) => {
    const token = await storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Intercepteur de réponse : gère les erreurs et le refresh du token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Si le token est expiré (401), tenter un refresh (une seule fois)
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      try {
        const refreshResponse = await axios.get(
          `${API_BASE_URL}/auth/refresh`,
          { headers: error.config.headers },
        );
        const newToken = refreshResponse.data.accessToken;
        await storage.setToken(newToken);
        
        // Réexécuter la requête originale avec le nouveau token
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return axios(error.config);
      } catch {
        // Le refresh a échoué, forcer la déconnexion
        await storage.deleteToken();
      }
    }
    return Promise.reject(error);
  },
);
