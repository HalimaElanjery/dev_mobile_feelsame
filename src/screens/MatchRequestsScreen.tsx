/**
 * Écran de gestion des demandes de discussion
 * Affiche les demandes reçues et permet d'accepter/refuser
 */

import React, { useEffect, useState } from 'react';
import {
    Alert,
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
import { useNotification } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import {
    acceptMatchRequest,
    declineMatchRequest,
    getMatchRequestsForUser,
    MatchRequest,
} from '../services/matchService';
import type { Note } from '../services/noteService';

interface MatchRequestsScreenProps {
  navigation: any;
}

interface MatchRequestWithNote extends MatchRequest {
  note?: Note;
}

export const MatchRequestsScreen: React.FC<MatchRequestsScreenProps> = ({
  navigation,
}) => {
  const [requests, setRequests] = useState<MatchRequestWithNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const { colors } = useTheme();
  const { showNotification } = useNotification();

  useEffect(() => {
    loadRequests();
    
    // Actualiser automatiquement toutes les 30 secondes
    const interval = setInterval(() => {
      if (!refreshing) {
        loadRequests();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadRequests = async () => {
    if (!user) return;

    try {
      const matchRequests = await getMatchRequestsForUser(user.id);
      
      // Les demandes contiennent déjà les informations de la note (emotion, situation, content)
      // grâce au JOIN dans l'API, pas besoin de charger séparément
      const requestsWithNotes: MatchRequestWithNote[] = matchRequests.map(request => ({
        ...request,
        note: {
          id: request.noteId,
          userId: request.fromUserId, // L'auteur de la note est celui qui envoie la demande
          emotion: request.emotion || '',
          situation: request.situation || '',
          content: request.content || '',
          createdAt: request.createdAt,
        }
      }));

      setRequests(requestsWithNotes);
    } catch (error) {
      console.error('Error loading match requests:', error);
      showNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de charger les demandes',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadRequests();
  };

  const handleAccept = async (request: MatchRequest) => {
    try {
      // Actualiser d'abord la liste des demandes pour s'assurer qu'elle est à jour
      await loadRequests();
      
      // Vérifier si la demande existe encore
      const updatedRequests = await getMatchRequestsForUser(user!.id);
      const currentRequest = updatedRequests.find(r => r.id === request.id);
      
      if (!currentRequest) {
        showNotification({
          type: 'info',
          title: 'Demande expirée',
          message: 'Cette demande n\'est plus disponible (expirée ou déjà traitée)',
        });
        // Recharger la liste pour supprimer les demandes obsolètes
        loadRequests();
        return;
      }

      if (currentRequest.status !== 'pending') {
        showNotification({
          type: 'info',
          title: 'Demande déjà traitée',
          message: 'Cette demande a déjà été acceptée ou refusée',
        });
        loadRequests();
        return;
      }

      const discussion = await acceptMatchRequest(request.id);
      
      showNotification({
        type: 'success',
        title: 'Discussion créée',
        message: 'Vous pouvez maintenant discuter en privé (2h)',
      });

      // Naviguer vers la discussion privée
      navigation.navigate('PrivateChat', { discussionId: discussion.id });
      
      // Recharger les demandes
      loadRequests();
    } catch (error: any) {
      console.error('Accept request error:', error);
      
      // Gestion spécifique des erreurs
      if (error.message && error.message.includes('non trouvée')) {
        showNotification({
          type: 'info',
          title: 'Demande expirée',
          message: 'Cette demande n\'est plus disponible. La liste a été actualisée.',
        });
        // Recharger pour nettoyer l'affichage
        loadRequests();
      } else {
        showNotification({
          type: 'error',
          title: 'Erreur',
          message: error.message || 'Impossible d\'accepter la demande',
        });
      }
    }
  };

  const handleDecline = async (request: MatchRequest) => {
    Alert.alert(
      'Refuser la demande',
      'Êtes-vous sûr de vouloir refuser cette demande de discussion ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Refuser',
          style: 'destructive',
          onPress: async () => {
            try {
              await declineMatchRequest(request.id);
              
              showNotification({
                type: 'info',
                title: 'Demande refusée',
                message: 'La demande a été refusée',
              });

              loadRequests();
            } catch (error: any) {
              showNotification({
                type: 'error',
                title: 'Erreur',
                message: error.message || 'Impossible de refuser la demande',
              });
            }
          },
        },
      ]
    );
  };

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const remaining = expires.getTime() - now.getTime();
    
    if (remaining <= 0) return 'Expirée';
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}min restantes`;
    }
    return `${minutes}min restantes`;
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LoadingSpinner text="Chargement des demandes..." />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          Demandes de discussion
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {requests.length} demande{requests.length > 1 ? 's' : ''} en attente
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {requests.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Aucune demande de discussion
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Les demandes apparaîtront ici quand quelqu'un voudra discuter avec vous
            </Text>
          </View>
        ) : (
          requests.map((request, index) => (
            <AnimatedCard
              key={request.id}
              animation="fadeInUp"
              delay={index * 100}
              style={{ backgroundColor: colors.surface }}
            >
              <View style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <Text style={[styles.requestTitle, { color: colors.text }]}>
                    Demande de discussion
                  </Text>
                  <Text style={[styles.timeRemaining, { color: colors.textSecondary }]}>
                    {formatTimeRemaining(request.expiresAt)}
                  </Text>
                </View>

                {request.note && (
                  <View style={styles.notePreview}>
                    <Text style={[styles.noteLabel, { color: colors.textSecondary }]}>
                      À propos de votre note :
                    </Text>
                    <Text
                      style={[styles.noteContent, { color: colors.text }]}
                      numberOfLines={2}
                    >
                      "{request.note.content}"
                    </Text>
                  </View>
                )}

                {request.message && (
                  <View style={styles.messageContainer}>
                    <Text style={[styles.messageLabel, { color: colors.textSecondary }]}>
                      Message :
                    </Text>
                    <Text style={[styles.messageText, { color: colors.text }]}>
                      "{request.message}"
                    </Text>
                  </View>
                )}

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.declineButton, { borderColor: colors.textSecondary }]}
                    onPress={() => handleDecline(request)}
                  >
                    <Text style={[styles.declineButtonText, { color: colors.textSecondary }]}>
                      Refuser
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.acceptButton, { backgroundColor: colors.primary }]}
                    onPress={() => handleAccept(request)}
                  >
                    <Text style={styles.acceptButtonText}>Accepter</Text>
                  </TouchableOpacity>
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
  requestCard: {
    padding: 4,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  timeRemaining: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  notePreview: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  noteLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  noteContent: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  messageContainer: {
    marginBottom: 16,
  },
  messageLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  declineButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  declineButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  acceptButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});