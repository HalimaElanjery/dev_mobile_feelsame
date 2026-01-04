/**
 * Composant ThemeToggle
 * Bouton pour changer de thème
 */

import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, isDark, toggleTheme } = useTheme();

  const handleToggle = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleTheme();
  };

  const getIcon = () => {
    switch (theme) {
      case 'light': return '☀️';
      case 'dark': return '🌙';
      case 'auto': return '🔄';
      default: return '☀️';
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'light': return 'Clair';
      case 'dark': return 'Sombre';
      case 'auto': return 'Auto';
      default: return 'Clair';
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handleToggle}>
      <Animatable.Text 
        animation="pulse"
        duration={300}
        style={styles.icon}
      >
        {getIcon()}
      </Animatable.Text>
      <Text style={styles.label}>{getLabel()}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  icon: {
    fontSize: 16,
    marginRight: 6,
  },
  label: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});