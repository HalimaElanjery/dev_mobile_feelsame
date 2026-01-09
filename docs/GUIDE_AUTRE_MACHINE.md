# 📦 Guide - Tester sur une Autre Machine

## 🎯 Objectif
Tester l'app React Native sur une machine différente pour confirmer si le problème vient de la configuration réseau de ta machine actuelle.

## 📋 Prérequis sur la Nouvelle Machine

### Logiciels Nécessaires
- **Node.js** (version 18+)
- **MySQL** (ou XAMPP/WAMP)
- **Git** (pour cloner le projet)
- **Expo CLI** : `npm install -g @expo/cli`

### Optionnel pour Mobile
- **Android Studio** (pour émulateur)
- **Expo Go** sur téléphone

## 🚀 Étapes de Migration

### 1. Transférer le Projet

**Option A: Via Git (Recommandée)**
```bash
# Si tu as un repo Git
git clone [URL_DE_TON_REPO]
cd feelsame
```

**Option B: Copie Directe**
- Copie tout le dossier `feelsame` sur clé USB
- Colle sur la nouvelle machine

### 2. Installation des Dépendances

```bash
# Dépendances principales
npm install

# Dépendances backend
cd backend
npm install
cd ..
```

### 3. Configuration Base de Données

**Créer la base de données :**
```sql
CREATE DATABASE feelsame_db;
```

**Importer le schéma :**
```bash
# Dans MySQL
mysql -u root -p feelsame_db < database/schema.sql
```

**Configurer la connexion :**
```javascript
// backend/src/config/database.js
// Vérifier les paramètres MySQL (user, password, host)
```

### 4. Démarrage

```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend
npx expo start --web
```

## 🧪 Tests à Effectuer

### 1. Test Web
- Ouvre `http://localhost:8081` dans le navigateur
- Vérifie que l'app se connecte au backend

### 2. Test Mobile (Si réseau OK)
```bash
# Démarrer en mode LAN
npx expo start --lan

# Noter l'IP de la nouvelle machine
ipconfig  # Windows
ifconfig  # Mac/Linux
```

### 3. Test Émulateur Android
```bash
# Si Android Studio installé
npx expo start
# Appuyer sur 'a' pour Android emulator
```

## 🔧 Configuration IP Automatique

Le projet est configuré pour détecter automatiquement l'IP locale. Si besoin, modifie :

```javascript
// src/config/apiConfig.ts
const MANUAL_CONFIG = {
  IOS_URL: 'http://[NOUVELLE_IP]:3000/api',
  ANDROID_URL: 'http://[NOUVELLE_IP]:3000/api',
  PHYSICAL_DEVICE_URL: 'http://[NOUVELLE_IP]:3000/api',
};
```

## 📊 Résultats Attendus

### Si ça marche sur la nouvelle machine :
✅ **Problème confirmé** : Configuration réseau de ta machine actuelle
- Isolation Wi-Fi, pare-feu, ou profil réseau public

### Si ça ne marche pas non plus :
❌ **Problème dans le code** : Configuration app ou backend
- Vérifier les URLs, ports, CORS

## 🎯 Avantages de ce Test

1. **Diagnostic précis** : Identifier si c'est la machine ou le code
2. **Réseau différent** : Éviter les problèmes d'isolation
3. **Configuration propre** : Nouvelle installation sans conflits
4. **Validation complète** : Tester toutes les fonctionnalités

## 📱 Test Mobile Spécifique

Sur la nouvelle machine :
1. **Connecte ton téléphone** au même Wi-Fi que la nouvelle machine
2. **Teste l'URL** : `http://[IP_NOUVELLE_MACHINE]:3000/health`
3. **Lance Expo** : `npx expo start --lan`
4. **Scanne le QR code** avec Expo Go

## 🔄 Retour sur Ta Machine

Si ça marche sur l'autre machine, tu sauras que le problème vient de :
- Configuration réseau Windows
- Pare-feu ou antivirus
- Profil Wi-Fi en mode "Public"
- Isolation AP du routeur

---

**Ce test te donnera une réponse définitive sur l'origine du problème !** 🎯