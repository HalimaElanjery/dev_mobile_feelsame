/**
 * Routes pour la gestion des discussions de groupe
 */

const express = require('express');
const { query, generateUUID } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const DISCUSSION_DURATION_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Créer ou rejoindre une discussion de groupe
 */
router.post('/join', authenticateToken, async (req, res) => {
  try {
    const { emotion, situation } = req.body;

    if (!emotion || !situation) {
      return res.status(400).json({
        error: 'Émotion et situation requises'
      });
    }

    // Chercher une discussion active existante
    const existingDiscussions = await query(`
      SELECT id, emotion, situation, created_at, expires_at, is_active
      FROM discussions
      WHERE emotion = ? AND situation = ? AND is_active = TRUE AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `, [emotion, situation]);

    let discussion;

    if (existingDiscussions.length > 0) {
      // Rejoindre la discussion existante
      discussion = existingDiscussions[0];
    } else {
      // Créer une nouvelle discussion
      const discussionId = generateUUID();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + DISCUSSION_DURATION_MS);

      await query(`
        INSERT INTO discussions (id, emotion, situation, expires_at)
        VALUES (?, ?, ?, ?)
      `, [discussionId, emotion, situation, expiresAt]);

      const newDiscussions = await query(
        'SELECT id, emotion, situation, created_at, expires_at, is_active FROM discussions WHERE id = ?',
        [discussionId]
      );
      discussion = newDiscussions[0];
    }

    // Compter les participants actifs (approximation basée sur les messages récents)
    const participantCount = await query(`
      SELECT COUNT(DISTINCT user_id) as count
      FROM messages
      WHERE discussion_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL 5 MINUTE)
    `, [discussion.id]);

    res.json({
      success: true,
      data: {
        ...discussion,
        participantCount: participantCount[0]?.count || 0
      }
    });

  } catch (error) {
    console.error('Join discussion error:', error);
    res.status(500).json({
      error: 'Erreur lors de la création/jointure de la discussion'
    });
  }
});

/**
 * Récupérer une discussion spécifique
 */
router.get('/:discussionId', authenticateToken, async (req, res) => {
  try {
    const { discussionId } = req.params;

    const discussions = await query(`
      SELECT id, emotion, situation, created_at, expires_at, is_active
      FROM discussions
      WHERE id = ?
    `, [discussionId]);

    if (discussions.length === 0) {
      return res.status(404).json({
        error: 'Discussion non trouvée'
      });
    }

    const discussion = discussions[0];

    // Vérifier si la discussion est expirée
    const now = new Date();
    const expiresAt = new Date(discussion.expires_at);

    if (now > expiresAt && discussion.is_active) {
      // Marquer comme expirée
      await query('UPDATE discussions SET is_active = FALSE WHERE id = ?', [discussionId]);
      discussion.is_active = false;
    }

    if (!discussion.is_active) {
      return res.status(410).json({
        error: 'Cette discussion a expiré'
      });
    }

    // Compter les participants
    const participantCount = await query(`
      SELECT COUNT(DISTINCT user_id) as count
      FROM messages
      WHERE discussion_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL 5 MINUTE)
    `, [discussionId]);

    res.json({
      success: true,
      data: {
        ...discussion,
        participantCount: participantCount[0]?.count || 0
      }
    });

  } catch (error) {
    console.error('Get discussion error:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération de la discussion'
    });
  }
});

/**
 * Envoyer un message dans une discussion
 */
router.post('/:discussionId/messages', authenticateToken, async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        error: 'Le contenu du message ne peut pas être vide'
      });
    }

    // Vérifier que la discussion existe et est active
    const discussions = await query(`
      SELECT id, is_active, expires_at
      FROM discussions
      WHERE id = ? AND is_active = TRUE AND expires_at > NOW()
    `, [discussionId]);

    if (discussions.length === 0) {
      return res.status(404).json({
        error: 'Discussion non trouvée ou expirée'
      });
    }

    // Créer le message
    const messageId = generateUUID();
    await query(`
      INSERT INTO messages (id, discussion_id, user_id, content)
      VALUES (?, ?, ?, ?)
    `, [messageId, discussionId, userId, content.trim()]);

    // Récupérer le message créé
    const messages = await query(`
      SELECT id, discussion_id, user_id, content, created_at
      FROM messages
      WHERE id = ?
    `, [messageId]);

    const message = messages[0];

    res.status(201).json({
      success: true,
      message
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      error: 'Erreur lors de l\'envoi du message'
    });
  }
});

/**
 * Récupérer les messages d'une discussion
 */
router.get('/:discussionId/messages', authenticateToken, async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { limit = 50, offset = 0, since } = req.query;

    // Vérifier que la discussion existe
    const discussions = await query(
      'SELECT id FROM discussions WHERE id = ?',
      [discussionId]
    );

    if (discussions.length === 0) {
      return res.status(404).json({
        error: 'Discussion non trouvée'
      });
    }

    let sql = `
      SELECT id, discussion_id, user_id, content, created_at
      FROM messages
      WHERE discussion_id = ?
    `;
    const params = [discussionId];

    // Filtre par date (pour récupérer seulement les nouveaux messages)
    if (since) {
      sql += ' AND created_at > ?';
      params.push(since);
    }

    sql += ' ORDER BY created_at ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const messages = await query(sql, params);

    res.json({
      success: true,
      messages,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des messages'
    });
  }
});

/**
 * Récupérer les discussions actives
 */
router.get('/', async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const discussions = await query(`
      SELECT d.id, d.emotion, d.situation, d.created_at, d.expires_at,
             COUNT(DISTINCT m.user_id) as participant_count,
             COUNT(m.id) as message_count,
             MAX(m.created_at) as last_message_at
      FROM discussions d
      LEFT JOIN messages m ON d.id = m.discussion_id
      WHERE d.is_active = TRUE AND d.expires_at > NOW()
      GROUP BY d.id, d.emotion, d.situation, d.created_at, d.expires_at
      ORDER BY last_message_at DESC, d.created_at DESC
      LIMIT ? OFFSET ?
    `, [parseInt(limit), parseInt(offset)]);

    res.json({
      success: true,
      discussions,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('Get discussions error:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des discussions'
    });
  }
});

/**
 * Nettoyer les discussions expirées (endpoint admin)
 */
router.post('/cleanup', async (req, res) => {
  try {
    // Marquer les discussions expirées comme inactives
    const result = await query(`
      UPDATE discussions
      SET is_active = FALSE
      WHERE expires_at < NOW() AND is_active = TRUE
    `);

    res.json({
      success: true,
      message: `${result.affectedRows} discussions expirées nettoyées`
    });

  } catch (error) {
    console.error('Cleanup discussions error:', error);
    res.status(500).json({
      error: 'Erreur lors du nettoyage'
    });
  }
});

module.exports = router;