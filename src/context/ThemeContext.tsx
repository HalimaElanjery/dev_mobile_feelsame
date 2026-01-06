/**
 * Contexte de thème
 * Gère le mode sombre/clair de l'application
 */

import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { getItem, setItem } from '../services/storage';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeColors {
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  primary: string;
  primaryLight: string;
  secondary: string;
  border: string;
  shadow: string;
  success: string;
  error: string;
  gradientStart: string;
  gradientEnd: string;
}

const lightTheme: ThemeColors = {
  background: '#F7F9FC', // Très léger bleu gris pour la douceur
  surface: '#FFFFFF',
  card: '#FFFFFF',
  text: '#1A1B2D', // Bleu nuit très foncé (plus doux que noir pur)
  textSecondary: '#6E7A92',
  primary: '#6C63FF', // Violet moderne "Mindfulness"
  primaryLight: '#F0F0FF',
  secondary: '#FF6584', // Corail pour l'action/émotion
  border: '#E8EFF5',
  shadow: '#1A1B2D',
  success: '#4ADE80',
  error: '#FF4757',
  gradientStart: '#6C63FF',
  gradientEnd: '#8F94FB',
};

const darkTheme: ThemeColors = {
  background: '#121216', // Noir profond mais pas absolu
  surface: '#1E1E24',
  card: '#24242C',
  text: '#F5F6FA',
  textSecondary: '#A4A6B3',
  primary: '#8F94FB', // Plus clair pour le dark mode
  primaryLight: '#1A1B2D', // Fond sombre teinté
  secondary: '#FF809D',
  border: '#2D2D3A',
  shadow: '#000000',
  success: '#2ECC71',
  error: '#FF6B6B',
  gradientStart: '#6C63FF',
  gradientEnd: '#4834D4',
};

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('auto');
  const [systemColorScheme, setSystemColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );

  useEffect(() => {
    // Charger le thème sauvegardé
    loadSavedTheme();

    // Écouter les changements du système
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemColorScheme(colorScheme);
    });

    return () => subscription?.remove();
  }, []);

  const loadSavedTheme = async () => {
    try {
      const savedTheme = await getItem('@feelsame:theme');
      if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
        setThemeState(savedTheme as Theme);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du thème:', error);
    }
  };

  const saveTheme = async (newTheme: Theme) => {
    try {
      await setItem('@feelsame:theme', newTheme);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du thème:', error);
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    saveTheme(newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'auto' : 'light';
    setTheme(newTheme);
  };

  const getEffectiveTheme = (): 'light' | 'dark' => {
    if (theme === 'auto') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return theme;
  };

  const isDark = getEffectiveTheme() === 'dark';
  const colors = isDark ? darkTheme : lightTheme;

  const value: ThemeContextType = {
    theme,
    colors,
    isDark,
    toggleTheme,
    setTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};