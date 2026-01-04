/**
 * Composant Timer
 * Affiche le temps restant avant expiration d'une discussion
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface TimerProps {
  expiresAt: string;
  onExpire?: () => void;
}

export const Timer: React.FC<TimerProps> = ({ expiresAt, onExpire }) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const expiration = new Date(expiresAt);
      const remaining = expiration.getTime() - now.getTime();
      return remaining > 0 ? remaining : 0;
    };

    setTimeRemaining(calculateTimeRemaining());

    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        if (onExpire) {
          onExpire();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getColor = (): string => {
    const minutes = Math.floor(timeRemaining / 60000);
    if (minutes < 5) return '#e74c3c'; // Rouge si moins de 5 minutes
    if (minutes < 10) return '#f39c12'; // Orange si moins de 10 minutes
    return '#27ae60'; // Vert sinon
  };

  return (
    <View style={styles.container}>
      <View style={[styles.timerBox, { borderColor: getColor() }]}>
        <Text style={[styles.timerText, { color: getColor() }]}>
          {formatTime(timeRemaining)}
        </Text>
        <Text style={styles.label}>Temps restant</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 16,
  },
  timerBox: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    minWidth: 120,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  timerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});

