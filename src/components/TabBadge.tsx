/**
 * Composant de badge pour les onglets
 * Affiche un nombre ou un indicateur sur les icônes des onglets
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface TabBadgeProps {
  count?: number;
  show?: boolean;
  color?: string;
}

export const TabBadge: React.FC<TabBadgeProps> = ({ 
  count = 0, 
  show = false, 
  color = '#FF3B30' 
}) => {
  if (!show || count === 0) {
    return null;
  }

  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.badgeText}>
        {count > 99 ? '99+' : count.toString()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
});