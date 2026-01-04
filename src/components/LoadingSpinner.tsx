/**
 * Composant LoadingSpinner réutilisable
 * Indicateur de chargement avec animation
 */

import React from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import * as Animatable from 'react-native-animatable';

interface LoadingSpinnerProps {
  text?: string;
  size?: 'small' | 'large';
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  text = 'Chargement...',
  size = 'large',
  color = '#2196f3',
}) => {
  return (
    <Animatable.View animation="fadeIn" style={styles.container}>
      <ActivityIndicator size={size} color={color} />
      <Text style={styles.text}>{text}</Text>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});