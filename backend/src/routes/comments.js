const express = require('express');
const { query, generateUUID } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router({ mergeParams: true }); // Important pour récupérer :noteId si monté sur /api/notes/:noteId/comments

/**
 * Récupérer les commentaires d'une note
 * GET /api/notes/:noteId/comments
 */
router.get('/:noteId/comments', authenticateToken, async (req, res) => {
    try {
        const { noteId } = req.params;

        const comments = await query(`
      SELECT c.id, c.note_id, c.content, c.created_at, c.user_id,
             CASE WHEN c.user_id = ? THEN TRUE ELSE FALSE END as is_own
      FROM comments c
      WHERE c.note_id = ?
      ORDER BY c.created_at ASC
    `, [req.user.userId, noteId]);

        // On ne renvoie pas l'info de l'user (anonymat), sauf si c'est "moi"
        // Optionnel : On peut vouloir savoir si c'est l'auteur de la note qui répond ("OP")

        // Récupérer l'auteur de la note pour le marquer
        const notes = await query('SELECT user_id FROM notes WHERE id = ?', [noteId]);
        const noteAuthorId = notes.length > 0 ? notes[0].user_id : null;

        const enrichedComments = comments.map(c => ({
            ...c,
            is_author: c.user_id === noteAuthorId
        }));

        res.json({
            success: true,
            data: enrichedComments
        });

    } catch (error) {
        console.error('Get comments error:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des commentaires' });
    }
});

/**
 * Ajouter un commentaire
 * POST /api/notes/:noteId/comments
 */
router.post('/:noteId/comments', authenticateToken, async (req, res) => {
    try {
        const { noteId } = req.params;
        const { content } = req.body;
        const userId = req.user.userId;

        if (!content || !content.trim()) {
            return res.status(400).json({ error: 'Le commentaire ne peut pas être vide' });
        }

        const commentId = generateUUID();

        await query(`
      INSERT INTO comments (id, note_id, user_id, content)
      VALUES (?, ?, ?, ?)
    `, [commentId, noteId, userId, content]);

        // Récupérer le commentaire créé
        const newComments = await query(`
        SELECT id, note_id, content, created_at, user_id
        FROM comments WHERE id = ?
    `, [commentId]);

        const newComment = newComments[0];

        // Check auteur note pour flag is_author
        const notes = await query('SELECT user_id FROM notes WHERE id = ?', [noteId]);
        const noteAuthorId = notes.length > 0 ? notes[0].user_id : null;

        res.status(201).json({
            success: true,
            data: {
                ...newComment,
                is_own: true,
                is_author: userId === noteAuthorId
            }
        });

    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({ error: 'Erreur lors de l\'ajout du commentaire' });
    }
});

module.exports = router;
