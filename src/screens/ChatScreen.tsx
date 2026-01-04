/**
 * Écran de discussion collective
 * Chat anonyme temporaire avec timer
 */

import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Input } from '../components/Input';
import { MessageBubble } from '../components/MessageBubble';
import { ParticipantCounter } from '../components/ParticipantCounter';
import { Timer } from '../components/Timer';
import { TypingIndicator } from '../components/TypingIndicator';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import type { Discussion, Message } from '../services/discussionService';
import {
    addMessage,
    getDiscussionById,
    getMessagesByDiscussion,
    getTimeRemaining,
} from '../services/discussionService';
import { socketService } from '../services/socketService';

interface ChatScreenProps {
  navigation: any;
  route: any;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ navigation, route }) => {
  const { discussionId } = route.params;
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [participantCount, setParticipantCount] = useState(1);
  const scrollViewRef = useRef<ScrollView>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { user } = useAuth();
  const { colors } = useTheme();
  const { showNotification } = useNotification();

  useEffect(() => {
    loadDiscussion();
    loadMessages();
    
    // Rejoindre la discussion Socket.IO
    socketService.joinDiscussion(discussionId);
    
    // Écouter les nouveaux messages en temps réel
    const unsubscribeMessage = socketService.onMessage((message: Message) => {
      if (message.discussionId === discussionId) {
        setMessages(prev => {
          // Éviter les doublons
          if (prev.some(m => m.id === message.id)) {
            return prev;
          }
          return [...prev, message].sort((a, b) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });
      }
    });
    
    // Écouter les indicateurs de frappe
    const unsubscribeTyping = socketService.onTyping((data: { userId: string; isTyping: boolean }) => {
      if (data.userId !== user?.id) {
        setTypingUsers(prev => {
          if (data.isTyping) {
            return [...prev.filter(id => id !== data.userId), data.userId];
          } else {
            return prev.filter(id => id !== data.userId);
          }
        });
      }
    });
    
    // Vérifier l'expiration périodiquement (moins fréquent)
    const interval = setInterval(() => {
      checkExpiration();
      updateParticipantCount();
    }, 10000); // Toutes les 10 secondes au lieu de 2

    return () => {
      clearInterval(interval);
      socketService.leaveDiscussion(discussionId);
      unsubscribeMessage();
      unsubscribeTyping();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [discussionId, user?.id]);

  const loadDiscussion = async () => {
    try {
      const disc = await getDiscussionById(discussionId);
      if (disc) {
        setDiscussion(disc);
      } else {
        Alert.alert('Discussion expirée', 'Cette discussion n\'est plus active', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      console.error('Error loading discussion:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const msgs = await getMessagesByDiscussion(discussionId);
      setMessages(msgs);
      setLoading(false);
      
      // Scroll vers le bas après un court délai
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const updateParticipantCount = () => {
    // Simuler le nombre de participants (en production, utiliser de vraies données)
    const uniqueUsers = new Set(messages.map(msg => msg.userId));
    setParticipantCount(Math.max(uniqueUsers.size, Math.floor(Math.random() * 5) + 1));
  };

  const checkExpiration = async () => {
    if (!discussion) return;
    
    const remaining = getTimeRemaining(discussion);
    if (remaining <= 0) {
      showNotification({
        type: 'warning',
        title: 'Discussion terminée',
        message: 'Cette discussion a expiré',
      });
      
      Alert.alert(
        'Discussion terminée',
        'Cette discussion a expiré. Vous allez être redirigé.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Feedback'),
          },
        ]
      );
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !user || !discussion) {
      return;
    }

    try {
      await addMessage(discussionId, user.id, messageText);
      setMessageText('');
      setIsTyping(false);
      loadMessages();
      
      showNotification({
        type: 'success',
        title: 'Message envoyé',
        message: 'Votre message a été partagé',
        duration: 1500,
      });
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'envoyer le message');
    }
  };

  const handleTextChange = (text: string) => {
    setMessageText(text);
    
    // Simuler l'indicateur de frappe
    if (text.length > 0 && !isTyping) {
      setIsTyping(true);
      setTypingUsers(['Quelqu\'un']);
    }
    
    // Reset du timer de frappe
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      setTypingUsers([]);
    }, 2000);
  };

  const handleExpire = () => {
    Alert.alert(
      'Discussion terminée',
      'Le temps est écoulé. Cette discussion est maintenant fermée.',
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Feedback'),
        },
      ]
    );
  };

  if (loading || !discussion) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Chargement...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Discussion anonyme
        </Text>
        <ParticipantCounter count={participantCount} />
        <Timer expiresAt={discussion.expiresAt} onExpire={handleExpire} />
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Aucun message pour le moment.
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Soyez le premier à partager !
            </Text>
          </View>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              content={message.content}
              isOwnMessage={message.userId === user?.id}
              createdAt={message.createdAt}
            />
          ))
        )}
      </ScrollView>

      {typingUsers.length > 0 && (
        <TypingIndicator users={typingUsers} />
      )}

      <View style={[styles.inputContainer, { backgroundColor: colors.surface }]}>
        <View style={styles.inputWrapper}>
          <Input
            value={messageText}
            onChangeText={handleTextChange}
            placeholder="Écrivez votre message..."
            multiline
            numberOfLines={2}
            autoCapitalize="sentences"
          />
        </View>
        <TouchableOpacity
          style={[
            styles.sendButton,
            { backgroundColor: colors.primary },
            !messageText.trim() && styles.sendButtonDisabled
          ]}
          onPress={handleSendMessage}
          disabled={!messageText.trim()}
        >
          <Text style={styles.sendButtonText}>Envoyer</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
  },
  inputContainer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  inputWrapper: {
    flex: 1,
  },
  sendButton: {
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

