/**
 * Service de gestion des discussions temporaires avec API
 * Gère la création, la récupération et la suppression des discussions et messages
 */

import { apiGet, apiPost, ApiResponse } from './api';

export interface Message {
  id: string;
  discussionId: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface Discussion {
  id: string;
  emotion: string;
  situation: string;
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
  participantCount?: number;
  messageCount?: number;
  lastMessageAt?: string;
}

/**
 * Crée ou rejoint une discussion temporaire
 */
export const createDiscussion = async (emotion: string, situation: string): Promise<Discussion> => {
  return getActiveDiscussion(emotion, situation);
};

/**
 * Récupère une discussion par ID
 */
export const getDiscussionById = async (discussionId: string): Promise<Discussion | null> => {
  try {
    const response: ApiResponse<Discussion> = await apiGet(`/discussions/${discussionId}`);

    if (response.success && response.data) {
      return response.data;
    }

    return null;
  } catch (error) {
    console.error('Get discussion by ID error:', error);
    return null;
  }
};

/**
 * Récupère ou crée une discussion active par émotion et situation
 */
export const getActiveDiscussion = async (emotion: string, situation: string): Promise<Discussion> => {
  try {
    const response: ApiResponse<Discussion> = await apiPost('/discussions/join', {
      emotion,
      situation
    });

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Erreur lors de la création/jointure de la discussion');
  } catch (error) {
    console.error('Get active discussion error:', error);
    throw error;
  }
};

/**
 * Ajoute un message à une discussion
 */
export const addMessage = async (discussionId: string, userId: string, content: string): Promise<Message> => {
  try {
    const response: ApiResponse<Message> = await apiPost(`/discussions/${discussionId}/messages`, {
      content
    });

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Erreur lors de l\'envoi du message');
  } catch (error) {
    console.error('Add message error:', error);
    throw error;
  }
};

/**
 * Récupère tous les messages d'une discussion
 */
export const getMessagesByDiscussion = async (discussionId: string, options: {
  limit?: number;
  offset?: number;
  since?: string;
} = {}): Promise<Message[]> => {
  try {
    const response: ApiResponse<Message[]> = await apiGet(`/discussions/${discussionId}/messages`, {
      limit: options.limit || 50,
      offset: options.offset || 0,
      since: options.since
    });

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error('Erreur lors de la récupération des messages');
  } catch (error) {
    console.error('Get messages by discussion error:', error);
    throw error;
  }
};

/**
 * Récupère les discussions actives
 */
export const getActiveDiscussions = async (options: {
  limit?: number;
  offset?: number;
} = {}): Promise<Discussion[]> => {
  try {
    const response: ApiResponse<Discussion[]> = await apiGet('/discussions', {
      limit: options.limit || 20,
      offset: options.offset || 0
    });

    if (response.success && response.data) {
      return response.data;
    }

    return [];
  } catch (error) {
    console.error('Get active discussions error:', error);
    return [];
  }
};

/**
 * Nettoie les discussions expirées (appelé automatiquement par le serveur)
 */
export const cleanupExpiredDiscussions = async (): Promise<void> => {
  try {
    await apiPost('/discussions/cleanup');
  } catch (error) {
    console.error('Cleanup expired discussions error:', error);
    // Ne pas lancer d'erreur car c'est un nettoyage automatique
  }
};

/**
 * Calcule le temps restant avant expiration d'une discussion (en millisecondes)
 */
export const getTimeRemaining = (discussion: Discussion): number => {
  const now = new Date();
  const expiresAt = new Date(discussion.expiresAt);
  const remaining = expiresAt.getTime() - now.getTime();
  return remaining > 0 ? remaining : 0;
};

/**
 * Récupère les nouveaux messages depuis une date donnée
 */
export const getNewMessages = async (discussionId: string, since: string): Promise<Message[]> => {
  return getMessagesByDiscussion(discussionId, { since, limit: 100 });
};

