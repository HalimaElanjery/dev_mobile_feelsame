/**
 * Service de gestion des notes émotionnelles avec API
 * Gère la création, la récupération et le filtrage des notes
 */

import { apiDelete, apiGet, apiPost, apiPut, ApiResponse } from './api';

export interface Note {
  id: string;
  userId: string;
  emotion: string;
  situation: string;
  content: string;
  createdAt: string;
  reactionCount?: number;
  reactions?: Record<string, number>;
}

export interface CreateNoteRequest {
  emotion: string;
  situation: string;
  content: string;
}

/**
 * Crée une nouvelle note émotionnelle
 */
export const createNote = async (userId: string, emotion: string, situation: string, content: string): Promise<Note> => {
  try {
    const response: ApiResponse<any> = await apiPost('/notes', {
      emotion,
      situation,
      content
    });

    if (response.success && response.data) {
      return transformNoteData(response.data);
    }

    throw new Error(response.error || 'Erreur lors de la création de la note');
  } catch (error) {
    console.error('Create note error:', error);
    throw error;
  }
};

/**
 * Transforme les données de note de l'API (snake_case) vers le format frontend (camelCase)
 */
const transformNoteData = (note: any): Note => {
  return {
    id: note.id,
    userId: note.user_id, // Transformation snake_case -> camelCase
    emotion: note.emotion,
    situation: note.situation,
    content: note.content,
    createdAt: note.created_at, // Transformation snake_case -> camelCase
    reactionCount: note.reaction_count,
    reactions: note.reactions
  };
};

/**
 * Récupère toutes les notes avec pagination et filtres
 */
export const getAllNotes = async (options: {
  emotion?: string;
  situation?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<Note[]> => {
  try {
    const response: ApiResponse<any[]> = await apiGet('/notes', {
      emotion: options.emotion,
      situation: options.situation,
      limit: options.limit || 50,
      offset: options.offset || 0
    });

    if (response.success && response.data) {
      // Transformer les données de l'API
      return response.data.map(transformNoteData);
    }

    throw new Error('Erreur lors de la récupération des notes');
  } catch (error) {
    console.error('Get all notes error:', error);
    throw error;
  }
};

/**
 * Récupère les notes filtrées par émotion et situation
 */
export const getNotesByEmotionAndSituation = async (emotion: string, situation: string): Promise<Note[]> => {
  return getAllNotes({ emotion, situation });
};

/**
 * Récupère les notes d'un utilisateur spécifique
 */
export const getNotesByUser = async (userId: string): Promise<Note[]> => {
  try {
    const response: ApiResponse<any[]> = await apiGet('/notes/user/me');

    if (response.success && response.data) {
      return response.data.map(transformNoteData);
    }

    throw new Error('Erreur lors de la récupération des notes utilisateur');
  } catch (error) {
    console.error('Get user notes error:', error);
    throw error;
  }
};

/**
 * Récupère une note spécifique par son ID
 */
export const getNoteById = async (noteId: string): Promise<Note | null> => {
  try {
    const response: ApiResponse<any> = await apiGet(`/notes/${noteId}`);

    if (response.success && response.data) {
      return transformNoteData(response.data);
    }

    return null;
  } catch (error) {
    console.error('Get note by ID error:', error);
    return null;
  }
};

/**
 * Recherche des notes par contenu
 */
export const searchNotes = async (query: string, options: {
  emotion?: string;
  situation?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<Note[]> => {
  try {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const response: ApiResponse<any[]> = await apiGet(`/notes/search/${encodeURIComponent(query)}`, {
      emotion: options.emotion,
      situation: options.situation,
      limit: options.limit || 20,
      offset: options.offset || 0
    });

    if (response.success && response.data) {
      return response.data.map(transformNoteData);
    }

    throw new Error('Erreur lors de la recherche');
  } catch (error) {
    console.error('Search notes error:', error);
    throw error;
  }
};

/**
 * Modifie une note existante
 */
export const updateNote = async (noteId: string, emotion: string, situation: string, content: string): Promise<Note> => {
  try {
    const response: ApiResponse<any> = await apiPut(`/notes/${noteId}`, {
      emotion,
      situation,
      content
    });

    if (response.success && response.data) {
      return transformNoteData(response.data);
    }

    throw new Error(response.error || 'Erreur lors de la modification de la note');
  } catch (error) {
    console.error('Update note error:', error);
    throw error;
  }
};

/**
 * Supprime une note (marque comme inactive)
 */
export const deleteNote = async (noteId: string): Promise<boolean> => {
  try {
    const response: ApiResponse = await apiDelete(`/notes/${noteId}`);

    return response.success;
  } catch (error) {
    console.error('Delete note error:', error);
    return false;
  }
};

/**
 * Récupère les notes populaires (les plus réactées)
 */
export const getPopularNotes = async (options: {
  emotion?: string;
  situation?: string;
  limit?: number;
} = {}): Promise<Note[]> => {
  try {
    const response: ApiResponse<any[]> = await apiGet('/notes/popular', {
      emotion: options.emotion,
      situation: options.situation,
      limit: options.limit || 10
    });

    if (response.success && response.data) {
      return response.data.map(transformNoteData);
    }

    return [];
  } catch (error) {
    console.error('Get popular notes error:', error);
    return [];
  }
};

