/**
 * Contexte d'authentification
 * Gère l'état de l'utilisateur connecté et les fonctions d'authentification
 */

import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { User, getCurrentUser, login as loginService, logout as logoutService, register as registerService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Vérifier si un utilisateur est déjà connecté au démarrage
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await loginService(email, password);
      if (result.success && result.user) {
        setUser(result.user);
        
        // Connecter le socket après une connexion réussie
        try {
          const { socketService } = await import('../services/socketService');
          await socketService.connect();
        } catch (socketError) {
          console.error('Socket connection error after login:', socketError);
        }
      }
      return result;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Erreur lors de la connexion' };
    }
  };

  const register = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await registerService(email, password);
      return result;
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: 'Erreur lors de l\'inscription' };
    }
  };

  const logout = async (): Promise<void> => {
    console.log('🔴 AuthContext logout function called');
    try {
      console.log('🔄 Calling logout service...');
      await logoutService();
      console.log('✅ Logout service completed');
      
      console.log('🔄 Setting user to null...');
      setUser(null);
      console.log('✅ User set to null');
      
      // Déconnecter le socket lors de la déconnexion
      console.log('🔄 Disconnecting socket...');
      const { socketService } = await import('../services/socketService');
      socketService.disconnect();
      console.log('✅ Socket disconnected');
      
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Même en cas d'erreur, déconnecter le socket et réinitialiser l'utilisateur
      console.log('🔄 Error occurred, cleaning up anyway...');
      setUser(null);
      try {
        const { socketService } = await import('../services/socketService');
        socketService.disconnect();
        console.log('✅ Socket disconnected after error');
      } catch (socketError) {
        console.error('❌ Socket disconnect error:', socketError);
      }
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

