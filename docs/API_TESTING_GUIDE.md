# Guide de Test des API FeelSame

Ce guide contient tous les endpoints API avec des exemples de test complets.

## 🔧 Configuration de Base

**URL de base :** `http://localhost:3000/api`

**Headers requis pour les routes protégées :**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

## 🔐 1. Authentification (`/api/auth`)

### 1.1 Inscription
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "123456"
  }'
```

**Réponse attendue :**
```json
{
  "success": true,
  "message": "Utilisateur créé avec succès"
}
```

### 1.2 Connexion
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user1@feelsame.com",
    "password": "123456"
  }'
```

**Réponse attendue :**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid-here",
    "email": "user1@feelsame.com"
  }
}
```

### 1.3 Utilisateur Actuel
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Réponse attendue :**
```json
{
  "success": true,
  "user": {
    "id": "user-uuid-here",
    "email": "user1@feelsame.com",
    "created_at": "2024-12-26T10:00:00.000Z"
  }
}
```

### 1.4 Déconnexion
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Réponse attendue :**
```json
{
  "success": true,
  "message": "Déconnexion réussie"
}
```

## 📝 2. Notes (`/api/notes`)

### 2.1 Créer une Note
```bash
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "emotion": "joie",
    "situation": "travail",
    "content": "J'\''ai enfin décroché le poste de mes rêves ! Je suis tellement heureux."
  }'
```

**Réponse attendue :**
```json
{
  "success": true,
  "note": {
    "id": "note-uuid-here",
    "user_id": "user-uuid-here",
    "emotion": "joie",
    "situation": "travail",
    "content": "J'ai enfin décroché le poste de mes rêves ! Je suis tellement heureux.",
    "created_at": "2024-12-26T10:00:00.000Z"
  }
}
```

### 2.2 Récupérer Toutes les Notes
```bash
curl -X GET "http://localhost:3000/api/notes?limit=10&offset=0"
```

**Avec filtres :**
```bash
curl -X GET "http://localhost:3000/api/notes?emotion=joie&situation=travail&limit=5"
```

**Réponse attendue :**
```json
{
  "success": true,
  "notes": [
    {
      "id": "note-uuid-1",
      "user_id": "user-uuid-1",
      "emotion": "joie",
      "situation": "travail",
      "content": "Contenu de la note...",
      "created_at": "2024-12-26T10:00:00.000Z",
      "reaction_count": 5
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 1
  }
}
```

### 2.3 Récupérer une Note Spécifique
```bash
curl -X GET http://localhost:3000/api/notes/NOTE_ID
```

**Réponse attendue :**
```json
{
  "success": true,
  "note": {
    "id": "note-uuid-here",
    "user_id": "user-uuid-here",
    "emotion": "joie",
    "situation": "travail",
    "content": "Contenu de la note...",
    "created_at": "2024-12-26T10:00:00.000Z",
    "reaction_count": 5,
    "reactions": {
      "heart": 2,
      "comfort": 1,
      "strength": 1,
      "gratitude": 1,
      "hope": 0
    }
  }
}
```

### 2.4 Mes Notes
```bash
curl -X GET "http://localhost:3000/api/notes/user/me?limit=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2.5 Rechercher des Notes
```bash
curl -X GET "http://localhost:3000/api/notes/search/travail?emotion=joie&limit=10"
```

### 2.6 Supprimer une Note
```bash
curl -X DELETE http://localhost:3000/api/notes/NOTE_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## ❤️ 3. Réactions (`/api/reactions`)

### 3.1 Ajouter/Retirer une Réaction
```bash
curl -X POST http://localhost:3000/api/reactions/notes/NOTE_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "reactionType": "heart"
  }'
```

**Types de réactions :** `heart`, `comfort`, `strength`, `gratitude`, `hope`

**Réponse attendue :**
```json
{
  "success": true,
  "action": "added",
  "reactionType": "heart"
}
```

### 3.2 Récupérer les Réactions d'une Note
```bash
curl -X GET http://localhost:3000/api/reactions/notes/NOTE_ID
```

**Réponse attendue :**
```json
{
  "success": true,
  "noteId": "note-uuid-here",
  "reactions": {
    "heart": 5,
    "comfort": 3,
    "strength": 2,
    "gratitude": 1,
    "hope": 0
  },
  "totalReactions": 11
}
```

### 3.3 Mes Réactions sur une Note
```bash
curl -X GET http://localhost:3000/api/reactions/notes/NOTE_ID/user \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3.4 Notes Populaires
```bash
curl -X GET "http://localhost:3000/api/reactions/popular?limit=10&emotion=joie"
```

### 3.5 Statistiques des Réactions
```bash
curl -X GET "http://localhost:3000/api/reactions/stats?period=7d"
```

## 💬 4. Discussions (`/api/discussions`)

### 4.1 Rejoindre/Créer une Discussion
```bash
curl -X POST http://localhost:3000/api/discussions/join \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "emotion": "joie",
    "situation": "travail"
  }'
```

**Réponse attendue :**
```json
{
  "success": true,
  "discussion": {
    "id": "discussion-uuid-here",
    "emotion": "joie",
    "situation": "travail",
    "created_at": "2024-12-26T10:00:00.000Z",
    "expires_at": "2024-12-26T10:30:00.000Z",
    "is_active": true,
    "participantCount": 3
  }
}
```

### 4.2 Récupérer une Discussion
```bash
curl -X GET http://localhost:3000/api/discussions/DISCUSSION_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4.3 Envoyer un Message
```bash
curl -X POST http://localhost:3000/api/discussions/DISCUSSION_ID/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "content": "Je comprends ce que tu ressens, courage !"
  }'
```

**Réponse attendue :**
```json
{
  "success": true,
  "message": {
    "id": "message-uuid-here",
    "discussion_id": "discussion-uuid-here",
    "user_id": "user-uuid-here",
    "content": "Je comprends ce que tu ressens, courage !",
    "created_at": "2024-12-26T10:05:00.000Z"
  }
}
```

### 4.4 Récupérer les Messages
```bash
curl -X GET "http://localhost:3000/api/discussions/DISCUSSION_ID/messages?limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4.5 Discussions Actives
```bash
curl -X GET "http://localhost:3000/api/discussions?limit=10"
```

## 🤝 5. Matchs et Discussions Privées (`/api/match`)

### 5.1 Demander un Match
```bash
curl -X POST http://localhost:3000/api/match/request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "noteId": "NOTE_ID",
    "message": "Ton message m'\''a touché, j'\''aimerais discuter avec toi."
  }'
```

**Réponse attendue :**
```json
{
  "success": true,
  "request": {
    "id": "request-uuid-here",
    "from_user_id": "user-uuid-1",
    "to_user_id": "user-uuid-2",
    "note_id": "note-uuid-here",
    "status": "pending",
    "message": "Ton message m'a touché, j'aimerais discuter avec toi.",
    "created_at": "2024-12-26T10:00:00.000Z",
    "expires_at": "2024-12-27T10:00:00.000Z"
  }
}
```

### 5.2 Demandes Reçues
```bash
curl -X GET http://localhost:3000/api/match/requests/received \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5.3 Demandes Envoyées
```bash
curl -X GET http://localhost:3000/api/match/requests/sent \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5.4 Accepter une Demande
```bash
curl -X POST http://localhost:3000/api/match/requests/REQUEST_ID/accept \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Réponse attendue :**
```json
{
  "success": true,
  "discussion": {
    "id": "private-discussion-uuid",
    "user1_id": "user-uuid-1",
    "user2_id": "user-uuid-2",
    "note_id": "note-uuid-here",
    "created_at": "2024-12-26T10:00:00.000Z",
    "expires_at": "2024-12-26T12:00:00.000Z",
    "is_active": true
  }
}
```

### 5.5 Refuser une Demande
```bash
curl -X POST http://localhost:3000/api/match/requests/REQUEST_ID/decline \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5.6 Mes Discussions Privées
```bash
curl -X GET http://localhost:3000/api/match/discussions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5.7 Récupérer une Discussion Privée
```bash
curl -X GET http://localhost:3000/api/match/discussions/DISCUSSION_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5.8 Envoyer un Message Privé
```bash
curl -X POST http://localhost:3000/api/match/discussions/DISCUSSION_ID/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "content": "Merci de m'\''avoir accepté, j'\''aimerais partager mon expérience..."
  }'
```

### 5.9 Messages Privés
```bash
curl -X GET "http://localhost:3000/api/match/discussions/DISCUSSION_ID/messages?limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔧 6. Administration (`/api/admin`)

### 6.1 Statistiques de la Base de Données
```bash
curl -X GET http://localhost:3000/api/admin/stats/database
```

**Réponse attendue :**
```json
{
  "success": true,
  "stats": {
    "activeUsers": 10,
    "activeNotes": 50,
    "activeDiscussions": 5,
    "totalMessages": 75,
    "pendingMatchRequests": 8,
    "activePrivateDiscussions": 3,
    "totalPrivateMessages": 15,
    "totalReactions": 120,
    "activeSessions": 2
  }
}
```

### 6.2 Statistiques d'Expiration
```bash
curl -X GET http://localhost:3000/api/admin/stats/expiration
```

### 6.3 Informations Système
```bash
curl -X GET http://localhost:3000/api/admin/system
```

### 6.4 Nettoyage Manuel
```bash
curl -X POST http://localhost:3000/api/admin/cleanup
```

### 6.5 Remplir avec des Données (Seeders)
```bash
curl -X POST http://localhost:3000/api/admin/seed
```

### 6.6 Vider la Base de Données
```bash
curl -X POST http://localhost:3000/api/admin/clear
```

### 6.7 Réinitialiser (Vider + Remplir)
```bash
curl -X POST http://localhost:3000/api/admin/reset
```

## 🏥 7. Santé du Serveur

### 7.1 Health Check
```bash
curl -X GET http://localhost:3000/health
```

**Réponse attendue :**
```json
{
  "status": "OK",
  "timestamp": "2024-12-26T10:00:00.000Z",
  "uptime": 3600.123,
  "environment": "development"
}
```

### 7.2 Informations Générales
```bash
curl -X GET http://localhost:3000/
```

## 🧪 Script de Test Complet

Voici un script bash pour tester toutes les API :

```bash
#!/bin/bash

BASE_URL="http://localhost:3000/api"
TOKEN=""

echo "🧪 Test complet des API FeelSame"

# 1. Test de santé
echo "1. Test de santé..."
curl -s "$BASE_URL/../health" | jq .

# 2. Inscription
echo "2. Inscription..."
curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"testapi@example.com","password":"123456"}' | jq .

# 3. Connexion et récupération du token
echo "3. Connexion..."
RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@feelsame.com","password":"123456"}')

TOKEN=$(echo $RESPONSE | jq -r '.token')
echo "Token récupéré: ${TOKEN:0:20}..."

# 4. Test utilisateur actuel
echo "4. Utilisateur actuel..."
curl -s -X GET "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN" | jq .

# 5. Créer une note
echo "5. Créer une note..."
NOTE_RESPONSE=$(curl -s -X POST "$BASE_URL/notes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"emotion":"joie","situation":"travail","content":"Test API - Nouvelle note de test"}')

NOTE_ID=$(echo $NOTE_RESPONSE | jq -r '.note.id')
echo "Note créée: $NOTE_ID"

# 6. Récupérer les notes
echo "6. Récupérer les notes..."
curl -s -X GET "$BASE_URL/notes?limit=5" | jq '.notes | length'

# 7. Ajouter une réaction
echo "7. Ajouter une réaction..."
curl -s -X POST "$BASE_URL/reactions/notes/$NOTE_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"reactionType":"heart"}' | jq .

# 8. Rejoindre une discussion
echo "8. Rejoindre une discussion..."
DISCUSSION_RESPONSE=$(curl -s -X POST "$BASE_URL/discussions/join" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"emotion":"joie","situation":"travail"}')

DISCUSSION_ID=$(echo $DISCUSSION_RESPONSE | jq -r '.discussion.id')
echo "Discussion: $DISCUSSION_ID"

# 9. Envoyer un message
echo "9. Envoyer un message..."
curl -s -X POST "$BASE_URL/discussions/$DISCUSSION_ID/messages" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"content":"Message de test via API"}' | jq .

# 10. Statistiques
echo "10. Statistiques..."
curl -s -X GET "$BASE_URL/admin/stats/database" | jq .

echo "✅ Tests terminés !"
```

## 📱 Test avec Postman

### Collection Postman
Créez une collection avec ces variables :
- `baseUrl`: `http://localhost:3000/api`
- `token`: `{{token}}` (sera rempli automatiquement)

### Script de Pre-request pour l'authentification
```javascript
// Dans les scripts Pre-request de votre collection
if (!pm.globals.get("token")) {
    pm.sendRequest({
        url: pm.globals.get("baseUrl") + "/auth/login",
        method: 'POST',
        header: {
            'Content-Type': 'application/json',
        },
        body: {
            mode: 'raw',
            raw: JSON.stringify({
                email: "user1@feelsame.com",
                password: "123456"
            })
        }
    }, function (err, response) {
        if (response.json().success) {
            pm.globals.set("token", response.json().token);
        }
    });
}
```

## 🎯 Comptes de Test Disponibles

Après avoir exécuté les seeders (`npm run seed`), vous avez 10 comptes :

```
user1@feelsame.com  / 123456
user2@feelsame.com  / 123456
user3@feelsame.com  / 123456
...
user10@feelsame.com / 123456
```

Toutes les API sont maintenant prêtes à être testées ! 🚀