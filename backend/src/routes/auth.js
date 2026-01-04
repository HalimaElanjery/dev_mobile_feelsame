/**
 * Routes d'authentification (Adaptées pour Firebase)
 * La plupart de la logique de login/register est maintenant gérée par le client Firebase.
 * Ces routes servent principalement à synchroniser/récupérer le profil.
 */

const express = require('express');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * Inscription / Connexion (Géré par middleware authenticateToken + Firebase)
 * Cette route 'login' pourrait être utilisée pour renvoyer des info sup si besoin,
 * mais avec Firebase, le client login directement sur Firebase, puis appelle /me ou une route protégée.
 * 
 * Pour compatibilité avec l'existant, on peut garder /me pour récupérer le profil complet.
 */

// Route de login "legacy" désactivée ou adaptée
// Si le front appelle encore /login, ça va échouer car il n'envoie pas token Firebase.
// Le front a été migré pour utiliser Firebase Auth directement.

/**
 * Vérifier le token et récupérer l'utilisateur actuel
 * C'est la route principale appelée après le login Firebase sur le front.
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    // req.user est déjà peuplé par le middleware authenticateToken (qui utilise verifyFirebaseToken)
    // verifyFirebaseToken s'assure que l'utilisateur existe en DB (sync)

    // On peut renvoyer les infos
    if (!req.user || !req.user.userId) {
      return res.status(404).json({ error: 'User not found' });
    }

    const users = await query(
      'SELECT id, email, created_at FROM users WHERE id = ? AND is_active = TRUE',
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      data: users[0]
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération de l\'utilisateur'
    });
  }
});

// Les routes /register et /login classiques ne sont plus nécessaires 
// car l'auth se fait côté client direct avec Firebase.
// Cependant, pour éviter des 404 si le front n'est pas 100% migré :
router.post('/login', (req, res) => {
  res.status(400).json({ error: "Please use Firebase Auth on client side" });
});

router.post('/register', (req, res) => {
  res.status(400).json({ error: "Please use Firebase Auth on client side" });
});

router.post('/logout', (req, res) => {
  // Logout is client side essentially, but we can return success
  res.json({ success: true });
});

module.exports = router;