/**
 * Composant ParticipantCounter
 * Compteur de participants dans le chat
 */

import React from 'react';
import { StyleSheet, Text } from 'react-native';
import * as Animatable from 'react-native-animatable';

interface ParticipantCounterProps {
  count: number;
}

export const ParticipantCounter: React.FC<ParticipantCounterProps> = ({ count }) => {
  return (
    <Animatable.View animation="fadeIn" style={styles.container}>
      <Text style={styles.icon}>👥</Text>
      <Text style={styles.text}>
        {count} participant{count > 1 ? 's' : ''}
      </Text>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'center',
    marginVertical: 8,
  },
  icon: {
    fontSize: 14,
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    color: '#2196f3',
    fontWeight: '600',
  },
});