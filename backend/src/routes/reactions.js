/**
 * Routes pour la gestion des réactions sur les notes
 */

const express = require('express');
const { query, generateUUID } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const VALID_REACTIONS = ['heart', 'comfort', 'strength', 'gratitude', 'hope'];

/**
 * Ajouter ou retirer une réaction sur une note
 */
router.post('/notes/:noteId', authenticateToken, async (req, res) => {
  try {
    const { noteId } = req.params;
    const { reactionType } = req.body;
    const userId = req.user.userId;

    // Validation
    if (!reactionType || !VALID_REACTIONS.includes(reactionType)) {
      return res.status(400).json({
        error: `Type de réaction invalide. Types valides: ${VALID_REACTIONS.join(', ')}`
      });
    }

    // Vérifier que la note existe
    const notes = await query(
      'SELECT id FROM notes WHERE id = ? AND is_active = TRUE',
      [noteId]
    );

    if (notes.length === 0) {
      return res.status(404).json({
        error: 'Note non trouvée'
      });
    }

    // Vérifier si l'utilisateur a déjà cette réaction sur cette note
    const existingReactions = await query(`
      SELECT id FROM note_reactions
      WHERE note_id = ? AND user_id = ? AND reaction_type = ?
    `, [noteId, userId, reactionType]);

    if (existingReactions.length > 0) {
      // Retirer la réaction existante
      await query(
        'DELETE FROM note_reactions WHERE note_id = ? AND user_id = ? AND reaction_type = ?',
        [noteId, userId, reactionType]
      );

      res.json({
        success: true,
        action: 'removed',
        reactionType
      });
    } else {
      // Ajouter la nouvelle réaction
      const reactionId = generateUUID();
      await query(`
        INSERT INTO note_reactions (id, note_id, user_id, reaction_type)
        VALUES (?, ?, ?, ?)
      `, [reactionId, noteId, userId, reactionType]);

      res.json({
        success: true,
        action: 'added',
        reactionType
      });
    }

  } catch (error) {
    console.error('Toggle reaction error:', error);
    res.status(500).json({
      error: 'Erreur lors de la gestion de la réaction'
    });
  }
});

/**
 * Récupérer les réactions d'une note
 */
router.get('/notes/:noteId', async (req, res) => {
  try {
    const { noteId } = req.params;

    // Vérifier que la note existe
    const notes = await query(
      'SELECT id FROM notes WHERE id = ? AND is_active = TRUE',
      [noteId]
    );

    if (notes.length === 0) {
      return res.status(404).json({
        error: 'Note non trouvée'
      });
    }

    // Récupérer les réactions groupées par type
    const reactions = await query(`
      SELECT reaction_type, COUNT(*) as count
      FROM note_reactions
      WHERE note_id = ?
      GROUP BY reaction_type
    `, [noteId]);

    // Formater les résultats
    const reactionCounts = VALID_REACTIONS.reduce((acc, type) => {
      acc[type] = 0;
      return acc;
    }, {});

    reactions.forEach(reaction => {
      reactionCounts[reaction.reaction_type] = reaction.count;
    });

    res.json({
      success: true,
      noteId,
      reactions: reactionCounts,
      totalReactions: reactions.reduce((sum, r) => sum + r.count, 0)
    });

  } catch (error) {
    console.error('Get note reactions error:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des réactions'
    });
  }
});

/**
 * Récupérer les réactions d'un utilisateur sur une note
 */
router.get('/notes/:noteId/user', authenticateToken, async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.user.userId;

    const userReactions = await query(`
      SELECT reaction_type
      FROM note_reactions
      WHERE note_id = ? AND user_id = ?
    `, [noteId, userId]);

    const reactionTypes = userReactions.map(r => r.reaction_type);

    res.json({
      success: true,
      noteId,
      userReactions: reactionTypes
    });

  } catch (error) {
    console.error('Get user reactions error:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des réactions utilisateur'
    });
  }
});

/**
 * Récupérer les notes les plus réactées
 */
router.get('/popular', async (req, res) => {
  try {
    const { limit = 10, emotion, situation } = req.query;

    let sql = `
      SELECT n.id, n.user_id, n.emotion, n.situation, n.content, n.created_at,
             COUNT(nr.id) as total_reactions,
             GROUP_CONCAT(CONCAT(nr.reaction_type, ':', COUNT(nr.reaction_type)) SEPARATOR ',') as reaction_details
      FROM notes n
      LEFT JOIN note_reactions nr ON n.id = nr.note_id
      WHERE n.is_active = TRUE
    `;
    const params = [];

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
      HAVING total_reactions > 0
      ORDER BY total_reactions DESC, n.created_at DESC
      LIMIT ?
    `;
    params.push(parseInt(limit));

    const notes = await query(sql, params);

    // Formater les détails des réactions
    const formattedNotes = notes.map(note => {
      const reactions = {};
      if (note.reaction_details) {
        note.reaction_details.split(',').forEach(detail => {
          const [type, count] = detail.split(':');
          reactions[type] = parseInt(count);
        });
      }
      
      return {
        ...note,
        reactions,
        reaction_details: undefined // Supprimer le champ temporaire
      };
    });

    res.json({
      success: true,
      notes: formattedNotes,
      limit: parseInt(limit)
    });

  } catch (error) {
    console.error('Get popular notes error:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des notes populaires'
    });
  }
});

/**
 * Récupérer les statistiques des réactions
 */
router.get('/stats', async (req, res) => {
  try {
    const { period = '7d' } = req.query;

    let dateFilter = '';
    switch (period) {
      case '1d':
        dateFilter = 'AND nr.created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)';
        break;
      case '7d':
        dateFilter = 'AND nr.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
        break;
      case '30d':
        dateFilter = 'AND nr.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
        break;
      default:
        dateFilter = '';
    }

    // Statistiques globales des réactions
    const reactionStats = await query(`
      SELECT nr.reaction_type, COUNT(*) as count,
             n.emotion, COUNT(DISTINCT n.id) as note_count
      FROM note_reactions nr
      JOIN notes n ON nr.note_id = n.id
      WHERE n.is_active = TRUE ${dateFilter}
      GROUP BY nr.reaction_type, n.emotion
      ORDER BY count DESC
    `);

    // Total des réactions par type
    const totalByType = await query(`
      SELECT reaction_type, COUNT(*) as total
      FROM note_reactions nr
      JOIN notes n ON nr.note_id = n.id
      WHERE n.is_active = TRUE ${dateFilter}
      GROUP BY reaction_type
      ORDER BY total DESC
    `);

    res.json({
      success: true,
      period,
      totalByType,
      detailedStats: reactionStats
    });

  } catch (error) {
    console.error('Get reaction stats error:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des statistiques'
    });
  }
});

/**
 * Supprimer toutes les réactions d'un utilisateur sur une note
 */
router.delete('/notes/:noteId/user', authenticateToken, async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.user.userId;

    const result = await query(
      'DELETE FROM note_reactions WHERE note_id = ? AND user_id = ?',
      [noteId, userId]
    );

    res.json({
      success: true,
      message: `${result.affectedRows} réaction(s) supprimée(s)`
    });

  } catch (error) {
    console.error('Delete user reactions error:', error);
    res.status(500).json({
      error: 'Erreur lors de la suppression des réactions'
    });
  }
});

module.exports = router;