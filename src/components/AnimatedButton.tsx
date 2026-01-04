/**
 * Composant Button animé avec react-native-animatable
 * Bouton avec animations professionnelles
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import * as Animatable from 'react-native-animatable';

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  animation?: 'pulse' | 'bounce' | 'shake' | 'fadeIn' | 'slideInUp';
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
  textStyle,
  animation = 'pulse',
}) => {
  const buttonRef = React.useRef<any>(null);

  const handlePress = () => {
    if (buttonRef.current) {
      buttonRef.current[animation](300);
    }
    onPress();
  };

  return (
    <Animatable.View
      ref={buttonRef}
      animation="fadeInUp"
      duration={500}
      style={style}
    >
      <TouchableOpacity
        style={[
          styles.button,
          styles[variant],
          disabled && styles.disabled,
        ]}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <Text style={[styles.text, styles[`${variant}Text`], textStyle]}>
          {title}
        </Text>
      </TouchableOpacity>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  primary: {
    backgroundColor: '#2196f3',
  },
  secondary: {
    backgroundColor: '#9c27b0',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#2196f3',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: '#fff',
  },
  secondaryText: {
    color: '#fff',
  },
  outlineText: {
    color: '#2196f3',
  },
});

