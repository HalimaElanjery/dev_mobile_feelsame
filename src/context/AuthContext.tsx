/**
 * Contexte d'authentification (Firebase + Google)
 * Gère l'état de l'utilisateur connecté et les fonctions d'authentification
 */

import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import {
  User as FirebaseUser,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';

import { auth } from '../config/firebase';
import { apiGet, removeAuthToken, setAuthToken } from '../services/api';
import { User } from '../services/authService';

WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Configuration Google Auth
  // IMPORTANT: Vous devez remplacer le 'webClientId' par celui de votre console Google Cloud / Firebase
  // Pour Expo Go, le 'webClientId' est souvent suffisant.
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '314586571310-pgvdn8kpr75u8eublf74quln2cnj46sa.apps.googleusercontent.com',
    webClientId: '314586571310-pgvdn8kpr75u8eublf74quln2cnj46sa.apps.googleusercontent.com',
  });

  // Gérer la réponse de la connexion Google
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);

      console.log('🌍 Google Sign-In success, signing in to Firebase...');

      signInWithCredential(auth, credential)
        .catch(error => {
          console.error('🔥 Firebase Google Sign-In Error:', error);
          Alert.alert('Erreur', 'Impossible de se connecter avec Google: ' + error.message);
        });
    }
  }, [response]);

  // Écouter les changements d'état Firebase (Global)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      try {
        if (firebaseUser) {
          console.log('🔥 Firebase User detected:', firebaseUser.email, firebaseUser.uid);

          // 1. Récupérer le token
          const token = await firebaseUser.getIdToken();
          await setAuthToken(token);

          // 2. Synchroniser avec le backend et récupérer le profil complet (UUID)
          try {
            const response = await apiGet<{ data: User }>('/auth/me');
            if (response.data) {
              setUser(response.data);

              // 3. Connecter le socket
              try {
                const { socketService } = await import('../services/socketService');
                await socketService.connect();
              } catch (socketError) {
                console.error('Socket connection error:', socketError);
              }
            } else {
              // Should not happen if backend autocreates user
              console.warn('Backend returned no user data');
            }
          } catch (apiError) {
            console.error('Error fetching user profile from backend:', apiError);
            // On garde quand même l'utilisateur Firebase "connecté" techniquement, 
            // mais l'app pourrait ne pas fonctionner correctement sans l'UUID du backend.
            // On peut décider de logout ici ou de retry.
            setUser(null);
          }

        } else {
          console.log('👤 No Firebase User');
          await removeAuthToken();
          setUser(null);

          // Déconnecter le socket
          try {
            const { socketService } = await import('../services/socketService');
            socketService.disconnect();
          } catch (socketError) {
            console.error('Socket disconnect error:', socketError);
          }
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error: any) {
      console.error('Firebase Login error:', error);
      let errorMessage = 'Erreur lors de la connexion';
      if (error.code === 'auth/invalid-email') errorMessage = 'Email invalide';
      if (error.code === 'auth/user-disabled') errorMessage = 'Utilisateur désactivé';
      if (error.code === 'auth/user-not-found') errorMessage = 'Utilisateur non trouvé';
      if (error.code === 'auth/wrong-password') errorMessage = 'Mot de passe incorrect';
      if (error.code === 'auth/invalid-credential') errorMessage = 'Identifiants invalides';
      return { success: false, error: errorMessage };
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    console.log('🔵 loginWithGoogle called');

    // Gestion spécifique Web : Utiliser le SDK Firebase JS natif (Popup/Redirect)
    // C'est beaucoup plus fiable sur web que expo-auth-session
    if (Platform.OS === 'web') {
      try {
        console.log('🔵 Platform is Web, attempting signInWithPopup...');
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        console.log('✅ Google Sign-In Success:', result.user.email);

        // Le useEffect global onAuthStateChanged détectera la connexion
        return { success: true };
      } catch (error: any) {
        console.error('❌ Web Google Sign-In Error:', error);
        return { success: false, error: error.message };
      }
    }

    // Gestion Native (iOS/Android) : Utiliser expo-auth-session
    try {
      if (!request) {
        return { success: false, error: 'Google Auth non initialisé. Vérifiez la configuration.' };
      }
      await promptAsync();
      return { success: true };
    } catch (error: any) {
      console.error('Google Login prompt error:', error);
      return { success: false, error: error.message };
    }
  };

  const register = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error: any) {
      console.error('Firebase Register error:', error);
      let errorMessage = 'Erreur lors de l\'inscription';
      if (error.code === 'auth/email-already-in-use') errorMessage = 'Cet email est déjà utilisé';
      if (error.code === 'auth/invalid-email') errorMessage = 'Email invalide';
      if (error.code === 'auth/weak-password') errorMessage = 'Mot de passe trop faible';
      return { success: false, error: errorMessage };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    loginWithGoogle,
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

