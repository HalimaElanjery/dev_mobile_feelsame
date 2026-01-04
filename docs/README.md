# Documentation FeelSame

Cette documentation contient tous les guides et informations nécessaires pour utiliser et maintenir l'application FeelSame.

## 📚 Guides Disponibles

### Installation et Configuration
- **[SETUP_MYSQL.md](../SETUP_MYSQL.md)** - Configuration complète de MySQL et du backend
- **[MIGRATION_COMPLETE.md](../MIGRATION_COMPLETE.md)** - Résumé de la migration vers MySQL

### Fonctionnalités
- **[GUIDE_DEMARRAGE.md](../GUIDE_DEMARRAGE.md)** - Guide de démarrage pour les utilisateurs
- **[GUIDE_DISCUSSIONS_PRIVEES.md](../GUIDE_DISCUSSIONS_PRIVEES.md)** - Guide des discussions privées
- **[NOUVELLES_FONCTIONNALITES.md](../NOUVELLES_FONCTIONNALITES.md)** - Nouvelles fonctionnalités ajoutées

### Développement
- **[SEEDERS_GUIDE.md](../SEEDERS_GUIDE.md)** - Guide d'utilisation des seeders
- **[ANIMATIONS_GUIDE.md](../ANIMATIONS_GUIDE.md)** - Guide des animations
- **[MOCK_DATA.md](../MOCK_DATA.md)** - Données de test et mock

## 🏗️ Architecture

### Frontend (React Native)
```
src/
├── components/          # Composants réutilisables
├── screens/            # Écrans de l'application
├── services/           # Services API et logique métier
├── context/            # Contextes React
├── navigation/         # Configuration de navigation
├── hooks/              # Hooks personnalisés
└── constants/          # Constantes et thèmes
```

### Backend (Node.js + Express)
```
backend/
├── src/
│   ├── routes/         # Routes API
│   ├── middleware/     # Middlewares Express
│   ├── services/       # Services métier
│   ├── config/         # Configuration
│   ├── seeders/        # Données de test
│   └── scripts/        # Scripts utilitaires
└── package.json
```

### Base de Données (MySQL)
```
database/
└── schema.sql          # Structure complète de la base
```

## 🚀 Démarrage Rapide

1. **Configuration MySQL** : Suivre [SETUP_MYSQL.md](../SETUP_MYSQL.md)
2. **Données de test** : Utiliser les [seeders](../SEEDERS_GUIDE.md)
3. **Démarrage** : Suivre [GUIDE_DEMARRAGE.md](../GUIDE_DEMARRAGE.md)

## 🔧 Maintenance

- **Nettoyage automatique** : Géré par le backend toutes les 5 minutes
- **Monitoring** : Routes `/api/admin/*` pour les statistiques
- **Logs** : Consultables dans la console du serveur

## 📞 Support

Pour toute question ou problème, consultez d'abord la documentation appropriée dans cette liste.