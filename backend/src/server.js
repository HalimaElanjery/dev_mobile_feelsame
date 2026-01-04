/**
 * Serveur Express pour l'API FeelSame
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const { testConnection } = require('./config/database');
const { startAutomaticCleanup, stopAutomaticCleanup } = require('./services/cleanupService');

// Import des routes
const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');
const discussionsRoutes = require('./routes/discussions');
const matchRoutes = require('./routes/match');
const reactionsRoutes = require('./routes/reactions');
const adminRoutes = require('./routes/admin');

// Créer l'application Express
const app = express();
const server = createServer(app);

// Variable pour stocker l'interval de nettoyage
let cleanupInterval = null;

// Configuration Socket.IO pour le temps réel
const io = new Server(server, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN || "*",
    methods: ["GET", "POST"]
  }
});

// Partager l'instance IO avec toute l'application
app.set('io', io);

// Middleware de sécurité
app.use(helmet());
app.use(compression());

// Configuration CORS
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS ?
    process.env.ALLOWED_ORIGINS.split(',') :
    [
      'http://localhost:19006',
      'http://localhost:8081',
      'http://localhost:8082',
      'http://localhost:3000',
      'http://192.168.1.5:19006',
      'http://192.168.1.5:8081',
      'http://192.168.1.5:8082',
      'http://192.168.1.5:3000',
      'exp://192.168.1.5:19000',
      'exp://192.168.1.5:8081',
      'exp://192.168.1.5:8082',
      'exp://owaqupg-anonymous-8081.exp.direct',
      '*' // Temporaire pour le développement
    ],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Middleware de logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Middleware de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 3000,
  message: {
    error: 'Trop de requêtes, veuillez réessayer plus tard.'
  }
});
app.use('/api/', limiter);

// Routes de l'API
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/discussions', discussionsRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/reactions', reactionsRoutes);
app.use('/api/admin', adminRoutes);

// Route de santé
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Route racine
app.get('/', (req, res) => {
  res.json({
    message: 'API FeelSame - Partage émotionnel anonyme',
    version: '1.0.0',
    documentation: '/api/docs'
  });
});

// Gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.originalUrl
  });
});

// Middleware de gestion d'erreurs globales
app.use((error, req, res, next) => {
  console.error('❌ Erreur serveur:', error);

  res.status(error.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Erreur interne du serveur'
      : error.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  });
});

// Gestion des connexions Socket.IO pour le temps réel
io.on('connection', (socket) => {
  console.log('👤 Utilisateur connecté:', socket.id);

  // Rejoindre une discussion
  socket.on('join-discussion', (discussionId) => {
    socket.join(discussionId);
    console.log(`👤 ${socket.id} a rejoint la discussion ${discussionId}`);
  });

  // Quitter une discussion
  socket.on('leave-discussion', (discussionId) => {
    socket.leave(discussionId);
    console.log(`👤 ${socket.id} a quitté la discussion ${discussionId}`);
  });

  // Nouveau message dans une discussion
  socket.on('new-message', (data) => {
    socket.to(data.discussionId).emit('message-received', data);
  });

  // Indicateur de frappe
  socket.on('typing', (data) => {
    socket.to(data.discussionId).emit('user-typing', {
      userId: data.userId,
      isTyping: data.isTyping
    });
  });

  // Déconnexion
  socket.on('disconnect', () => {
    console.log('👤 Utilisateur déconnecté:', socket.id);
  });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Tester la connexion à la base de données
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ Impossible de se connecter à la base de données');
      process.exit(1);
    }

    // Démarrer le nettoyage automatique
    cleanupInterval = startAutomaticCleanup();

    // Démarrer le serveur sur toutes les interfaces pour React Native
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Serveur FeelSame démarré sur le port ${PORT}`);
      console.log(`🌐 Environnement: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📡 Socket.IO activé pour le temps réel`);
      console.log(`🔗 API disponible sur: http://localhost:${PORT}`);
      console.log(`🔗 API accessible via: http://0.0.0.0:${PORT}`);
      console.log(`🧹 Nettoyage automatique activé`);
    });

  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

// Gestion propre de l'arrêt du serveur
process.on('SIGTERM', () => {
  console.log('🛑 Arrêt du serveur...');
  stopAutomaticCleanup(cleanupInterval);
  server.close(() => {
    console.log('✅ Serveur arrêté proprement');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Arrêt du serveur (Ctrl+C)...');
  stopAutomaticCleanup(cleanupInterval);
  server.close(() => {
    console.log('✅ Serveur arrêté proprement');
    process.exit(0);
  });
});

// Démarrer le serveur
if (require.main === module) {
  startServer();
}

module.exports = { app, server, io };