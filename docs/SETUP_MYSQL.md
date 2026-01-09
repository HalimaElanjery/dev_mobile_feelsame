# Configuration MySQL pour FeelSame

Ce guide explique comment configurer la base de données MySQL et le backend API pour l'application FeelSame.

## Prérequis

- Node.js (version 16 ou supérieure)
- MySQL Server (version 8.0 ou supérieure)
- npm ou yarn

## Installation

### 1. Configuration de la base de données MySQL

1. **Installer MySQL Server** si ce n'est pas déjà fait
2. **Créer la base de données** en exécutant le script SQL :

```bash
mysql -u root -p < database/schema.sql
```

Ou connectez-vous à MySQL et exécutez :

```sql
SOURCE database/schema.sql;
```

**Note importante :** Le script a été modifié pour éviter les problèmes de compatibilité avec les procédures stockées. Le nettoyage automatique des données expirées est maintenant géré côté application via un service JavaScript.

### 2. Configuration du backend

1. **Naviguer vers le dossier backend** :

```bash
cd backend
```

2. **Installer les dépendances** :

```bash
npm install
```

3. **Créer le fichier de configuration** `.env` :

```bash
cp .env.example .env
```

4. **Configurer les variables d'environnement** dans `.env` :

```env
# Base de données
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=feelsame_db

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Serveur
PORT=3000
NODE_ENV=development

# CORS
ALLOWED_ORIGINS=http://localhost:19006,exp://192.168.1.100:19000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Socket.IO
SOCKET_CORS_ORIGIN=*
```

### 3. Démarrage du backend

1. **Mode développement** (avec rechargement automatique) :

```bash
npm run dev
```

2. **Mode production** :

```bash
npm start
```

Le serveur sera accessible sur `http://localhost:3000`

### 4. Configuration de l'application React Native

1. **Installer les nouvelles dépendances** dans le dossier racine :

```bash
npm install
```

2. **Configurer l'URL de l'API** dans `src/services/api.ts` :

```typescript
export const API_CONFIG = {
  BASE_URL: __DEV__ 
    ? 'http://localhost:3000/api' // Développement
    : 'https://your-production-api.com/api', // Production
  // ...
};
```

Pour Android, utilisez l'IP de votre machine au lieu de `localhost` :

```typescript
BASE_URL: __DEV__ 
  ? 'http://192.168.1.100:3000/api' // Remplacez par votre IP
  : 'https://your-production-api.com/api',
```

## Test de l'installation

### 1. Vérifier la base de données

```sql
USE feelsame_db;
SHOW TABLES;
```

Vous devriez voir toutes les tables créées.

### 2. Tester l'API

Ouvrez votre navigateur et allez sur `http://localhost:3000/health`

Vous devriez voir :

```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "development"
}
```

### 3. Remplir avec des données de test (Seeders)

Pour avoir des données de test réalistes :

```bash
# Dans le dossier backend
cd backend

# Remplir la base de données avec des données de test
npm run seed
```

Cela créera :
- **10 utilisateurs** (user1@feelsame.com à user10@feelsame.com, mot de passe: 123456)
- **50 notes émotionnelles** avec du contenu réaliste
- **Réactions, discussions, messages** et demandes de match
- **Données cohérentes** pour tester toutes les fonctionnalités

**Commandes utiles :**
```bash
npm run seed        # Ajouter des données de test
npm run seed:clear  # Vider la base de données
npm run seed:reset  # Vider puis remplir
```

### 4. Tester l'application

1. **Démarrer l'application React Native** :

```bash
npm start
```

2. **Se connecter** avec un compte de test :
   - Email : `user1@feelsame.com`
   - Mot de passe : `123456`

3. **Tester les fonctionnalités** : notes, discussions, réactions, matchs privés

## Structure de l'API

### Endpoints disponibles

- **Authentification** : `/api/auth/*`
  - `POST /api/auth/register` - Inscription
  - `POST /api/auth/login` - Connexion
  - `POST /api/auth/logout` - Déconnexion
  - `GET /api/auth/me` - Utilisateur actuel

- **Notes** : `/api/notes/*`
  - `GET /api/notes` - Liste des notes
  - `POST /api/notes` - Créer une note
  - `GET /api/notes/:id` - Détails d'une note
  - `DELETE /api/notes/:id` - Supprimer une note

- **Discussions** : `/api/discussions/*`
  - `POST /api/discussions/join` - Rejoindre/créer une discussion
  - `GET /api/discussions/:id` - Détails d'une discussion
  - `POST /api/discussions/:id/messages` - Envoyer un message
  - `GET /api/discussions/:id/messages` - Messages d'une discussion

- **Matchs** : `/api/match/*`
  - `POST /api/match/request` - Demander un match
  - `GET /api/match/requests/received` - Demandes reçues
  - `POST /api/match/requests/:id/accept` - Accepter une demande
  - `GET /api/match/discussions` - Discussions privées

- **Réactions** : `/api/reactions/*`
  - `POST /api/reactions/notes/:id` - Ajouter/retirer une réaction
  - `GET /api/reactions/notes/:id` - Réactions d'une note

- **Administration** : `/api/admin/*`
  - `POST /api/admin/cleanup` - Nettoyage manuel des données expirées
  - `GET /api/admin/stats/expiration` - Statistiques des données expirées
  - `GET /api/admin/stats/database` - Statistiques générales
  - `GET /api/admin/system` - Informations système
  - `POST /api/admin/seed` - Remplir avec des données de test
  - `POST /api/admin/clear` - Vider la base de données
  - `POST /api/admin/reset` - Réinitialiser (vider + remplir)

## Fonctionnalités temps réel

L'application utilise Socket.IO pour les fonctionnalités temps réel :

- Messages en temps réel dans les discussions
- Indicateurs de frappe
- Notifications de nouvelles demandes de match

## Maintenance

### Nettoyage automatique

Le serveur nettoie automatiquement les données expirées toutes les 5 minutes via un service JavaScript :

- Discussions expirées (30 minutes)
- Demandes de match expirées (24 heures)
- Discussions privées expirées (2 heures)
- Sessions utilisateur expirées

**Nettoyage manuel :**
```bash
curl -X POST http://localhost:3000/api/admin/cleanup
```

**Statistiques :**
```bash
curl http://localhost:3000/api/admin/stats/database
```

### Logs

Les logs du serveur incluent :

- Connexions/déconnexions des utilisateurs
- Erreurs SQL
- Événements Socket.IO
- Requêtes HTTP (en mode développement)

## Dépannage

### Erreur de connexion à la base de données

1. Vérifiez que MySQL est démarré
2. Vérifiez les credentials dans `.env`
3. Vérifiez que la base de données `feelsame_db` existe

### Erreur CORS

1. Ajoutez l'URL de votre application dans `ALLOWED_ORIGINS`
2. Pour React Native, utilisez l'IP de votre machine

### Socket.IO ne fonctionne pas

1. Vérifiez que le port 3000 est accessible
2. Vérifiez les paramètres de firewall
3. Pour Android, utilisez l'IP de la machine au lieu de localhost

## Production

Pour déployer en production :

1. **Configurer les variables d'environnement** de production
2. **Utiliser HTTPS** pour l'API
3. **Configurer un reverse proxy** (nginx)
4. **Utiliser PM2** pour la gestion des processus
5. **Configurer les sauvegardes** de la base de données

```bash
# Installation PM2
npm install -g pm2

# Démarrage en production
pm2 start src/server.js --name feelsame-api
```