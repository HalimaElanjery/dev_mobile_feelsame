/**
 * Composant EmotionButton
 * Bouton pour sélectionner une émotion
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface EmotionButtonProps {
  emotion: string;
  emoji: string;
  onPress: () => void;
  isSelected: boolean;
}

export const EmotionButton: React.FC<EmotionButtonProps> = ({
  emotion,
  emoji,
  onPress,
  isSelected,
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, isSelected && styles.buttonSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.text, isSelected && styles.textSelected]}>
        {emotion}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  buttonSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
  },
  emoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  textSelected: {
    color: '#2196f3',
    fontWeight: '600',
  },
});

