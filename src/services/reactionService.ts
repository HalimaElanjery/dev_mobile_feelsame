/**
 * Service de gestion des réactions sur les notes
 */

import { apiDelete, apiGet, apiPost, ApiResponse } from './api';

export type ReactionType = 'heart' | 'comfort' | 'strength' | 'gratitude' | 'hope';

export interface ReactionResponse {
  success: boolean;
  action: 'added' | 'removed';
  reactionType: ReactionType;
}

export interface NoteReactions {
  noteId: string;
  reactions: Record<ReactionType, number>;
  totalReactions: number;
}

export interface UserReactions {
  noteId: string;
  userReactions: ReactionType[];
}

/**
 * Ajouter ou retirer une réaction sur une note
 */
export const toggleReaction = async (noteId: string, reactionType: ReactionType): Promise<ReactionResponse> => {
  try {
    const response: ReactionResponse = await apiPost(`/reactions/notes/${noteId}`, {
      reactionType
    });

    if (response.success) {
      return response;
    }

    throw new Error('Erreur lors de la gestion de la réaction');
  } catch (error) {
    console.error('Toggle reaction error:', error);
    throw error;
  }
};

/**
 * Récupérer les réactions d'une note
 */
export const getNoteReactions = async (noteId: string): Promise<NoteReactions> => {
  try {
    const response: ApiResponse<NoteReactions> = await apiGet(`/reactions/notes/${noteId}`);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error('Erreur lors de la récupération des réactions');
  } catch (error) {
    console.error('Get note reactions error:', error);
    throw error;
  }
};

/**
 * Récupérer les réactions d'un utilisateur sur une note
 */
export const getUserReactions = async (noteId: string): Promise<ReactionType[]> => {
  try {
    const response: ApiResponse<ReactionType[]> = await apiGet(`/reactions/notes/${noteId}/user`);

    if (response.success && response.data) {
      return response.data;
    }

    return [];
  } catch (error) {
    console.error('Get user reactions error:', error);
    return [];
  }
};

/**
 * Supprimer toutes les réactions d'un utilisateur sur une note
 */
export const removeAllUserReactions = async (noteId: string): Promise<boolean> => {
  try {
    const response: ApiResponse = await apiDelete(`/reactions/notes/${noteId}/user`);

    return response.success;
  } catch (error) {
    console.error('Remove all user reactions error:', error);
    return false;
  }
};

/**
 * Récupérer les statistiques des réactions
 */
export const getReactionStats = async (period: '1d' | '7d' | '30d' | 'all' = '7d'): Promise<any> => {
  try {
    const response: ApiResponse = await apiGet('/reactions/stats', { period });

    if (response.success) {
      return response;
    }

    return null;
  } catch (error) {
    console.error('Get reaction stats error:', error);
    return null;
  }
};

/**
 * Utilitaires pour les réactions
 */
export const REACTION_EMOJIS: Record<ReactionType, string> = {
  heart: '❤️',
  comfort: '🤗',
  strength: '💪',
  gratitude: '🙏',
  hope: '✨'
};

export const REACTION_LABELS: Record<ReactionType, string> = {
  heart: 'Cœur',
  comfort: 'Réconfort',
  strength: 'Force',
  gratitude: 'Gratitude',
  hope: 'Espoir'
};

export const getReactionEmoji = (type: ReactionType): string => {
  return REACTION_EMOJIS[type] || '❤️';
};

export const getReactionLabel = (type: ReactionType): string => {
  return REACTION_LABELS[type] || 'Réaction';
};