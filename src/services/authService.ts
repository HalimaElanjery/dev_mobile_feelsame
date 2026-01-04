/**
 * Service d'authentification avec API
 * Gère l'inscription, la connexion et la déconnexion des utilisateurs
 */

import { apiGet, apiPost, ApiResponse, removeAuthToken, setAuthToken } from './api';

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

/**
 * Inscription d'un nouvel utilisateur
 */
export const register = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const response: ApiResponse = await apiPost('/auth/register', {
      email,
      password
    });

    if (response.success) {
      return { success: true };
    } else {
      return { success: false, error: response.error || 'Erreur lors de l\'inscription' };
    }
  } catch (error: any) {
    console.error('Registration error:', error);
    return { 
      success: false, 
      error: error.message || 'Erreur lors de l\'inscription' 
    };
  }
};

/**
 * Connexion d'un utilisateur
 */
export const login = async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    const response: ApiResponse = await apiPost('/auth/login', {
      email,
      password
    });

    if (response.success && response.data) {
      const { token, user } = response.data;
      
      if (token && user) {
        // Sauvegarder le token
        await setAuthToken(token);
        
        return { 
          success: true, 
          user: user 
        };
      }
    }
    
    return { 
      success: false, 
      error: response.error || 'Email ou mot de passe incorrect' 
    };
  } catch (error: any) {
    console.error('Login error:', error);
    return { 
      success: false, 
      error: error.message || 'Erreur lors de la connexion' 
    };
  }
};

/**
 * Déconnexion de l'utilisateur
 */
export const logout = async (): Promise<boolean> => {
  console.log('🔴 AuthService logout function called');
  try {
    console.log('🔄 Calling API logout...');
    // Appeler l'API pour invalider le token côté serveur
    await apiPost('/auth/logout');
    console.log('✅ API logout completed');
    
    console.log('🔄 Removing auth token...');
    // Supprimer le token local
    await removeAuthToken();
    console.log('✅ Auth token removed');
    
    return true;
  } catch (error) {
    console.error('❌ Logout error:', error);
    
    // Même en cas d'erreur API, supprimer le token local
    try {
      console.log('🔄 Removing token after error...');
      await removeAuthToken();
      console.log('✅ Token removed after error');
    } catch (tokenError) {
      console.error('❌ Error removing token:', tokenError);
    }
    
    return false;
  }
};

/**
 * Récupère l'utilisateur actuellement connecté
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response: ApiResponse<User> = await apiGet('/auth/me');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return null;
  } catch (error: any) {
    console.error('Get current user error:', error);
    
    // Si le token est invalide, le supprimer
    if (error.status === 401) {
      await removeAuthToken();
    }
    
    return null;
  }
};

