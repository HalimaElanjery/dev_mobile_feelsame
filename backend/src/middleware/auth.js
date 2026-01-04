/**
 * Middleware d'authentification JWT
 */

const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

/**
 * Middleware pour vérifier le token JWT
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Token d\'accès requis'
      });
    }

    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'feelsame_super_secret_jwt_key_2024_development');
    
    // Vérifier si l'utilisateur existe et est actif
    const users = await query(
      'SELECT id, email FROM users WHERE id = ? AND is_active = TRUE',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({
        error: 'Utilisateur non trouvé ou inactif'
      });
    }

    // Ajouter les informations utilisateur à la requête
    req.user = {
      userId: decoded.userId,
      email: decoded.email
    };

    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token invalide'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expiré'
      });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({
      error: 'Erreur d\'authentification'
    });
  }
};

/**
 * Middleware optionnel pour récupérer l'utilisateur si connecté
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'feelsame_super_secret_jwt_key_2024_development');
    
    const sessions = await query(
      'SELECT id FROM user_sessions WHERE token_hash = ? AND is_active = TRUE AND expires_at > NOW()',
      [token]
    );

    if (sessions.length > 0) {
      req.user = {
        userId: decoded.userId,
        email: decoded.email
      };
    } else {
      req.user = null;
    }

    next();

  } catch (error) {
    req.user = null;
    next();
  }
};

module.exports = {
  authenticateToken,
  optionalAuth
};