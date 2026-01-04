/**
 * Configuration et utilitaires pour l'API
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/apiConfig';

// Types pour les réponses API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    limit: number;
    offset: number;
    total?: number;
  };
}

// Classe pour gérer les erreurs API
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Utilitaire pour récupérer le token d'authentification
export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('@feelsame:authToken');
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Utilitaire pour sauvegarder le token d'authentification
export const setAuthToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem('@feelsame:authToken', token);
  } catch (error) {
    console.error('Error setting auth token:', error);
    throw error;
  }
};

// Utilitaire pour supprimer le token d'authentification
export const removeAuthToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('@feelsame:authToken');
  } catch (error) {
    console.error('Error removing auth token:', error);
    throw error;
  }
};

// Fonction utilitaire pour faire des requêtes HTTP avec retry
export const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  // Configuration par défaut
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Ajouter le token d'authentification si disponible
  const token = await getAuthToken();
  if (token) {
    defaultOptions.headers = {
      ...defaultOptions.headers,
      'Authorization': `Bearer ${token}`,
    };
  }

  // Fusionner les options
  const finalOptions: RequestInit = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  // Fonction de retry avec backoff exponentiel
  const makeRequest = async (attempt: number = 1): Promise<T> => {
    // Créer un AbortController pour le timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
    finalOptions.signal = controller.signal;

    try {
      const response = await fetch(url, finalOptions);
      clearTimeout(timeoutId);
      
      // Vérifier si la réponse est OK
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // Ignorer les erreurs de parsing JSON
        }
        
        // Si token expiré, le supprimer automatiquement
        if (response.status === 401) {
          await removeAuthToken();
        }
        
        // Retry pour les erreurs 5xx (serveur) mais pas 4xx (client)
        if (response.status >= 500 && attempt < API_CONFIG.RETRY_ATTEMPTS) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // Backoff exponentiel, max 10s
          console.log(`🔄 Retrying request in ${delay}ms (attempt ${attempt}/${API_CONFIG.RETRY_ATTEMPTS})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return makeRequest(attempt + 1);
        }
        
        throw new ApiError(errorMessage, response.status);
      }

      // Parser la réponse JSON
      const data = await response.json();
      return data;

    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Erreur de timeout
      if (error.name === 'AbortError') {
        if (attempt < API_CONFIG.RETRY_ATTEMPTS) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          console.log(`⏰ Timeout, retrying in ${delay}ms (attempt ${attempt}/${API_CONFIG.RETRY_ATTEMPTS})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return makeRequest(attempt + 1);
        }
        
        throw new ApiError(
          'Timeout: Le serveur met trop de temps à répondre',
          0,
          'TIMEOUT_ERROR'
        );
      }
      
      // Erreurs réseau - retry
      if (attempt < API_CONFIG.RETRY_ATTEMPTS) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        console.log(`🌐 Network error, retrying in ${delay}ms (attempt ${attempt}/${API_CONFIG.RETRY_ATTEMPTS})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return makeRequest(attempt + 1);
      }
      
      // Erreurs réseau ou autres
      console.error('API Request Error:', error);
      throw new ApiError(
        'Erreur de connexion au serveur. Vérifiez votre connexion internet.',
        0,
        'NETWORK_ERROR'
      );
    }
  };

  return makeRequest();
};

// Fonctions utilitaires pour les différents types de requêtes
export const apiGet = <T = any>(endpoint: string, params?: Record<string, any>): Promise<T> => {
  let url = endpoint;
  
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }
  
  return apiRequest<T>(url, { method: 'GET' });
};

export const apiPost = <T = any>(endpoint: string, data?: any): Promise<T> => {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
};

export const apiPut = <T = any>(endpoint: string, data?: any): Promise<T> => {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
};

export const apiDelete = <T = any>(endpoint: string): Promise<T> => {
  return apiRequest<T>(endpoint, { method: 'DELETE' });
};

// Fonction pour tester la connexion à l'API
export const testApiConnection = async (): Promise<boolean> => {
  try {
    console.log('🔍 Testing API connection...');
    console.log('📍 API Base URL:', API_CONFIG.BASE_URL);
    
    // Utiliser l'endpoint /health à la racine du serveur
    const healthUrl = API_CONFIG.BASE_URL.replace('/api', '/health');
    console.log('🌐 Health URL:', healthUrl);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('⏰ Request timeout after 30 seconds');
      controller.abort();
    }, API_CONFIG.TIMEOUT);
    
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    console.log('📡 Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API connection successful:', data);
      return true;
    }
    
    console.log('❌ API response not OK:', response.status, response.statusText);
    return false;
  } catch (error: any) {
    console.error('❌ API connection test failed:', error);
    console.error('🔍 Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
    });
    return false;
  }
};

// Hook pour gérer les erreurs API dans les composants
export const handleApiError = (error: any): string => {
  if (error instanceof ApiError) {
    return error.message;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'Une erreur inattendue s\'est produite';
};