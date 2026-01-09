# 🚀 Guide de Démarrage Rapide - FeelSame

## ✅ Application Prête à l'Emploi

L'application FeelSame est **configurée et prête** avec tous les composants nécessaires.

### 🔧 Démarrage en 3 Étapes

#### 1. 🗄️ Démarrer MySQL
```bash
# Assurez-vous que MySQL est démarré
# Sous Windows avec XAMPP: Démarrer Apache et MySQL
```

#### 2. 🔗 Démarrer le Backend
```bash
cd backend
npm run dev
```

#### 3. 📱 Démarrer le Frontend
```bash
# Pour mobile ET web
npx expo start

# Pour web uniquement (si problème mobile)
npx expo start --web
```

### 🧪 Test Rapide
```bash
# Vérifier que tout fonctionne
node test-simple.js
```

### 🔐 Connexion
```
Email: user1@feelsame.com
Mot de passe: 123456
```

### 🌐 URLs d'Accès
- **API Backend**: http://localhost:3000
- **Frontend Web**: http://localhost:19006 (ou port affiché)
- **Mobile**: Scanner le QR code avec Expo Go

### 📊 Données Incluses
- ✅ **15 utilisateurs** de test
- ✅ **70+ notes** émotionnelles
- ✅ **Discussions** et messages
- ✅ **Base de données** configurée

### 🆘 En Cas de Problème
1. **Backend ne démarre pas**: Vérifier MySQL
2. **Frontend ne se connecte pas**: Vérifier l'IP dans `src/config/apiConfig.ts`
3. **Expo ne fonctionne pas**: Utiliser `npx expo start --web`

### 🎯 Fonctionnalités à Tester
- 📝 Création de notes émotionnelles
- 💬 Discussions de groupe
- 🤝 Demandes de match privé
- 👤 Gestion du profil et des notes

**L'application est prête pour la démonstration !** 🎉