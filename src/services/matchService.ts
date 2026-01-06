/**
 * Service de gestion des matchs et invitations privées avec API
 * Gère les demandes de discussion entre utilisateurs
 */

import { apiGet, apiPost, ApiResponse } from './api';

export interface MatchRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  noteId: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  message?: string;
  createdAt: string;
  expiresAt: string;
  // Informations de la note associée
  emotion?: string;
  situation?: string;
  content?: string;
}

export interface PrivateDiscussion {
  id: string;
  user1Id: string;
  user2Id: string;
  noteId: string;
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
  // Informations de la note associée
  emotion?: string;
  situation?: string;
  content?: string;
  messageCount?: number;
  lastMessageAt?: string;
}

export interface PrivateMessage {
  id: string;
  discussionId: string;
  userId: string;
  content: string;
  createdAt: string;
}

/**
 * Transforme les données de match request de l'API (snake_case) vers le format frontend (camelCase)
 */
const transformMatchRequestData = (request: any): MatchRequest => {
  return {
    id: request.id,
    fromUserId: request.from_user_id,
    toUserId: request.to_user_id,
    noteId: request.note_id,
    status: request.status,
    message: request.message,
    createdAt: request.created_at,
    expiresAt: request.expires_at,
    emotion: request.emotion,
    situation: request.situation,
    content: request.content
  };
};

/**
 * Transforme les données de discussion privée de l'API (snake_case) vers le format frontend (camelCase)
 */
const transformPrivateDiscussionData = (discussion: any): PrivateDiscussion => {
  return {
    id: discussion.id,
    user1Id: discussion.user1_id,
    user2Id: discussion.user2_id,
    noteId: discussion.note_id,
    createdAt: discussion.created_at,
    expiresAt: discussion.expires_at,
    isActive: discussion.is_active,
    emotion: discussion.emotion,
    situation: discussion.situation,
    content: discussion.content,
    messageCount: discussion.message_count,
    lastMessageAt: discussion.last_message_at
  };
};

/**
 * Transforme les données de message privé de l'API (snake_case) vers le format frontend (camelCase)
 */
const transformPrivateMessageData = (message: any): PrivateMessage => {
  return {
    id: message.id,
    discussionId: message.discussion_id,
    userId: message.user_id,
    content: message.content,
    createdAt: message.created_at
  };
};

/**
 * Envoie une demande de match pour discuter avec l'auteur d'une note
 */
export const sendMatchRequest = async (
  fromUserId: string,
  noteId: string,
  toUserId: string,
  message?: string
): Promise<MatchRequest> => {
  try {
    const response: ApiResponse<any> = await apiPost('/match/request', {
      noteId,
      toUserId,
      message
    });

    if (response.success && response.data) {
      return transformMatchRequestData(response.data);
    }

    throw new Error(response.error || 'Erreur lors de l\'envoi de la demande');
  } catch (error) {
    console.error('Send match request error:', error);
    throw error;
  }
};

/**
 * Accepte une demande de match et crée une discussion privée
 */
export const acceptMatchRequest = async (requestId: string): Promise<PrivateDiscussion> => {
  try {
    const response: ApiResponse<any> = await apiPost(`/match/requests/${requestId}/accept`);

    if (response.success && response.data) {
      return transformPrivateDiscussionData(response.data);
    }

    throw new Error(response.error || 'Erreur lors de l\'acceptation de la demande');
  } catch (error) {
    console.error('Accept match request error:', error);
    throw error;
  }
};

/**
 * Refuse une demande de match
 */
export const declineMatchRequest = async (requestId: string): Promise<void> => {
  try {
    const response: ApiResponse = await apiPost(`/match/requests/${requestId}/decline`);

    if (!response.success) {
      throw new Error(response.error || 'Erreur lors du refus de la demande');
    }
  } catch (error) {
    console.error('Decline match request error:', error);
    throw error;
  }
};

/**
 * Crée une discussion privée entre deux utilisateurs (utilisé en interne)
 */
export const createPrivateDiscussion = async (
  user1Id: string,
  user2Id: string,
  noteId: string
): Promise<PrivateDiscussion> => {
  // Cette fonction est maintenant gérée automatiquement par acceptMatchRequest
  throw new Error('Utilisez acceptMatchRequest pour créer une discussion privée');
};

/**
 * Récupère les demandes de match pour l'utilisateur connecté (reçues)
 */
export const getMatchRequests = async (): Promise<MatchRequest[]> => {
  try {
    const response: ApiResponse<any[]> = await apiGet('/match/requests/received', {
      status: 'pending'
    });

    if (response.success && response.data) {
      return response.data.map(transformMatchRequestData);
    }

    return [];
  } catch (error) {
    console.error('Get match requests error:', error);
    return [];
  }
};

/**
 * Récupère les demandes de match pour un utilisateur (reçues)
 */
export const getMatchRequestsForUser = async (userId: string): Promise<MatchRequest[]> => {
  try {
    const response: ApiResponse<any[]> = await apiGet('/match/requests/received', {
      status: 'pending'
    });

    if (response.success && response.data) {
      return response.data.map(transformMatchRequestData);
    }

    return [];
  } catch (error) {
    console.error('Get match requests for user error:', error);
    return [];
  }
};

/**
 * Récupère les demandes de match envoyées par un utilisateur
 */
export const getSentMatchRequests = async (): Promise<MatchRequest[]> => {
  try {
    const response: ApiResponse<any[]> = await apiGet('/match/requests/sent');

    if (response.success && response.data) {
      return response.data.map(transformMatchRequestData);
    }

    return [];
  } catch (error) {
    console.error('Get sent match requests error:', error);
    return [];
  }
};

/**
 * Récupère les discussions privées d'un utilisateur
 */
export const getPrivateDiscussionsForUser = async (userId: string): Promise<PrivateDiscussion[]> => {
  try {
    const response: ApiResponse<any[]> = await apiGet('/match/discussions');

    if (response.success && response.data) {
      return response.data.map(transformPrivateDiscussionData);
    }

    return [];
  } catch (error) {
    console.error('Get private discussions for user error:', error);
    return [];
  }
};

/**
 * Récupère une discussion privée spécifique
 */
export const getPrivateDiscussionById = async (discussionId: string): Promise<PrivateDiscussion | null> => {
  try {
    const response: ApiResponse<any> = await apiGet(`/match/discussions/${discussionId}`);

    if (response.success && response.data) {
      return transformPrivateDiscussionData(response.data);
    }

    return null;
  } catch (error) {
    console.error('Get private discussion by ID error:', error);
    return null;
  }
};

/**
 * Ajoute un message à une discussion privée
 */
export const addPrivateMessage = async (
  discussionId: string,
  userId: string,
  content: string
): Promise<PrivateMessage> => {
  try {
    const response: ApiResponse<any> = await apiPost(`/match/discussions/${discussionId}/messages`, {
      content
    });

    if (response.success && response.data) {
      return transformPrivateMessageData(response.data);
    }

    throw new Error(response.error || 'Erreur lors de l\'envoi du message');
  } catch (error) {
    console.error('Add private message error:', error);
    throw error;
  }
};

/**
 * Récupère les messages d'une discussion privée
 */
export const getPrivateMessagesByDiscussion = async (discussionId: string, options: {
  limit?: number;
  offset?: number;
  since?: string;
} = {}): Promise<PrivateMessage[]> => {
  try {
    const response: ApiResponse<any[]> = await apiGet(`/match/discussions/${discussionId}/messages`, {
      limit: options.limit || 50,
      offset: options.offset || 0,
      since: options.since
    });

    if (response.success && response.data) {
      return response.data.map(transformPrivateMessageData);
    }

    return [];
  } catch (error) {
    console.error('Get private messages by discussion error:', error);
    return [];
  }
};

/**
 * Nettoie les demandes et discussions expirées (appelé automatiquement par le serveur)
 */
export const cleanupExpiredMatches = async (): Promise<void> => {
  try {
    await apiPost('/match/cleanup');
  } catch (error) {
    console.error('Cleanup expired matches error:', error);
    // Ne pas lancer d'erreur car c'est un nettoyage automatique
  }
};

/**
 * Récupère les nouveaux messages privés depuis une date donnée
 */
export const getNewPrivateMessages = async (discussionId: string, since: string): Promise<PrivateMessage[]> => {
  return getPrivateMessagesByDiscussion(discussionId, { since, limit: 100 });
};