/**
 * Composant ReactionBar
 * Système de réactions pour les notes
 */

import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Animatable from 'react-native-animatable';

interface ReactionBarProps {
  noteId: string;
  reactions?: { [key: string]: number };
  onReaction?: (emoji: string) => void;
}

export const ReactionBar: React.FC<ReactionBarProps> = ({
  noteId,
  reactions = {},
  onReaction,
}) => {
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  
  const reactionEmojis = [
    { emoji: '❤️', label: 'Soutien' },
    { emoji: '🤗', label: 'Réconfort' },
    { emoji: '💪', label: 'Force' },
    { emoji: '🙏', label: 'Gratitude' },
    { emoji: '✨', label: 'Espoir' },
  ];

  const handleReaction = async (emoji: string) => {
    // Feedback haptique
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    setSelectedReaction(selectedReaction === emoji ? null : emoji);
    onReaction?.(emoji);
  };

  return (
    <View style={styles.reactionBar}>
      {reactionEmojis.map(({ emoji, label }, index) => {
        const count = reactions[emoji] || 0;
        const isSelected = selectedReaction === emoji;
        
        return (
          <Animatable.View
            key={emoji}
            animation="fadeInUp"
            delay={index * 50}
          >
            <TouchableOpacity
              style={[
                styles.reactionButton,
                isSelected && styles.reactionSelected
              ]}
              onPress={() => handleReaction(emoji)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.reactionEmoji,
                isSelected && styles.reactionEmojiSelected
              ]}>
                {emoji}
              </Text>
              {count > 0 && (
                <Text style={styles.reactionCount}>{count}</Text>
              )}
            </TouchableOpacity>
          </Animatable.View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  reactionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    marginTop: 8,
  },
  reactionButton: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 16,
    minWidth: 40,
  },
  reactionSelected: {
    backgroundColor: '#e3f2fd',
    transform: [{ scale: 1.1 }],
  },
  reactionEmoji: {
    fontSize: 18,
    marginBottom: 2,
  },
  reactionEmojiSelected: {
    transform: [{ scale: 1.2 }],
  },
  reactionCount: {
    fontSize: 10,
    color: '#666',
    fontWeight: '600',
  },
});