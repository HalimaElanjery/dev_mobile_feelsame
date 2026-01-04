# Données Mock / Fake Data

Ce fichier explique comment utiliser les données mock (fausses données) pour tester l'application.

## 📁 Fichiers créés

- `src/data/mockData.ts` - Contient les données mock (utilisateurs et notes)
- `src/services/mockDataService.ts` - Service pour charger les données mock

## 📊 Contenu des données mock

### Utilisateurs (5 utilisateurs fictifs)
- user_1 à user_5 avec des emails et dates de création différentes

### Notes (20 notes fictives)
Les notes couvrent différentes combinaisons d'émotions et de situations :

**Émotions :**
- Joie (joy)
- Tristesse (sadness)
- Colère (anger)
- Peur (fear)
- Anxiété (anxiety)
- Amour (love)
- Déception (disappointment)
- Espoir (hope)
- Solitude (loneliness)
- Gratitude (gratitude)

**Situations :**
- Travail
- Relations
- Études
- Santé
- Finances
- Famille
- Projet personnel
- Transition de vie
- Perte
- Célébration
- Décision importante

## 🚀 Utilisation

### Chargement automatique
Les données mock sont automatiquement chargées au démarrage de l'application (sans écraser vos notes existantes).

### Chargement manuel
Si vous voulez charger manuellement les données mock, vous pouvez utiliser :

```typescript
import { addMockNotes, initializeMockData, resetWithMockData } from './src/services/mockDataService';

// Ajouter uniquement les notes mock (sans écraser)
await addMockNotes();

// Initialiser avec toutes les données mock
await initializeMockData();

// Réinitialiser complètement (supprime toutes les données existantes)
await resetWithMockData();
```

## 📝 Exemples de notes incluses

- **Joie - Travail** : "Aujourd'hui j'ai reçu une promotion !"
- **Tristesse - Relations** : "J'ai perdu quelqu'un de cher récemment..."
- **Anxiété - Études** : "J'ai un examen important demain..."
- **Peur - Santé** : "J'ai des résultats médicaux à attendre..."
- **Amour - Relations** : "Je suis tombé amoureux..."
- Et bien d'autres...

## 🔄 API Simulée

Le fichier `mockData.ts` contient aussi une API simulée :

```typescript
import { mockApi } from './src/data/mockData';

// Récupérer toutes les notes
const allNotes = await mockApi.getAllNotes();

// Récupérer les notes filtrées
const notes = await mockApi.getNotesByEmotionAndSituation('joy', 'Travail');

// Récupérer tous les utilisateurs
const users = await mockApi.getAllUsers();
```

## 💡 Notes importantes

- Les données mock sont chargées **sans écraser** vos notes existantes
- Les notes mock ont des dates différentes pour simuler un historique
- Les utilisateurs mock ne sont pas utilisés pour l'authentification (seulement pour les notes)
- Vous pouvez modifier `mockData.ts` pour ajouter vos propres données de test

## 🎯 Utilisation pour les tests

Ces données mock sont parfaites pour :
- Tester l'affichage des notes dans différents espaces émotionnels
- Voir comment l'application gère plusieurs notes
- Tester le filtrage par émotion et situation
- Développer sans avoir à créer manuellement des notes

