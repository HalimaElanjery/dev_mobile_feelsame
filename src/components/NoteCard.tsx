/**
 * Composant NoteCard
 * Carte affichant une note émotionnelle anonyme avec réactions
 */

import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { createShadowStyle } from '../utils/platformStyles';
import { CommentsModal } from './CommentsModal';
import { DiscussButton } from './DiscussButton';
import { ReactionBar } from './ReactionBar';

interface NoteCardProps {
  id?: string;
  content: string;
  emotion: string;
  situation: string;
  createdAt: string;
  authorId?: string; // ID de l'auteur de la note
  reactions?: { [key: string]: number };
  onReaction?: (noteId: string, emoji: string) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  id = 'default',
  content,
  emotion,
  situation,
  createdAt,
  authorId,
  reactions = {},
  onReaction,
}) => {
  const [heartCount, setHeartCount] = useState(Math.floor(Math.random() * 20) + 1);
  const [isLiked, setIsLiked] = useState(false);
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);
  const { user } = useAuth();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR');
  };

  const handleLike = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsLiked(!isLiked);
    setHeartCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleShare = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await Share.share({
        message: `Une personne partage son ressenti sur FeelSame:\n\n"${content}"\n\n#${emotion} #${situation}`,
        title: 'Partage FeelSame',
      });
    } catch (error) {
      console.error('Erreur lors du partage:', error);
    }
  };

  const handleReaction = (emoji: string) => {
    onReaction?.(id, emoji);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.tags}>
          <Text style={styles.emotionTag}>{emotion}</Text>
          <Text style={styles.situationTag}>{situation}</Text>
        </View>
        <TouchableOpacity
          style={[styles.heartButton, isLiked && styles.heartButtonLiked]}
          onPress={handleLike}
        >
          <Text style={[styles.heartIcon, isLiked && styles.heartIconLiked]}>
            {isLiked ? '❤️' : '🤍'}
          </Text>
          <Text style={styles.heartCount}>{heartCount}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.content}>{content}</Text>

      <ReactionBar
        noteId={id}
        reactions={reactions}
        onReaction={handleReaction}
      />

      <View style={styles.footer}>
        <Text style={styles.date}>{formatDate(createdAt)}</Text>
        <View style={styles.footerActions}>
          {/* Bouton Discussion Privée (Seulement si pas l'auteur) */}
          {authorId && user && authorId !== user.id && (
            <DiscussButton
              noteId={id}
              noteAuthorId={authorId}
              onRequestSent={() => { }}
            />
          )}

          {/* Bouton Commentaires (Tout le monde) */}
          {user && (
            <TouchableOpacity
              style={[styles.commentButton, { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e3f2fd', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }]}
              onPress={() => setIsCommentsVisible(true)}
            >
              <Text style={{ fontSize: 16, marginRight: 4 }}>💬</Text>
              <Text style={{ fontSize: 12, color: '#2196f3', fontWeight: '500' }}>Commenter</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Text style={styles.shareButtonText}>📤</Text>
          </TouchableOpacity>
        </View>
      </View>

      <CommentsModal
        visible={isCommentsVisible}
        onClose={() => setIsCommentsVisible(false)}
        noteId={id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...createShadowStyle(),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  emotionTag: {
    backgroundColor: '#e3f2fd',
    color: '#2196f3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  situationTag: {
    backgroundColor: '#f3e5f5',
    color: '#9c27b0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  heartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
  },
  heartButtonLiked: {
    backgroundColor: '#ffe6e6',
  },
  heartIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  heartIconLiked: {
    transform: [{ scale: 1.2 }],
  },
  heartCount: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  commentButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#fff3e0',
  },
  shareButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  shareButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});

