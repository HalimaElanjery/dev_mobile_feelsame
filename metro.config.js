const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Désactiver les externals Node.js pour éviter les problèmes sur Windows
config.resolver = {
  ...config.resolver,
  platforms: ['ios', 'android', 'web'],
  // Désactiver les externals Node.js qui causent des problèmes sur Windows
  resolverMainFields: ['react-native', 'browser', 'main'],
};

// Configuration pour éviter les problèmes de cache et externals
config.resetCache = true;

// Désactiver complètement les externals Node.js
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Ignorer les requêtes vers les externals Node.js
      if (req.url && req.url.includes('node:')) {
        res.status(404).end();
        return;
      }
      return middleware(req, res, next);
    };
  },
};

module.exports = config;