/**
 * Routes pour la gestion des matchs et discussions privées
 */

const express = require('express');
const { query, generateUUID, transaction } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const REQUEST_DURATION_MS = 24 * 60 * 60 * 1000; // 24 heures
const DISCUSSION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 heures

/**
 * Envoyer une demande de match
 */
router.post('/request', authenticateToken, async (req, res) => {
  try {
    const { noteId, message } = req.body;
    const fromUserId = req.user.userId;

    if (!noteId) {
      return res.status(400).json({
        error: 'ID de la note requis'
      });
    }

    // Récupérer la note et son auteur
    const notes = await query(`
      SELECT id, user_id
      FROM notes
      WHERE id = ? AND is_active = TRUE
    `, [noteId]);

    if (notes.length === 0) {
      return res.status(404).json({
        error: 'Note non trouvée'
      });
    }

    const note = notes[0];
    const toUserId = note.user_id;

    // Vérifier qu'on ne demande pas un match avec soi-même
    if (fromUserId === toUserId) {
      return res.status(400).json({
        error: 'Vous ne pouvez pas demander un match avec vous-même'
      });
    }

    // Vérifier s'il n'y a pas déjà une demande (quel que soit le statut) car la DB a une contrainte unique
    const existingRequests = await query(`
      SELECT id, status
      FROM match_requests
      WHERE from_user_id = ? AND to_user_id = ? AND note_id = ?
    `, [fromUserId, toUserId, noteId]);

    if (existingRequests.length > 0) {
      const existing = existingRequests[0];

      let message = 'Une demande existe déjà pour cette note';
      if (existing.status === 'pending') {
        message = 'Une demande est déjà en attente pour cette note';
      } else if (existing.status === 'accepted') {
        message = 'Vous avez déjà une discussion en cours pour cette note';
      } else if (existing.status === 'declined') {
        message = 'Cette demande a été refusée';
      } else if (existing.status === 'expired') {
        message = 'Cette demande a expiré';
        // Optionnel: Si expiré, on pourrait supprimer l'ancienne et laisser passer la nouvelle ?
        // Pour l'instant on bloque pour éviter le crash 500.
      }

      return res.status(409).json({
        error: message,
        status: existing.status
      });
    }

    // Créer la demande de match
    const requestId = generateUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + REQUEST_DURATION_MS);

    await query(`
      INSERT INTO match_requests (id, from_user_id, to_user_id, note_id, message, expires_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [requestId, fromUserId, toUserId, noteId, message || null, expiresAt]);

    // Récupérer la demande créée
    const requests = await query(`
      SELECT id, from_user_id, to_user_id, note_id, status, message, created_at, expires_at
      FROM match_requests
      WHERE id = ?
    `, [requestId]);

    res.status(201).json({
      success: true,
      data: requests[0]
    });

  } catch (error) {
    // Gérer spécifiquement les erreurs de doublons
    if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
      return res.status(409).json({
        error: 'Une demande existe déjà pour cette note',
        status: 'unknown' // On ne connaît pas le status exact ici sans refaire une requête, mais ce n'est pas grave
      });
    }

    console.error('Send match request error:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      error: 'Erreur lors de l\'envoi de la demande: ' + error.message
    });
  }
});

/**
 * Récupérer les demandes de match reçues
 */
router.get('/requests/received', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status = 'pending' } = req.query;

    const requests = await query(`
      SELECT mr.id, mr.from_user_id, mr.to_user_id, mr.note_id, mr.status,
             mr.message, mr.created_at, mr.expires_at,
             n.emotion, n.situation, n.content
      FROM match_requests mr
      JOIN notes n ON mr.note_id = n.id
      WHERE mr.to_user_id = ? AND mr.status = ?
      ORDER BY mr.created_at DESC
    `, [userId, status]);

    res.json({
      success: true,
      data: requests
    });

  } catch (error) {
    console.error('Get received requests error:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des demandes'
    });
  }
});

/**
 * Récupérer les demandes de match envoyées
 */
router.get('/requests/sent', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const requests = await query(`
      SELECT mr.id, mr.from_user_id, mr.to_user_id, mr.note_id, mr.status,
             mr.message, mr.created_at, mr.expires_at,
             n.emotion, n.situation, n.content
      FROM match_requests mr
      JOIN notes n ON mr.note_id = n.id
      WHERE mr.from_user_id = ?
      ORDER BY mr.created_at DESC
    `, [userId]);

    res.json({
      success: true,
      data: requests
    });

  } catch (error) {
    console.error('Get sent requests error:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des demandes envoyées'
    });
  }
});

/**
 * Accepter une demande de match
 */
router.post('/requests/:requestId/accept', authenticateToken, async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.userId;

    console.log('🔍 Accept request - RequestID:', requestId, 'UserID:', userId);

    const result = await transaction(async (connection) => {
      // Récupérer la demande
      const [requests] = await connection.execute(`
        SELECT id, from_user_id, to_user_id, note_id, status, expires_at
        FROM match_requests
        WHERE id = ? AND to_user_id = ? AND status = 'pending'
      `, [requestId, userId]);

      console.log('🔍 Found requests:', requests.length);
      if (requests.length > 0) {
        console.log('🔍 Request details:', requests[0]);
      }

      if (requests.length === 0) {
        // Vérifier si la demande existe mais avec un autre statut ou utilisateur
        const [allRequests] = await connection.execute(`
          SELECT id, from_user_id, to_user_id, note_id, status, expires_at
          FROM match_requests
          WHERE id = ?
        `, [requestId]);

        console.log('🔍 All requests with this ID:', allRequests);
        throw new Error('Demande non trouvée ou déjà traitée');
      }

      const request = requests[0];

      // Vérifier si la demande n'a pas expiré
      const now = new Date();
      const expiresAt = new Date(request.expires_at);

      if (now > expiresAt) {
        await connection.execute(
          'UPDATE match_requests SET status = "expired" WHERE id = ?',
          [requestId]
        );
        throw new Error('Cette demande a expiré');
      }

      // Marquer la demande comme acceptée
      await connection.execute(
        'UPDATE match_requests SET status = "accepted" WHERE id = ?',
        [requestId]
      );

      // Créer la discussion privée
      const discussionId = generateUUID();
      const discussionExpiresAt = new Date(now.getTime() + DISCUSSION_DURATION_MS);

      await connection.execute(`
        INSERT INTO private_discussions (id, user1_id, user2_id, note_id, expires_at, is_active)
        VALUES (?, ?, ?, ?, ?, TRUE)
      `, [discussionId, request.from_user_id, request.to_user_id, request.note_id, discussionExpiresAt]);

      // Récupérer la discussion créée
      const [discussions] = await connection.execute(`
        SELECT id, user1_id, user2_id, note_id, created_at, expires_at, is_active
        FROM private_discussions
        WHERE id = ?
      `, [discussionId]);

      return discussions[0];
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Accept match request error:', error);
    res.status(500).json({
      error: error.message || 'Erreur lors de l\'acceptation de la demande'
    });
  }
});

/**
 * Refuser une demande de match
 */
router.post('/requests/:requestId/decline', authenticateToken, async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.userId;

    const result = await query(`
      UPDATE match_requests
      SET status = 'declined'
      WHERE id = ? AND to_user_id = ? AND status = 'pending'
    `, [requestId, userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Demande non trouvée ou déjà traitée'
      });
    }

    res.json({
      success: true,
      message: 'Demande refusée'
    });

  } catch (error) {
    console.error('Decline match request error:', error);
    res.status(500).json({
      error: 'Erreur lors du refus de la demande'
    });
  }
});

/**
 * Récupérer les discussions privées de l'utilisateur
 */
router.get('/discussions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    console.log('🔍 GET /discussions for user:', userId);

    // Debug: Vérifier s'il y a des discussions tout court (sans filtres)
    const allDiscussions = await query('SELECT count(*) as count FROM private_discussions WHERE user1_id = ? OR user2_id = ?', [userId, userId]);
    console.log('🔍 Total raw discussions count:', allDiscussions[0].count);

    const discussions = await query(`
      SELECT pd.id, pd.user1_id, pd.user2_id, pd.note_id, pd.created_at, pd.expires_at, pd.is_active,
             n.emotion, n.situation, n.content,
             COUNT(pm.id) as message_count,
             MAX(pm.created_at) as last_message_at
      FROM private_discussions pd
      LEFT JOIN notes n ON pd.note_id = n.id
      LEFT JOIN private_messages pm ON pd.id = pm.discussion_id
      WHERE (pd.user1_id = ? OR pd.user2_id = ?) AND pd.is_active = TRUE
      GROUP BY pd.id, pd.user1_id, pd.user2_id, pd.note_id, pd.created_at, pd.expires_at, pd.is_active,
               n.emotion, n.situation, n.content
      ORDER BY last_message_at DESC, pd.created_at DESC
    `, [userId, userId]);

    console.log('🔍 Filtered discussions found:', discussions.length);
    if (discussions.length > 0) {
      console.log('🔍 First discussion expiry:', discussions[0].expires_at);
      console.log('🔍 Current Server Time:', new Date());
    }

    res.json({
      success: true,
      data: discussions
    });

  } catch (error) {
    console.error('Get private discussions error:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des discussions'
    });
  }
});

/**
 * Récupérer une discussion privée spécifique
 */
router.get('/discussions/:discussionId', authenticateToken, async (req, res) => {
  try {
    const { discussionId } = req.params;
    const userId = req.user.userId;

    const discussions = await query(`
      SELECT pd.id, pd.user1_id, pd.user2_id, pd.note_id, pd.created_at, pd.expires_at, pd.is_active,
             n.emotion, n.situation, n.content
      FROM private_discussions pd
      LEFT JOIN notes n ON pd.note_id = n.id
      WHERE pd.id = ? AND (pd.user1_id = ? OR pd.user2_id = ?)
    `, [discussionId, userId, userId]);

    if (discussions.length === 0) {
      return res.status(404).json({
        error: 'Discussion non trouvée ou non autorisée'
      });
    }

    const discussion = discussions[0];

    // Vérifier si la discussion est expirée
    const now = new Date();
    const expiresAt = new Date(discussion.expires_at);

    if (now > expiresAt && discussion.is_active) {
      await query('UPDATE private_discussions SET is_active = FALSE WHERE id = ?', [discussionId]);
      discussion.is_active = false;
    }

    if (!discussion.is_active) {
      return res.status(410).json({
        error: 'Cette discussion a expiré'
      });
    }

    res.json({
      success: true,
      data: discussion
    });

  } catch (error) {
    console.error('Get private discussion error:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération de la discussion'
    });
  }
});

/**
 * Envoyer un message dans une discussion privée
 */
router.post('/discussions/:discussionId/messages', authenticateToken, async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        error: 'Le contenu du message ne peut pas être vide'
      });
    }

    // Vérifier que la discussion existe et que l'utilisateur y participe
    const discussions = await query(`
      SELECT id, user1_id, user2_id, is_active, expires_at
      FROM private_discussions
      WHERE id = ? AND (user1_id = ? OR user2_id = ?) AND is_active = TRUE AND expires_at > NOW()
    `, [discussionId, userId, userId]);

    if (discussions.length === 0) {
      return res.status(404).json({
        error: 'Discussion non trouvée, expirée ou non autorisée'
      });
    }

    // Créer le message
    const messageId = generateUUID();
    await query(`
      INSERT INTO private_messages (id, discussion_id, user_id, content)
      VALUES (?, ?, ?, ?)
    `, [messageId, discussionId, userId, content.trim()]);

    // Récupérer le message créé
    const messages = await query(`
      SELECT id, discussion_id, user_id, content, created_at
      FROM private_messages
      WHERE id = ?
    `, [messageId]);

    const newMessage = messages[0];

    // Émettre l'événement Socket.IO
    const io = req.app.get('io');
    io.to(discussionId).emit('private-message-received', newMessage);

    res.status(201).json({
      success: true,
      data: newMessage
    });

  } catch (error) {
    console.error('Send private message error:', error);
    res.status(500).json({
      error: 'Erreur lors de l\'envoi du message'
    });
  }
});

/**
 * Récupérer les messages d'une discussion privée
 */
router.get('/discussions/:discussionId/messages', authenticateToken, async (req, res) => {
  try {
    const { discussionId } = req.params;
    const userId = req.user.userId;
    const { limit = 50, offset = 0, since } = req.query;

    // Vérifier que l'utilisateur participe à la discussion
    const discussions = await query(`
      SELECT id
      FROM private_discussions
      WHERE id = ? AND (user1_id = ? OR user2_id = ?)
    `, [discussionId, userId, userId]);

    if (discussions.length === 0) {
      return res.status(404).json({
        error: 'Discussion non trouvée ou non autorisée'
      });
    }

    let sql = `
      SELECT id, discussion_id, user_id, content, created_at
      FROM private_messages
      WHERE discussion_id = ?
    `;
    const params = [discussionId];

    if (since) {
      sql += ' AND created_at > ?';
      params.push(since);
    }

    sql += ' ORDER BY created_at ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const messages = await query(sql, params);

    res.json({
      success: true,
      data: messages,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('Get private messages error:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des messages'
    });
  }
});

/**
 * Nettoyer les demandes et discussions expirées
 */
router.post('/cleanup', async (req, res) => {
  try {
    // Marquer les demandes expirées
    const expiredRequests = await query(`
      UPDATE match_requests
      SET status = 'expired'
      WHERE expires_at < NOW() AND status = 'pending'
    `);

    // Marquer les discussions expirées comme inactives
    const expiredDiscussions = await query(`
      UPDATE private_discussions
      SET is_active = FALSE
      WHERE expires_at < NOW() AND is_active = TRUE
    `);

    res.json({
      success: true,
      message: `${expiredRequests.affectedRows} demandes et ${expiredDiscussions.affectedRows} discussions expirées nettoyées`
    });

  } catch (error) {
    console.error('Cleanup matches error:', error);
    res.status(500).json({
      error: 'Erreur lors du nettoyage'
    });
  }
});

module.exports = router;