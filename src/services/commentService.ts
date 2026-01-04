import { apiGet, apiPost, ApiResponse } from './api';

export interface Comment {
    id: string;
    noteId: string;
    content: string;
    createdAt: string;
    isOwn: boolean;     // Le commentaire est-il de moi ?
    isAuthor: boolean;  // Le commentaire est-il de l'auteur de la note (OP) ?
}

/**
 * Récupérer les commentaires d'une note
 */
export const getComments = async (noteId: string): Promise<Comment[]> => {
    try {
        const response: ApiResponse<any[]> = await apiGet(`/notes/${noteId}/comments`);

        if (response.success && response.data) {
            // Mapper snake_case vers camelCase
            return response.data.map(c => ({
                id: c.id,
                noteId: c.note_id,
                content: c.content,
                createdAt: c.created_at,
                isOwn: c.is_own === 1 || c.is_own === true,
                isAuthor: c.is_author === 1 || c.is_author === true
            }));
        }
        return [];
    } catch (error) {
        console.error('Error fetching comments:', error);
        return [];
    }
};

/**
 * Ajouter un commentaire
 */
export const addComment = async (noteId: string, content: string): Promise<Comment | null> => {
    try {
        const response: ApiResponse<any> = await apiPost(`/notes/${noteId}/comments`, { content });

        if (response.success && response.data) {
            const c = response.data;
            return {
                id: c.id,
                noteId: c.note_id,
                content: c.content,
                createdAt: c.created_at,
                isOwn: true,
                isAuthor: c.is_author === 1 || c.is_author === true
            };
        }
        return null;
    } catch (error) {
        console.error('Error adding comment:', error);
        throw error;
    }
}
