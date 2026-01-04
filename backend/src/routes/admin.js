/**
 * Routes d'administration et maintenance
 */

const express = require('express');
const { cleanupExpiredData, getExpirationStats } = require('../services/cleanupService');
const { seedDatabase, clearDatabase } = require('../seeders/seedData');
const { query } = require('../config/database');

const router = express.Router();

/**
 * Nettoyage manuel des données expirées
 */
router.post('/cleanup', async (req, res) => {
  try {
    const result = await cleanupExpiredData();
    
    res.json({
      success: result.success,
      message: result.success 
        ? `Nettoyage terminé: ${result.cleaned} éléments nettoyés`
        : 'Erreur lors du nettoyage',
      details: result.details || null,
      error: result.error || null
    });

  } catch (error) {
    console.error('Admin cleanup error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors du nettoyage'
    });
  }
});

/**
 * Statistiques des données expirées
 */
router.get('/stats/expiration', async (req, res) => {
  try {
    const stats = await getExpirationStats();
    
    if (stats) {
      res.json({
        success: true,
        stats
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des statistiques'
      });
    }

  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des statistiques'
    });
  }
});

/**
 * Statistiques générales de la base de données
 */
router.get('/stats/database', async (req, res) => {
  try {
    const stats = await Promise.all([
      query('SELECT COUNT(*) as count FROM users WHERE is_active = TRUE'),
      query('SELECT COUNT(*) as count FROM notes WHERE is_active = TRUE'),
      query('SELECT COUNT(*) as count FROM discussions WHERE is_active = TRUE'),
      query('SELECT COUNT(*) as count FROM messages'),
      query('SELECT COUNT(*) as count FROM match_requests WHERE status = "pending"'),
      query('SELECT COUNT(*) as count FROM private_discussions WHERE is_active = TRUE'),
      query('SELECT COUNT(*) as count FROM private_messages'),
      query('SELECT COUNT(*) as count FROM note_reactions'),
      query('SELECT COUNT(*) as count FROM user_sessions WHERE is_active = TRUE')
    ]);

    res.json({
      success: true,
      stats: {
        activeUsers: stats[0][0].count,
        activeNotes: stats[1][0].count,
        activeDiscussions: stats[2][0].count,
        totalMessages: stats[3][0].count,
        pendingMatchRequests: stats[4][0].count,
        activePrivateDiscussions: stats[5][0].count,
        totalPrivateMessages: stats[6][0].count,
        totalReactions: stats[7][0].count,
        activeSessions: stats[8][0].count
      }
    });

  } catch (error) {
    console.error('Database stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des statistiques'
    });
  }
});

/**
 * Informations système
 */
router.get('/system', (req, res) => {
  const memUsage = process.memoryUsage();
  
  res.json({
    success: true,
    system: {
      uptime: process.uptime(),
      memory: {
        rss: Math.round(memUsage.rss / 1024 / 1024) + ' MB',
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB',
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
        external: Math.round(memUsage.external / 1024 / 1024) + ' MB'
      },
      nodeVersion: process.version,
      platform: process.platform,
      environment: process.env.NODE_ENV || 'development'
    }
  });
});

/**
 * Remplir la base de données avec des données de test
 */
router.post('/seed', async (req, res) => {
  try {
    console.log('🌱 Seeding déclenché via API...');
    const success = await seedDatabase();
    
    if (success) {
      res.json({
        success: true,
        message: 'Base de données remplie avec des données de test'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Erreur lors du seeding'
      });
    }

  } catch (error) {
    console.error('API seed error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors du seeding'
    });
  }
});

/**
 * Vider la base de données
 */
router.post('/clear', async (req, res) => {
  try {
    console.log('🧹 Nettoyage déclenché via API...');
    const success = await clearDatabase();
    
    if (success) {
      res.json({
        success: true,
        message: 'Base de données vidée avec succès'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Erreur lors du nettoyage'
      });
    }

  } catch (error) {
    console.error('API clear error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors du nettoyage'
    });
  }
});

/**
 * Réinitialiser la base de données (vider + remplir)
 */
router.post('/reset', async (req, res) => {
  try {
    console.log('🔄 Réinitialisation déclenchée via API...');
    
    // Vider d'abord
    const clearSuccess = await clearDatabase();
    if (!clearSuccess) {
      return res.status(500).json({
        success: false,
        error: 'Erreur lors du nettoyage'
      });
    }
    
    // Puis remplir
    const seedSuccess = await seedDatabase();
    if (seedSuccess) {
      res.json({
        success: true,
        message: 'Base de données réinitialisée avec succès'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Erreur lors du seeding après nettoyage'
      });
    }

  } catch (error) {
    console.error('API reset error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la réinitialisation'
    });
  }
});

module.exports = router;