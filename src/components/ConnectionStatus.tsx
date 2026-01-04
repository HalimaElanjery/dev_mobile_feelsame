/**
 * Composant ConnectionStatus
 * Indicateur de statut de connexion
 */

import React, { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import * as Animatable from 'react-native-animatable';

export const ConnectionStatus: React.FC = () => {
  const [isConnected, setIsConnected] = useState(true);

  // Simulation du statut de connexion
  // En production, utiliser @react-native-netinfo/netinfo
  useEffect(() => {
    // Simuler une vérification de connexion
    const checkConnection = () => {
      // Ici vous pourriez vérifier la vraie connectivité
      setIsConnected(Math.random() > 0.1); // 90% de chance d'être connecté
    };

    const interval = setInterval(checkConnection, 10000); // Vérifier toutes les 10 secondes
    return () => clearInterval(interval);
  }, []);

  if (isConnected) {
    return null;
  }

  return (
    <Animatable.View animation="slideInDown" style={styles.offlineBar}>
      <Text style={styles.offlineText}>📡 Mode hors ligne</Text>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  offlineBar: {
    backgroundColor: '#f39c12',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  offlineText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});