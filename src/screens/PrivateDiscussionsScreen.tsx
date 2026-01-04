/**
 * Écran de liste des discussions privées actives
 * Affiche toutes les discussions privées de l'utilisateur
 */

import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AnimatedCard } from '../components/AnimatedCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  getPrivateDiscussionsForUser,
  getPrivateMessagesByDiscussion,
  PrivateDiscussion,
} from '../services/matchService';
import type { Note } from '../services/noteService';

interface PrivateDiscussionsScreenProps {
  navigation: any;
}

interface DiscussionWithDetails extends PrivateDiscussion {
  note?: Note;
  lastMessage?: string;
  messageCount: number;
}

export const PrivateDiscussionsScreen: React.FC<PrivateDiscussionsScreenProps> = ({
  navigation,
}) => {
  const [discussions, setDiscussions] = useState<DiscussionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { colors } = useTheme();

  useFocusEffect(
    useCallback(() => {
      loadDiscussions();
    }, [user?.id])
  );

  const loadDiscussions = async () => {
    if (!user) return;
    setError(null);

    try {
      const privateDiscussions = await getPrivateDiscussionsForUser(user.id);

      // Enrichir chaque discussion avec des détails
      const discussionsWithDetails: DiscussionWithDetails[] = [];

      for (const discussion of privateDiscussions) {
        // Optimisation : Utiliser les données de la note déjà renvoyées par l'API (évite le N+1 et les soucis de droits)
        // Le backend renvoie déjà emotion, situation, content via le JOIN

        let note: Note | undefined;
        if (discussion.content) {
          note = {
            id: discussion.noteId,
            userId: discussion.user1Id, // Suppose que user1 est l'auteur (simplification valide ici)
            emotion: discussion.emotion || 'neutre',
            situation: discussion.situation || '',
            content: discussion.content || '',
            createdAt: discussion.createdAt,
            isActive: true,
            isAnonymous: true // Par défaut
          };
        }

        // Charger les messages pour avoir le dernier message et le compte
        try {
          const messages = await getPrivateMessagesByDiscussion(discussion.id);
          const lastMessage = messages.length > 0 ? messages[messages.length - 1].content : undefined;

          discussionsWithDetails.push({
            ...discussion,
            note,
            lastMessage,
            messageCount: messages.length,
          });
        } catch (innerError) {
          console.error('Error loading messages for discussion:', discussion.id, innerError);
          // On ajoute quand même la discussion même si on n'a pas tous les détails
          discussionsWithDetails.push({
            ...discussion,
            note,
            messageCount: 0
          });
        }
      }

      // Trier par date de création (plus récentes en premier)
      discussionsWithDetails.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setDiscussions(discussionsWithDetails);
    } catch (error: any) {
      console.error('Error loading private discussions:', error);
      setError('Impossible de charger les discussions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDiscussions();
  };

  const handleDiscussionPress = (discussion: PrivateDiscussion) => {
    navigation.navigate('PrivateChat', { discussionId: discussion.id });
  };

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const remaining = expires.getTime() - now.getTime();

    if (remaining <= 0) return 'Expirée';

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffHours < 1) return 'Il y a moins d\'1h';
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    return date.toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LoadingSpinner text="Chargement des discussions..." />
      </View>
    );
  }

  if (error && discussions.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Text style={{ fontSize: 40, marginBottom: 20 }}>⚠️</Text>
        <Text style={{ color: colors.text, fontSize: 16, textAlign: 'center', marginBottom: 20 }}>
          {error}
        </Text>
        <TouchableOpacity
          style={{ backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }}
          onPress={() => { setLoading(true); loadDiscussions(); }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          Discussions privées
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {discussions.length} discussion{discussions.length > 1 ? 's' : ''} active{discussions.length > 1 ? 's' : ''}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {discussions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Aucune discussion privée
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Demandez une discussion sur une note qui vous intéresse pour commencer
            </Text>
          </View>
        ) : (
          discussions.map((discussion, index) => (
            <AnimatedCard
              key={discussion.id}
              animation="fadeInUp"
              delay={index * 100}
              style={{ backgroundColor: colors.surface }}
              onPress={() => handleDiscussionPress(discussion)}
            >
              <View style={styles.discussionCard}>
                <View style={styles.discussionHeader}>
                  <View style={styles.discussionInfo}>
                    <Text style={[styles.discussionTitle, { color: colors.text }]}>
                      Discussion privée
                    </Text>
                    <Text style={[styles.discussionDate, { color: colors.textSecondary }]}>
                      {formatDate(discussion.createdAt)}
                    </Text>
                  </View>
                  <View style={styles.discussionStatus}>
                    <Text style={[styles.timeRemaining, { color: colors.primary }]}>
                      ⏱️ {formatTimeRemaining(discussion.expiresAt)}
                    </Text>
                    <Text style={[styles.messageCount, { color: colors.textSecondary }]}>
                      {discussion.messageCount} message{discussion.messageCount > 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>

                {discussion.note && (
                  <View style={[styles.notePreview, { backgroundColor: colors.primaryLight }]}>
                    <Text style={[styles.noteLabel, { color: colors.primary }]}>
                      💡 Note originale :
                    </Text>
                    <Text
                      style={[styles.noteContent, { color: colors.primary }]}
                      numberOfLines={2}
                    >
                      "{discussion.note.content}"
                    </Text>
                  </View>
                )}

                {discussion.lastMessage && (
                  <View style={styles.lastMessageContainer}>
                    <Text style={[styles.lastMessageLabel, { color: colors.textSecondary }]}>
                      Dernier message :
                    </Text>
                    <Text
                      style={[styles.lastMessageText, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {discussion.lastMessage}
                    </Text>
                  </View>
                )}

                <View style={styles.discussionFooter}>
                  <Text style={[styles.tapHint, { color: colors.textSecondary }]}>
                    Appuyez pour continuer la discussion
                  </Text>
                  <Text style={styles.arrow}>→</Text>
                </View>
              </View>
            </AnimatedCard>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    padding: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  discussionCard: {
    padding: 4,
  },
  discussionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  discussionInfo: {
    flex: 1,
  },
  discussionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  discussionDate: {
    fontSize: 12,
  },
  discussionStatus: {
    alignItems: 'flex-end',
  },
  timeRemaining: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  messageCount: {
    fontSize: 11,
  },
  notePreview: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  noteLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  noteContent: {
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  lastMessageContainer: {
    marginBottom: 12,
  },
  lastMessageLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  lastMessageText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  discussionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  tapHint: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  arrow: {
    fontSize: 16,
    color: '#2196f3',
  },
});