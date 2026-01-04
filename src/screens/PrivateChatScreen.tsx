/**
 * Écran de discussion privée entre deux utilisateurs
 * Chat privé temporaire de 2 heures
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
import { LoadingSpinner } from '../components/LoadingSpinner';
import { MessageBubble } from '../components/MessageBubble';
import { Timer } from '../components/Timer';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import {
  addPrivateMessage,
  getPrivateDiscussionById,
  getPrivateMessagesByDiscussion,
  PrivateDiscussion,
  PrivateMessage,
} from '../services/matchService';
import type { Note } from '../services/noteService';
import { getNoteById } from '../services/noteService';
import { useSocket } from '../services/socketService';

interface PrivateChatScreenProps {
  navigation: any;
  route: any;
}

export const PrivateChatScreen: React.FC<PrivateChatScreenProps> = ({
  navigation,
  route,
}) => {
  const { discussionId } = route.params;
  const [discussion, setDiscussion] = useState<PrivateDiscussion | null>(null);
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [originalNote, setOriginalNote] = useState<Note | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const { user } = useAuth();
  const { colors } = useTheme();
  const { showNotification } = useNotification();

  // Socket.IO Integration
  const {
    connect,
    joinDiscussion,
    leaveDiscussion,
    onPrivateMessage,
    isConnected
  } = useSocket();

  useEffect(() => {
    // 1. Charger les données initiales
    loadDiscussion();
    loadMessages();

    // 2. Connexion et Room
    connect();
    joinDiscussion(discussionId);

    // 3. Écouter les messages en temps réel
    const unsubscribe = onPrivateMessage((newMessage) => {
      console.log('⚡ Socket message received:', newMessage);
      if (newMessage.discussionId === discussionId) {
        setMessages(prev => {
          // Éviter les doublons (si le polling l'a déjà récupéré)
          if (prev.some(m => m.id === newMessage.id)) return prev;

          // Scroll auto
          setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
          return [...prev, newMessage];
        });
      }
    });

    // 4. Polling de secours (moins fréquent, 10s)
    const interval = setInterval(() => {
      loadMessages(true); // true = silent refresh
      checkExpiration();
    }, 10000);

    return () => {
      clearInterval(interval);
      unsubscribe();
      leaveDiscussion(discussionId);
    };
  }, [discussionId]);

  const loadDiscussion = async () => {
    if (!user) return;

    try {
      console.log('🔍 Loading discussion:', discussionId);
      const disc = await getPrivateDiscussionById(discussionId);

      console.log('🔍 Discussion loaded:', !!disc);

      if (disc) {
        setDiscussion(disc);

        try {
          const note = await getNoteById(disc.noteId);
          setOriginalNote(note);
        } catch (error) {
          console.error('Error loading original note:', error);
          setOriginalNote(null);
        }
      } else {
        console.log('❌ Discussion not found');
        Alert.alert('Discussion indisponible', 'Cette discussion n\'a pas été trouvée ou a expiré.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      console.error('Error loading private discussion:', error);
      Alert.alert('Erreur', 'Impossible de charger la discussion');
    }
  };

  const loadMessages = async (silent = false) => {
    try {
      const msgs = await getPrivateMessagesByDiscussion(discussionId);
      setMessages(msgs);

      if (!silent) {
        setLoading(false);
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (error) {
      console.error('Error loading private messages:', error);
      if (!silent) setLoading(false);
    }
  };

  const checkExpiration = () => {
    if (!discussion) return;

    const now = new Date();
    const expiresAt = new Date(discussion.expiresAt);

    if (now > expiresAt) {
      showNotification({
        type: 'warning',
        title: 'Discussion terminée',
        message: 'Cette discussion privée a expiré',
      });

      Alert.alert(
        'Discussion terminée',
        'Cette discussion privée a expiré (2h maximum).',
        [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]
      );
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !user || !discussion) {
      return;
    }

    try {
      // Envoyer via API (Socket émis par le serveur en réponse)
      await addPrivateMessage(discussionId, user.id, messageText);
      setMessageText('');

      // On recharge immédiatement pour voir son propre message
      // (En théorie le socket le renvoie aussi, mais c'est plus sûr pour l'UX immédiate)
      loadMessages(true);

    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'envoyer le message');
    }
  };

  const handleExpire = () => {
    Alert.alert(
      'Discussion terminée',
      'Le temps est écoulé. Cette discussion privée est maintenant fermée.',
      [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]
    );
  };

  if (loading && !discussion) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LoadingSpinner text="Chargement de la discussion..." />
      </View>
    );
  }

  if (!discussion) return null;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Discussion privée
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            🔒 Conversation anonyme et temporaire
          </Text>
        </View>
        <Timer expiresAt={discussion.expiresAt} onExpire={handleExpire} />
      </View>

      {originalNote && (
        <View style={[styles.noteContext, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.noteContextLabel, { color: colors.primary }]}>
            💡 À propos de cette note :
          </Text>
          <Text
            style={[styles.noteContextText, { color: colors.primary }]}
            numberOfLines={2}
          >
            "{originalNote.content}"
          </Text>
        </View>
      )}

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Début de votre discussion privée
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Vous avez 2 heures pour échanger en toute confidentialité
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

      <View style={[styles.inputContainer, { backgroundColor: colors.surface }]}>
        <View style={styles.inputWrapper}>
          <Input
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Message privé..."
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
  },
  headerContent: {
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  noteContext: {
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
  },
  noteContextLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  noteContextText: {
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 16,
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
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 18,
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