/**
 * Configuration API - Modifiez cette configuration selon votre environnement
 */

import { Platform } from 'react-native';

// 🔧 CONFIGURATION MANUELLE - Modifiez selon votre environnement
interface ManualConfig {
  IOS_URL: string;
  ANDROID_URL: string;
  PHYSICAL_DEVICE_URL: string;
  FORCE_URL?: string;
}

const MANUAL_CONFIG: ManualConfig = {
  // Pour iOS Simulator ET Expo Go sur IP réseau
  IOS_URL: 'http://192.168.1.5:3000/api',

  // Pour émulateur Android
  ANDROID_URL: 'http://192.168.1.5:3000/api',

  // Pour appareil physique (remplacez par l'IP de votre machine)
  PHYSICAL_DEVICE_URL: 'http://192.168.1.5:3000/api',

  // Pour forcer une URL spécifique (décommentez pour utiliser)
  // FORCE_URL: 'http://localhost:3000/api',
};

/**
 * Obtient l'URL de base de l'API selon l'environnement
 */
export const getApiBaseUrl = (): string => {
  // Si une URL forcée est définie, l'utiliser
  if (MANUAL_CONFIG.FORCE_URL) {
    console.log('🔧 Using forced API URL:', MANUAL_CONFIG.FORCE_URL);
    return MANUAL_CONFIG.FORCE_URL;
  }

  if (__DEV__) {
    // Configuration automatique selon la plateforme
    if (Platform.OS === 'android') {
      // Détecter si c'est un émulateur ou un appareil physique
      const isEmulator = Platform.constants?.Brand === 'google' ||
        Platform.constants?.Model?.includes('sdk') ||
        Platform.constants?.Model?.includes('Emulator');

      if (isEmulator) {
        console.log('🤖 Android Emulator detected, using 10.0.2.2');
        return 'http://10.0.2.2:3000/api';
      } else {
        console.log('🤖 Android Physical Device detected, using:', MANUAL_CONFIG.ANDROID_URL);
        return MANUAL_CONFIG.ANDROID_URL;
      }
    } else if (Platform.OS === 'ios') {
      console.log('🍎 iOS detected, using:', MANUAL_CONFIG.IOS_URL);
      return MANUAL_CONFIG.IOS_URL;
    } else if (Platform.OS === 'web') {
      console.log('🌐 Web detected, using localhost');
      return 'http://localhost:3000/api';
    } else {
      console.log('💻 Other platform, using:', MANUAL_CONFIG.PHYSICAL_DEVICE_URL);
      return MANUAL_CONFIG.PHYSICAL_DEVICE_URL;
    }
  }

  // Production
  return 'https://your-production-api.com/api';
};

/**
 * Configuration API complète
 */
export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  TIMEOUT: 30000, // 30 secondes
  RETRY_ATTEMPTS: 3,
};

/**
 * URLs de test pour diagnostic
 */
export const TEST_URLS = {
  LOCAL_IP: 'http://192.168.1.10:3000/api',
  LOCALHOST: 'http://localhost:3000/api',
  ANDROID_EMULATOR: 'http://10.0.2.2:3000/api',
};

/**
 * Fonction pour tester différentes URLs
 */
export const testAllUrls = async (): Promise<void> => {
  console.log('🧪 Testing all possible API URLs...');

  for (const [name, url] of Object.entries(TEST_URLS)) {
    try {
      const healthUrl = url.replace('/api', '/health');
      console.log(`Testing ${name}: ${healthUrl}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(healthUrl, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        console.log(`✅ ${name} works: ${url}`);
      } else {
        console.log(`❌ ${name} failed: ${response.status}`);
      }
    } catch (error: any) {
      console.log(`❌ ${name} error:`, error.message);
    }
  }
};