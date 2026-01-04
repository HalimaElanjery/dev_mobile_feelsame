/**
 * Composant NotificationContainer
 * Container pour afficher les notifications en overlay
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNotification } from '../context/NotificationContext';
import { NotificationBanner } from './NotificationBanner';

export const NotificationContainer: React.FC = () => {
  const { notifications, dismissNotification } = useNotification();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="box-none">
      {notifications.map((notification) => (
        <NotificationBanner
          key={notification.id}
          notification={notification}
          onDismiss={() => dismissNotification(notification.id)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingTop: 50, // Pour éviter la status bar
  },
});