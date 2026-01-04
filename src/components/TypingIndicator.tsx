/**
 * Composant TypingIndicator
 * Indicateur de frappe pour le chat
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as Animatable from 'react-native-animatable';

interface TypingIndicatorProps {
  users: string[];
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ users }) => {
  if (users.length === 0) {
    return null;
  }

  return (
    <Animatable.View animation="fadeIn" style={styles.container}>
      <View style={styles.typingDots}>
        <Animatable.View 
          animation="pulse" 
          iterationCount="infinite" 
          duration={1000}
          delay={0}
        >
          <Text style={styles.dot}>•</Text>
        </Animatable.View>
        <Animatable.View 
          animation="pulse" 
          iterationCount="infinite" 
          duration={1000}
          delay={200}
        >
          <Text style={styles.dot}>•</Text>
        </Animatable.View>
        <Animatable.View 
          animation="pulse" 
          iterationCount="infinite" 
          duration={1000}
          delay={400}
        >
          <Text style={styles.dot}>•</Text>
        </Animatable.View>
      </View>
      <Text style={styles.typingText}>
        {users.length} personne{users.length > 1 ? 's' : ''} en train d'écrire...
      </Text>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
  },
  typingDots: {
    flexDirection: 'row',
    marginRight: 8,
  },
  dot: {
    fontSize: 20,
    color: '#666',
    marginHorizontal: 1,
  },
  typingText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});