/**
 * Composant Card animé
 * Carte avec animations d'entrée et d'interaction
 */

import React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { createShadowStyle } from '../utils/platformStyles';

interface AnimatedCardProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  animation?: 'fadeIn' | 'fadeInUp' | 'fadeInDown' | 'slideInLeft' | 'slideInRight' | 'zoomIn';
  style?: ViewStyle;
  onPress?: () => void;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  delay = 0,
  duration = 500,
  animation = 'fadeInUp',
  style,
  onPress,
}) => {
  const CardComponent = onPress ? TouchableOpacity : View;
  
  return (
    <Animatable.View
      animation={animation}
      duration={duration}
      delay={delay}
      style={[styles.card, style]}
    >
      <CardComponent onPress={onPress} style={onPress ? {} : undefined}>
        {children}
      </CardComponent>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...createShadowStyle(),
  },
});

