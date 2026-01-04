/**
 * Service de nettoyage automatique des données expirées
 * Remplace les procédures stockées MySQL
 */

const { query } = require('../config/database');

/**
 * Nettoie toutes les données expirées
 */
const cleanupExpiredData = async () => {
  try {
    console.log('🧹 Démarrage du nettoyage des données expirées...');

    // Nettoyer les discussions expirées
    const expiredDiscussions = await query(`
      UPDATE discussions 
      SET is_active = FALSE 
      WHERE expires_at < NOW() AND is_active = TRUE
    `);

    // Nettoyer les demandes de match expirées
    const expiredRequests = await query(`
      UPDATE match_requests 
      SET status = 'expired' 
      WHERE expires_at < NOW() AND status = 'pending'
    `);

    // Nettoyer les discussions privées expirées
    const expiredPrivateDiscussions = await query(`
      UPDATE private_discussions 
      SET is_active = FALSE 
      WHERE expires_at < NOW() AND is_active = TRUE
    `);

    // Nettoyer les sessions expirées
    const expiredSessions = await query(`
      UPDATE user_sessions 
      SET is_active = FALSE 
      WHERE expires_at < NOW() AND is_active = TRUE
    `);

    const totalCleaned = 
      expiredDiscussions.affectedRows + 
      expiredRequests.affectedRows + 
      expiredPrivateDiscussions.affectedRows + 
      expiredSessions.affectedRows;

    if (totalCleaned > 0) {
      console.log(`✅ Nettoyage terminé: ${totalCleaned} éléments nettoyés`);
      console.log(`   - Discussions: ${expiredDiscussions.affectedRows}`);
      console.log(`   - Demandes de match: ${expiredRequests.affectedRows}`);
      console.log(`   - Discussions privées: ${expiredPrivateDiscussions.affectedRows}`);
      console.log(`   - Sessions: ${expiredSessions.affectedRows}`);
    } else {
      console.log('✅ Nettoyage terminé: aucune donnée expirée trouvée');
    }

    return {
      success: true,
      cleaned: totalCleaned,
      details: {
        discussions: expiredDiscussions.affectedRows,
        matchRequests: expiredRequests.affectedRows,
        privateDiscussions: expiredPrivateDiscussions.affectedRows,
        sessions: expiredSessions.affectedRows
      }
    };

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Démarre le nettoyage automatique périodique
 */
const startAutomaticCleanup = () => {
  // Nettoyage immédiat au démarrage
  cleanupExpiredData();

  // Puis toutes les 5 minutes
  const interval = setInterval(cleanupExpiredData, 5 * 60 * 1000);

  console.log('🔄 Nettoyage automatique démarré (toutes les 5 minutes)');

  return interval;
};

/**
 * Arrête le nettoyage automatique
 */
const stopAutomaticCleanup = (interval) => {
  if (interval) {
    clearInterval(interval);
    console.log('🛑 Nettoyage automatique arrêté');
  }
};

/**
 * Statistiques des données expirées
 */
const getExpirationStats = async () => {
  try {
    const stats = await Promise.all([
      // Discussions expirées
      query(`
        SELECT COUNT(*) as count 
        FROM discussions 
        WHERE expires_at < NOW() AND is_active = TRUE
      `),
      
      // Demandes expirées
      query(`
        SELECT COUNT(*) as count 
        FROM match_requests 
        WHERE expires_at < NOW() AND status = 'pending'
      `),
      
      // Discussions privées expirées
      query(`
        SELECT COUNT(*) as count 
        FROM private_discussions 
        WHERE expires_at < NOW() AND is_active = TRUE
      `),
      
      // Sessions expirées
      query(`
        SELECT COUNT(*) as count 
        FROM user_sessions 
        WHERE expires_at < NOW() AND is_active = TRUE
      `)
    ]);

    return {
      expiredDiscussions: stats[0][0].count,
      expiredMatchRequests: stats[1][0].count,
      expiredPrivateDiscussions: stats[2][0].count,
      expiredSessions: stats[3][0].count,
      total: stats.reduce((sum, stat) => sum + stat[0].count, 0)
    };

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return null;
  }
};

module.exports = {
  cleanupExpiredData,
  startAutomaticCleanup,
  stopAutomaticCleanup,
  getExpirationStats
};