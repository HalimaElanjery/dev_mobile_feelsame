# Guide des Seeders FeelSame

Ce guide explique comment utiliser les seeders pour remplir la base de données avec des données de test réalistes.

## 🌱 Qu'est-ce qu'un Seeder ?

Les seeders sont des scripts qui remplissent automatiquement la base de données avec des données de test. Ils sont utiles pour :

- **Développement** : Avoir des données réalistes pour tester l'application
- **Démonstration** : Présenter l'application avec du contenu
- **Tests** : Avoir un jeu de données cohérent pour les tests

## 📊 Données Créées

Les seeders FeelSame créent :

### 👥 Utilisateurs (10)
- **Emails** : `user1@feelsame.com` à `user10@feelsame.com`
- **Mot de passe** : `123456` (pour tous)
- **Hashage** : Mots de passe sécurisés avec bcrypt

### 📝 Notes Émotionnelles (50)
- **20 notes prédéfinies** avec du contenu réaliste et varié
- **30 notes générées** automatiquement
- **Émotions** : joie, tristesse, colère, peur, surprise, dégoût, anxiété, espoir
- **Situations** : travail, famille, amour, amitié, santé, études, argent, loisirs

### ❤️ Réactions (Variables)
- **5 types** : heart (❤️), comfort (🤗), strength (💪), gratitude (🙏), hope (✨)
- **Distribution aléatoire** : 0 à 8 réactions par note
- **Pas de doublons** : Un utilisateur ne peut réagir qu'une fois par type sur une note

### 💬 Discussions de Groupe (5)
- **Discussions actives** avec expiration dans 30 minutes
- **5 à 15 messages** par discussion
- **Messages réalistes** de soutien et d'échange

### 🤝 Demandes de Match (~10)
- **Demandes en attente** avec expiration dans 24h
- **Messages personnalisés** pour chaque demande
- **Pas d'auto-demandes** (utilisateur ne peut pas se demander à lui-même)

### 🔒 Discussions Privées (~3)
- **Discussions actives** avec expiration dans 2h
- **3 à 10 messages** par discussion
- **Alternance** entre les deux participants

## 🚀 Utilisation

### Via la ligne de commande

```bash
# Se placer dans le dossier backend
cd backend

# Remplir la base de données
npm run seed

# Vider la base de données

# Réinitialiser (vider + remplir)
npm run seed:reset

# Aide
npm run seed help
```

### Via l'API (pour les interfaces d'admin)

```bash
# Remplir la base de données
curl -X POST http://localhost:3000/api/admin/seed

# Vider la base de données
curl -X POST http://localhost:3000/api/admin/clear

# Réinitialiser
curl -X POST http://localhost:3000/api/admin/reset
```

## 📋 Exemples de Données

### Notes Prédéfinies

```
🎉 Joie + Travail
"J'ai enfin décroché le poste de mes rêves ! Après des mois de recherche, je commence lundi."

😢 Tristesse + Famille  
"Ma grand-mère nous a quittés ce matin. Elle était ma confidente, celle qui m'écoutait toujours."

😰 Anxiété + Études
"Les examens approchent et je me sens complètement dépassé(e). J'ai l'impression de ne rien retenir."

✨ Espoir + Santé
"Les résultats de mes analyses sont encourageants. Le médecin dit que le traitement fonctionne bien."
```

### Messages de Discussion

```
"Je comprends ce que tu ressens, j'ai vécu quelque chose de similaire."
"Courage, ça va aller mieux ! 💪"
"Tu n'es pas seul(e) dans cette épreuve."
"Merci de partager ton expérience, ça m'aide beaucoup."
"Prends soin de toi, c'est le plus important."
```

### Demandes de Match

```
"J'aimerais discuter avec toi de ton expérience."
"Ton message m'a touché, peux-tu m'en dire plus ?"
"Je vis quelque chose de similaire, on pourrait échanger ?"
"Merci pour ton partage, j'aimerais te parler en privé."
```

## 🔧 Configuration

### Variables d'Environnement

Les seeders utilisent la même configuration que l'application :

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=feelsame_db
```

### Sécurité

- **Mots de passe hashés** : Tous les mots de passe sont sécurisés avec bcrypt
- **Données réalistes** : Le contenu est approprié et respectueux
- **Pas de données sensibles** : Aucune information personnelle réelle

## ⚠️ Précautions

### Environnement de Production

**ATTENTION** : Ne jamais exécuter les seeders en production !

```javascript
// Protection intégrée
if (process.env.NODE_ENV === 'production') {
  console.error('❌ Les seeders ne peuvent pas être exécutés en production');
  process.exit(1);
}
```

### Sauvegarde

Avant d'utiliser `clear` ou `reset`, assurez-vous d'avoir une sauvegarde :

```bash
# Sauvegarde MySQL
mysqldump -u root -p feelsame_db > backup.sql

# Restauration
mysql -u root -p feelsame_db < backup.sql
```

## 🔍 Vérification

### Après le Seeding

```sql
-- Vérifier les données créées
USE feelsame_db;

SELECT COUNT(*) as users FROM users;
SELECT COUNT(*) as notes FROM notes;
SELECT COUNT(*) as reactions FROM note_reactions;
SELECT COUNT(*) as discussions FROM discussions;
SELECT COUNT(*) as messages FROM messages;

-- Voir quelques exemples
SELECT emotion, situation, LEFT(content, 50) as preview 
FROM notes 
LIMIT 5;
```

### Via l'API

```bash
# Statistiques générales
curl http://localhost:3000/api/admin/stats/database

# Réponse attendue
{
  "success": true,
  "stats": {
    "activeUsers": 10,
    "activeNotes": 50,
    "activeDiscussions": 5,
    "totalMessages": 50,
    "pendingMatchRequests": 10,
    "activePrivateDiscussions": 3,
    "totalPrivateMessages": 20,
    "totalReactions": 150,
    "activeSessions": 0
  }
}
```

## 🎯 Cas d'Usage

### Développement

```bash
# Démarrage d'un nouveau développement
npm run seed:reset

# Ajouter plus de données
npm run seed
```

### Démonstration

```bash
# Préparer une démo
npm run seed:reset

# L'application est maintenant prête avec des données réalistes
```

### Tests

```bash
# Avant les tests
npm run seed:clear
npm run seed

# Après les tests
npm run seed:clear
```

## 🚨 Dépannage

### Erreur de Connexion

```
❌ Impossible de se connecter à la base de données
```

**Solution** : Vérifiez votre fichier `.env` et que MySQL est démarré.

### Erreur de Doublons

```
Error: Duplicate entry
```

**Solution** : Normal, les seeders gèrent automatiquement les doublons.

### Permissions

```
Error: Access denied
```

**Solution** : Vérifiez les permissions MySQL de votre utilisateur.

## 📈 Personnalisation

### Ajouter des Données

Modifiez `backend/src/seeders/seedData.js` :

```javascript
const SAMPLE_NOTES = [
  // Ajoutez vos propres notes ici
  {
    emotion: 'joie',
    situation: 'loisirs',
    content: 'Votre contenu personnalisé...'
  }
];
```

### Modifier les Quantités

```javascript
// Dans createTestUsers()
for (let i = 1; i <= 20; i++) { // 20 utilisateurs au lieu de 10

// Dans createTestNotes()
for (let i = 0; i < 100; i++) { // 100 notes supplémentaires
```

Les seeders sont maintenant prêts à être utilisés ! 🎉