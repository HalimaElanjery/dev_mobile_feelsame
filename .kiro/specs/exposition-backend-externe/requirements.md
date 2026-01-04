# Document des Exigences

## Introduction

Cette fonctionnalité permet d'exposer le backend Express/MySQL de l'application FeelSame via un service externe (ngrok) pour permettre l'accès depuis n'importe quel appareil mobile, même lorsque le réseau local est bloqué. Cette solution est compatible avec Expo Tunnel et facilite le développement et les tests mobiles.

## Glossaire

- **Backend_Local** : Le serveur Express/MySQL fonctionnant sur le PC de développement
- **Service_Exposition** : Service externe (ngrok, Railway, Render) qui expose le backend sur Internet
- **URL_Publique** : URL HTTPS générée par le service d'exposition pour accéder au backend
- **Application_Mobile** : L'application React Native FeelSame
- **Expo_Tunnel** : Mode de tunnel d'Expo pour accéder à l'application depuis des appareils externes
- **Configuration_API** : Paramètres de l'application définissant l'URL du backend

## Exigences

### Exigence 1

**User Story :** En tant que développeur, je veux configurer le backend pour accepter les connexions externes, afin qu'il puisse être accessible via un service d'exposition.

#### Critères d'Acceptation

1. QUAND le serveur Express démarre, ALORS LE Backend_Local DOIT écouter sur toutes les interfaces réseau (0.0.0.0)
2. QUAND une requête est envoyée vers localhost:3000/health, ALORS LE Backend_Local DOIT répondre avec un statut de santé valide
3. QUAND le backend est configuré, ALORS TOUTES LES routes principales (/api/auth, /api/notes, /api/discussions, /api/reactions, /api/match) DOIVENT être accessibles localement

### Exigence 2

**User Story :** En tant que développeur, je veux installer et configurer ngrok, afin d'exposer mon backend local sur Internet via une URL publique sécurisée.

#### Critères d'Acceptation

1. QUAND ngrok est installé globalement, ALORS LE système DOIT permettre l'exécution de la commande ngrok
2. QUAND la commande "ngrok http 3000" est exécutée, ALORS LE Service_Exposition DOIT générer une URL_Publique HTTPS valide
3. QUAND l'URL_Publique est générée, ALORS ELLE DOIT rediriger correctement vers le Backend_Local sur le port 3000
4. QUAND l'URL_Publique/health est testée, ALORS ELLE DOIT retourner la même réponse que localhost:3000/health

### Exigence 3

**User Story :** En tant que développeur, je veux modifier la configuration de l'application mobile pour utiliser l'URL publique, afin que l'application puisse se connecter au backend depuis n'importe quel appareil.

#### Critères d'Acceptation

1. QUAND la Configuration_API est mise à jour, ALORS L'URL du backend DOIT être remplacée par l'URL_Publique ngrok
2. QUAND l'application mobile fait une requête API, ALORS TOUTES LES requêtes DOIVENT utiliser l'URL_Publique au lieu de l'URL locale
3. QUAND l'URL_Publique change, ALORS LA Configuration_API DOIT pouvoir être mise à jour facilement sans recompilation complète
4. QUAND l'application utilise l'URL_Publique, ALORS LES services d'authentification, notes, discussions, réactions et match DOIVENT fonctionner correctement

### Exigence 4

**User Story :** En tant que développeur, je veux lancer l'application avec Expo Tunnel, afin de tester l'application sur des appareils mobiles externes avec le backend exposé.

#### Critères d'Acceptation

1. QUAND la commande "npx expo start --tunnel" est exécutée, ALORS Expo DOIT générer un QR code accessible depuis des appareils externes
2. QUAND le QR code est scanné depuis Expo Go, ALORS L'Application_Mobile DOIT se charger correctement sur l'appareil mobile
3. QUAND l'application mobile est lancée, ALORS ELLE DOIT pouvoir se connecter au backend via l'URL_Publique
4. QUAND l'application mobile interagit avec le backend, ALORS TOUTES LES fonctionnalités (authentification, gestion des notes, discussions, réactions, matching) DOIVENT fonctionner comme en local

### Exigence 5

**User Story :** En tant que développeur, je veux valider que la solution fonctionne end-to-end, afin de m'assurer que l'application mobile peut accéder au backend depuis n'importe quel appareil.

#### Critères d'Acceptation

1. QUAND l'URL_Publique/health est testée depuis un navigateur mobile, ALORS ELLE DOIT retourner un statut de santé valide
2. QUAND l'application mobile est testée sur un appareil externe, ALORS ELLE DOIT pouvoir s'authentifier via le backend exposé
3. QUAND un utilisateur crée une note via l'application mobile, ALORS LA note DOIT être sauvegardée dans la base de données MySQL via le backend exposé
4. QUAND un utilisateur participe à une discussion via l'application mobile, ALORS LES messages DOIVENT être échangés correctement via le backend exposé
5. QUAND l'application mobile perd la connexion Internet, ALORS ELLE DOIT gérer gracieusement les erreurs de connexion au backend

### Exigence 6

**User Story :** En tant que développeur, je veux gérer les limitations et considérations de sécurité de ngrok, afin d'utiliser cette solution de manière appropriée pour le développement.

#### Critères d'Acceptation

1. QUAND ngrok génère une nouvelle URL à chaque redémarrage, ALORS LE système DOIT permettre de mettre à jour facilement la Configuration_API
2. QUAND l'accès Internet est requis, ALORS L'application DOIT afficher des messages d'erreur appropriés en cas de perte de connexion
3. QUAND ngrok est utilisé pour le développement, ALORS LES données sensibles NE DOIVENT PAS être exposées en production via cette méthode
4. QUAND la solution est utilisée, ALORS ELLE DOIT être documentée comme solution de développement temporaire, pas de production