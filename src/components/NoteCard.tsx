import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Card } from './Card';
import { CommentsModal } from './CommentsModal';
import { DiscussButton } from './DiscussButton';
import { ReactionBar } from './ReactionBar';

interface NoteCardProps {
  id?: string;
  content: string;
  emotion: string;
  situation: string;
  createdAt: string;
  authorId?: string;
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
  const { colors, isDark } = useTheme();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    // Si moins de 24h, format relatif
    if (diffMs < 86400000) {
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'À l\'instant';
      if (diffMins < 60) return `${diffMins} min`;
      const diffHours = Math.floor(diffMs / 3600000);
      return `${diffHours}h`;
    }
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
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
        message: `FeelSame: "${content}" #${emotion}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  // Couleurs dynamiques pour les tags
  const getTagColor = (text: string) => {
    // Simple hash pour couleur stable
    const hash = text.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    const hues = [200, 280, 340, 40, 160]; // Bleu, Violet, Rose, Orange, Vert
    const hue = hues[hash % hues.length];
    return {
      bg: `hsla(${hue}, 80%, ${isDark ? '20%' : '92%'}, 1)`,
      text: `hsla(${hue}, 80%, ${isDark ? '70%' : '40%'}, 1)`
    };
  };

  const emotionColors = getTagColor(emotion);
  const situationColors = getTagColor(situation);

  return (
    <Card variant="elevated" padding={20} style={styles.cardMargin}>
      {/* Header: Tags & Like */}
      <View style={styles.header}>
        <View style={styles.tags}>
          <View style={[styles.tag, { backgroundColor: emotionColors.bg }]}>
            <Text style={[styles.tagText, { color: emotionColors.text }]}>#{emotion}</Text>
          </View>
          <View style={[styles.tag, { backgroundColor: situationColors.bg }]}>
            <Text style={[styles.tagText, { color: situationColors.text }]}>{situation}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.heartButton, { backgroundColor: isLiked ? '#FFEBEE' : (isDark ? '#2C2C35' : '#F7F9FC') }]}
          onPress={handleLike}
        >
          <Text style={{ fontSize: 14 }}>{isLiked ? '❤️' : '🤍'}</Text>
          <Text style={[styles.heartCount, { color: colors.textSecondary }]}>{heartCount}</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <Text style={[styles.content, { color: colors.text }]}>{content}</Text>

      {/* Reactions Bar */}
      <View style={{ marginVertical: 12 }}>
        <ReactionBar
          noteId={id}
          reactions={reactions}
          onReaction={(emoji) => onReaction?.(id, emoji)}
        />
      </View>

      {/* Footer: Date & Actions */}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Text style={[styles.date, { color: colors.textSecondary }]}>{formatDate(createdAt)}</Text>

        <View style={styles.footerActions}>
          {authorId && user && authorId !== user.id && (
            <DiscussButton
              noteId={id}
              noteAuthorId={authorId}
              onRequestSent={() => { }}
            />
          )}

          {user && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: isDark ? '#3A3A45' : '#F0F4FF' }]}
              onPress={() => setIsCommentsVisible(true)}
            >
              <Text style={{ fontSize: 14 }}>💬</Text>
              <Text style={[styles.actionText, { color: colors.primary }]}>Commenter</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: 'transparent' }]}
            onPress={handleShare}
          >
            <Text style={{ fontSize: 16 }}>📤</Text>
          </TouchableOpacity>
        </View>
      </View>

      <CommentsModal
        visible={isCommentsVisible}
        onClose={() => setIsCommentsVisible(false)}
        noteId={id}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  cardMargin: {
    marginHorizontal: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  heartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  heartCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    fontSize: 17,
    lineHeight: 26,
    fontWeight: '400',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    marginTop: 8,
  },
  date: {
    fontSize: 11,
    fontWeight: '500',
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    gap: 6,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  }
});

