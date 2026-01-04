/**
 * Routes pour la gestion des notes émotionnelles
 */

const express = require('express');
const { query, generateUUID } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * Créer une nouvelle note
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { emotion, situation, content } = req.body;
    const userId = req.user.userId;

    // Validation
    if (!emotion || !situation || !content) {
      return res.status(400).json({
        error: 'Émotion, situation et contenu requis'
      });
    }

    if (content.trim().length === 0) {
      return res.status(400).json({
        error: 'Le contenu ne peut pas être vide'
      });
    }

    // Créer la note
    const noteId = generateUUID();
    await query(
      'INSERT INTO notes (id, user_id, emotion, situation, content) VALUES (?, ?, ?, ?, ?)',
      [noteId, userId, emotion, situation, content.trim()]
    );

    // Récupérer la note créée
    const notes = await query(
      'SELECT id, user_id, emotion, situation, content, created_at FROM notes WHERE id = ?',
      [noteId]
    );

    res.status(201).json({
      success: true,
      data: notes[0]
    });

  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({
      error: 'Erreur lors de la création de la note'
    });
  }
});

/**
 * Récupérer toutes les notes actives
 */
router.get('/', async (req, res) => {
  try {
    const { emotion, situation, limit = 50, offset = 0 } = req.query;

    let sql = `
      SELECT n.id, n.user_id, n.emotion, n.situation, n.content, n.created_at,
             COUNT(nr.id) as reaction_count
      FROM notes n
      LEFT JOIN note_reactions nr ON n.id = nr.note_id
      WHERE n.is_active = TRUE
    `;
    const params = [];

    // Filtres optionnels
    if (emotion) {
      sql += ' AND n.emotion = ?';
      params.push(emotion);
    }

    if (situation) {
      sql += ' AND n.situation = ?';
      params.push(situation);
    }

    sql += `
      GROUP BY n.id, n.user_id, n.emotion, n.situation, n.content, n.created_at
      ORDER BY n.created_at DESC
      LIMIT ? OFFSET ?
    `;
    params.push(parseInt(limit), parseInt(offset));

    const notes = await query(sql, params);

    res.json({
      success: true,
      data: notes,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: notes.length
      }
    });

  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des notes'
    });
  }
});

/**
 * Récupérer une note spécifique
 */
router.get('/:noteId', async (req, res) => {
  try {
    const { noteId } = req.params;

    const notes = await query(`
      SELECT n.id, n.user_id, n.emotion, n.situation, n.content, n.created_at,
             COUNT(nr.id) as reaction_count
      FROM notes n
      LEFT JOIN note_reactions nr ON n.id = nr.note_id
      WHERE n.id = ? AND n.is_active = TRUE
      GROUP BY n.id, n.user_id, n.emotion, n.situation, n.content, n.created_at
    `, [noteId]);

    if (notes.length === 0) {
      return res.status(404).json({
        error: 'Note non trouvée'
      });
    }

    // Récupérer les réactions détaillées
    const reactions = await query(`
      SELECT reaction_type, COUNT(*) as count
      FROM note_reactions
      WHERE note_id = ?
      GROUP BY reaction_type
    `, [noteId]);

    const note = notes[0];
    note.reactions = reactions.reduce((acc, reaction) => {
      acc[reaction.reaction_type] = reaction.count;
      return acc;
    }, {});

    res.json({
      success: true,
      data: note
    });

  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération de la note'
    });
  }
});

/**
 * Récupérer les notes d'un utilisateur
 */
router.get('/user/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 20, offset = 0 } = req.query;

    const notes = await query(`
      SELECT n.id, n.user_id, n.emotion, n.situation, n.content, n.created_at,
             COUNT(nr.id) as reaction_count
      FROM notes n
      LEFT JOIN note_reactions nr ON n.id = nr.note_id
      WHERE n.user_id = ? AND n.is_active = TRUE
      GROUP BY n.id, n.user_id, n.emotion, n.situation, n.content, n.created_at
      ORDER BY n.created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, parseInt(limit), parseInt(offset)]);

    res.json({
      success: true,
      data: notes,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('Get user notes error:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des notes utilisateur'
    });
  }
});

/**
 * Modifier une note
 */
router.put('/:noteId', authenticateToken, async (req, res) => {
  try {
    const { noteId } = req.params;
    const { emotion, situation, content } = req.body;
    const userId = req.user.userId;

    // Validation
    if (!emotion || !situation || !content) {
      return res.status(400).json({
        error: 'Émotion, situation et contenu requis'
      });
    }

    if (content.trim().length === 0) {
      return res.status(400).json({
        error: 'Le contenu ne peut pas être vide'
      });
    }

    // Vérifier que la note appartient à l'utilisateur
    const notes = await query(
      'SELECT id FROM notes WHERE id = ? AND user_id = ? AND is_active = TRUE',
      [noteId, userId]
    );

    if (notes.length === 0) {
      return res.status(404).json({
        error: 'Note non trouvée ou non autorisée'
      });
    }

    // Mettre à jour la note
    await query(
      'UPDATE notes SET emotion = ?, situation = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [emotion, situation, content.trim(), noteId]
    );

    // Récupérer la note mise à jour
    const updatedNotes = await query(`
      SELECT n.id, n.user_id, n.emotion, n.situation, n.content, n.created_at, n.updated_at,
             COUNT(nr.id) as reaction_count
      FROM notes n
      LEFT JOIN note_reactions nr ON n.id = nr.note_id
      WHERE n.id = ?
      GROUP BY n.id, n.user_id, n.emotion, n.situation, n.content, n.created_at, n.updated_at
    `, [noteId]);

    res.json({
      success: true,
      data: updatedNotes[0],
      message: 'Note modifiée avec succès'
    });

  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({
      error: 'Erreur lors de la modification de la note'
    });
  }
});

/**
 * Supprimer une note (marquer comme inactive)
 */
router.delete('/:noteId', authenticateToken, async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.user.userId;

    // Vérifier que la note appartient à l'utilisateur
    const notes = await query(
      'SELECT id FROM notes WHERE id = ? AND user_id = ? AND is_active = TRUE',
      [noteId, userId]
    );

    if (notes.length === 0) {
      return res.status(404).json({
        error: 'Note non trouvée ou non autorisée'
      });
    }

    // Marquer la note comme inactive
    await query(
      'UPDATE notes SET is_active = FALSE WHERE id = ?',
      [noteId]
    );

    res.json({
      success: true,
      message: 'Note supprimée avec succès'
    });

  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({
      error: 'Erreur lors de la suppression de la note'
    });
  }
});

/**
 * Rechercher des notes
 */
router.get('/search/:query', async (req, res) => {
  try {
    const { query: searchQuery } = req.params;
    const { emotion, situation, limit = 20, offset = 0 } = req.query;

    if (!searchQuery || searchQuery.trim().length < 2) {
      return res.status(400).json({
        error: 'La recherche doit contenir au moins 2 caractères'
      });
    }

    let sql = `
      SELECT n.id, n.user_id, n.emotion, n.situation, n.content, n.created_at,
             COUNT(nr.id) as reaction_count
      FROM notes n
      LEFT JOIN note_reactions nr ON n.id = nr.note_id
      WHERE n.is_active = TRUE AND n.content LIKE ?
    `;
    const params = [`%${searchQuery.trim()}%`];

    if (emotion) {
      sql += ' AND n.emotion = ?';
      params.push(emotion);
    }

    if (situation) {
      sql += ' AND n.situation = ?';
      params.push(situation);
    }

    sql += `
      GROUP BY n.id, n.user_id, n.emotion, n.situation, n.content, n.created_at
      ORDER BY n.created_at DESC
      LIMIT ? OFFSET ?
    `;
    params.push(parseInt(limit), parseInt(offset));

    const notes = await query(sql, params);

    res.json({
      success: true,
      data: notes,
      searchQuery,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('Search notes error:', error);
    res.status(500).json({
      error: 'Erreur lors de la recherche'
    });
  }
});

module.exports = router;