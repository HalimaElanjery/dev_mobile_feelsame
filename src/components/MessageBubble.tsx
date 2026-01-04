/**
 * Composant MessageBubble
 * Bulle de message pour le chat anonyme
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MessageBubbleProps {
  content: string;
  isOwnMessage: boolean;
  createdAt: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  content,
  isOwnMessage,
  createdAt,
}) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View
      style={[
        styles.container,
        isOwnMessage ? styles.containerRight : styles.containerLeft,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isOwnMessage ? styles.bubbleOwn : styles.bubbleOther,
        ]}
      >
        <Text
          style={[
            styles.text,
            isOwnMessage ? styles.textOwn : styles.textOther,
          ]}
        >
          {content}
        </Text>
        <Text
          style={[
            styles.time,
            isOwnMessage ? styles.timeOwn : styles.timeOther,
          ]}
        >
          {formatTime(createdAt)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    maxWidth: '75%',
  },
  containerLeft: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  containerRight: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  bubble: {
    padding: 12,
    borderRadius: 16,
  },
  bubbleOwn: {
    backgroundColor: '#2196f3',
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: '#f0f0f0',
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 16,
    lineHeight: 20,
  },
  textOwn: {
    color: '#fff',
  },
  textOther: {
    color: '#333',
  },
  time: {
    fontSize: 10,
    marginTop: 4,
  },
  timeOwn: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  timeOther: {
    color: '#999',
  },
});

