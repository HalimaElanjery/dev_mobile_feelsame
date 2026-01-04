/**
 * Routes d'authentification
 */

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query, generateUUID } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * Inscription d'un nouvel utilisateur
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email et mot de passe requis'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Le mot de passe doit contenir au moins 6 caractères'
      });
    }

    // Vérifier si l'email existe déjà
    const existingUser = await query(
      'SELECT id FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({
        error: 'Cet email est déjà utilisé'
      });
    }

    // Hasher le mot de passe
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Créer l'utilisateur
    const userId = generateUUID();
    await query(
      'INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)',
      [userId, email.toLowerCase().trim(), passwordHash]
    );

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès'
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Erreur lors de l\'inscription'
    });
  }
});

/**
 * Connexion d'un utilisateur
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email et mot de passe requis'
      });
    }

    // Récupérer l'utilisateur
    const users = await query(
      'SELECT id, email, password_hash FROM users WHERE email = ? AND is_active = TRUE',
      [email.toLowerCase().trim()]
    );

    if (users.length === 0) {
      return res.status(401).json({
        error: 'Email ou mot de passe incorrect'
      });
    }

    const user = users[0];

    // Vérifier le mot de passe
    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      return res.status(401).json({
        error: 'Email ou mot de passe incorrect'
      });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'feelsame_super_secret_jwt_key_2024_development',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Sauvegarder la session (optionnel)
    const sessionId = generateUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 jours

    await query(
      'INSERT INTO user_sessions (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)',
      [sessionId, user.id, token, expiresAt]
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Erreur lors de la connexion'
    });
  }
});

/**
 * Déconnexion (invalider le token)
 */
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      // Désactiver la session
      await query(
        'UPDATE user_sessions SET is_active = FALSE WHERE token_hash = ?',
        [token]
      );
    }

    res.json({
      success: true,
      message: 'Déconnexion réussie'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Erreur lors de la déconnexion'
    });
  }
});

/**
 * Vérifier le token et récupérer l'utilisateur actuel
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
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

module.exports = router;