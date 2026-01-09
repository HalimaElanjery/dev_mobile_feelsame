# ppt et rapport
https://drive.google.com/drive/folders/18Gqtl0oq4L_jA2_jiAFnSXAR_eHeV_j3?usp=sharing
# 🎭 FeelSame - Application de Partage Émotionnel

Une application React Native permettant aux utilisateurs de partager leurs émotions, créer des discussions et établir des connexions privées basées sur des ressentis similaires.

## 🚀 Démarrage Rapide

### Prérequis
- Node.js (v16+)
- MySQL
- Expo CLI (`npm install -g @expo/cli`)
- Expo Go (sur mobile)

### Installation

1. **Cloner et installer les dépendances**
```bash
npm install
cd backend && npm install
```

2. **Configurer la base de données**
```bash
# Créer la base de données MySQL
mysql -u root -p
CREATE DATABASE feelsame_db;

# Importer le schéma
mysql -u root -p feelsame_db < database/schema.sql

# Ajouter des données de test
cd backend && npm run seed
```

3. **Démarrer l'application**
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
npx expo start
```

## 📱 Utilisation

### Comptes de Test
```
Email: user1@feelsame.com à user10@feelsame.com
Mot de passe: 123456
```

### Fonctionnalités Principales

#### 📝 Notes Émotionnelles
- Création de notes avec 8 émotions et 8 situations
- Système de réactions (❤️🤗💪🙏✨)
- Gestion personnelle des notes (modification/suppression)

#### 💬 Discussions
- **Discussions de groupe** temporaires (30 min)
- **Discussions privées** 1-à-1 (2h)
- Messages temps réel avec Socket.IO

#### 🤝 Matchs Privés
- Demandes de discussion sur les notes
- Acceptation/refus des demandes
- Conversations privées sécurisées

## 🛠️ Scripts Utiles

### Backend
```bash
cd backend
npm run dev          # Démarrage en mode développement
npm run seed         # Ajouter des données de test
npm run seed:clear   # Vider la base de données
npm run seed:reset   # Réinitialiser avec nouvelles données
```

### Frontend
```bash
npx expo start       # Démarrer Expo
npx expo start --web # Mode web uniquement
npm run cleanup      # Nettoyer les données temporaires
```

### Tests
```bash
node test-simple.js           # Test rapide de l'application
node test-note-management.js  # Test de gestion des notes
node debug-auth.js           # Debug de l'authentification
```

## 🔧 Configuration

### API Backend
- **URL**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **Documentation**: Collection Postman incluse

### Frontend Mobile
- **Configuration réseau**: `src/config/apiConfig.ts`
- **IP par défaut**: 192.168.1.6 (à adapter selon votre réseau)

## 📊 Architecture

### Backend (Node.js/Express)
```
backend/
├── src/
│   ├── routes/          # Routes API
│   ├── middleware/      # Middlewares (auth, validation)
│   ├── services/        # Services métier
│   ├── config/          # Configuration DB
│   └── server.js        # Point d'entrée
```

### Frontend (React Native/Expo)
```
src/
├── screens/            # Écrans de l'application
├── components/         # Composants réutilisables
├── services/           # Services API
├── navigation/         # Navigation
└── context/           # Contextes React
```

## 🔐 Sécurité

- ✅ Authentification JWT
- ✅ Mots de passe hashés (bcrypt)
- ✅ Rate limiting anti-spam
- ✅ Validation des données
- ✅ CORS configuré
- ✅ Helmet pour la sécurité HTTP

## 🧪 Tests et Debug

### Vérification Rapide
```bash
# Santé du backend
curl http://localhost:3000/health

# Statistiques de la base
curl http://localhost:3000/api/admin/stats/database

# Test complet
node test-simple.js
```

### Résolution de Problèmes

#### Backend ne démarre pas
- Vérifier que MySQL est démarré
- Vérifier que le port 3000 est libre
- Vérifier la configuration de la base de données

#### Frontend ne se connecte pas
- Vérifier l'IP dans `src/config/apiConfig.ts`
- S'assurer que le backend écoute sur `0.0.0.0`
- Tester l'accès réseau avec `curl http://[IP]:3000/health`

#### Expo ne démarre pas sur Windows
- Utiliser `npx expo start --web` pour le web uniquement
- Ou utiliser le mode tunnel: `npx expo start --tunnel`

## 📈 Données de Test

L'application inclut des données de test réalistes :
- **15 utilisateurs** avec profils variés
- **70+ notes** émotionnelles
- **Discussions** avec messages
- **Réactions** et interactions

## 🎯 Prochaines Étapes

- [ ] Notifications push
- [ ] Mode hors ligne
- [ ] Thèmes personnalisés
- [ ] Statistiques avancées
- [ ] Export des données

## 📞 Support

Pour toute question ou problème :
1. Vérifier les logs dans les terminaux
2. Exécuter les tests de diagnostic
3. Consulter la documentation API (Postman)

---

**FeelSame** - Partagez vos émotions, trouvez votre communauté 🎭