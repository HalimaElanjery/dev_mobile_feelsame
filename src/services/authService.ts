/**
 * Service d'authentification (Types et Utils)
 * L'authentification principale (Login/Register) est maintenant gérée directement
 * par le SDK Firebase dans AuthContext.tsx.
 * Ce fichier sert principalement à définir les types et à récupérer le profil backend via /auth/me.
 */

import { apiGet, removeAuthToken } from './api';

export interface User {
  id: string;
  email: string;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
}

// Les fonctions login/register/logout du backend ne sont plus utilisées directement.
// Firebase gère le flow, et le token est synchronisé via api.ts (headers) et AuthContext.

/**
 * Récupère l'utilisateur actuellement connecté (Profil Backend synchronisé)
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    // Cette route backend utilise le token Firebase (via le header Authorization)
    // pour identifier l'utilisateur et renvoyer ses données DB (MySQL).
    const response = await apiGet<{ data: User }>('/auth/me');

    if (response && response.data) {
      return response.data;
    }

    return null;
  } catch (error: any) {
    console.error('Get current user error:', error);

    // Si le token est invalide (401), le supprimer
    if (error.status === 401) {
      await removeAuthToken();
    }

    return null;
  }
};

