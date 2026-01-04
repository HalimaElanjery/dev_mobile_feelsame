/**
 * Point d'entrée principal de l'application
 * Configure les providers et le navigateur
 */

import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { AuthProvider } from './src/context/AuthContext';
import { EmotionProvider } from './src/context/EmotionContext';
import { NotificationProvider } from './src/context/NotificationContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { testApiConnection } from './src/services/api';
import { socketService } from './src/services/socketService';

export default function App() {
  // Initialiser les services au démarrage
  useEffect(() => {
    const initializeApp = async () => {
      console.log('🚀 Initializing FeelSame app...');
      
      // Attendre un peu pour que l'app soit complètement chargée
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          console.log(`🔄 API connection attempt ${retryCount + 1}/${maxRetries}`);
          
          // Tester la connexion à l'API
          const apiConnected = await testApiConnection();
          if (apiConnected) {
            console.log('✅ API connection successful');
            
            // Initialiser la connexion Socket.IO
            await socketService.connect();
            break; // Sortir de la boucle si succès
          } else {
            console.warn(`⚠️ API connection attempt ${retryCount + 1} failed`);
          }
        } catch (error) {
          console.error(`❌ App initialization error (attempt ${retryCount + 1}):`, error);
        }
        
        retryCount++;
        if (retryCount < maxRetries) {
          console.log(`⏳ Retrying in 3 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
      
      if (retryCount >= maxRetries) {
        console.warn('⚠️ All API connection attempts failed - running in offline mode');
      }
    };

    initializeApp();

    // Nettoyer lors de la fermeture de l'app
    return () => {
      socketService.disconnect();
    };
  }, []);

  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <EmotionProvider>
            <AppNavigator />
            <StatusBar style="auto" />
          </EmotionProvider>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

