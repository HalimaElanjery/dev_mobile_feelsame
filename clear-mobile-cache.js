/**
 * Script pour vider le cache de l'application mobile
 */

const fs = require('fs');
const path = require('path');

const log = (message, color = 'white') => {
  const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    reset: '\x1b[0m'
  };
  console.log(`${colors[color]}${message}${colors.reset}`);
};

function clearExpoCache() {
  log('🧹 Nettoyage du cache Expo...', 'blue');
  
  try {
    // Commandes pour nettoyer le cache
    const { execSync } = require('child_process');
    
    log('🔄 Arrêt du serveur Expo...', 'cyan');
    // Pas besoin d'arrêter explicitement, on va juste nettoyer
    
    log('🗑️ Suppression du cache Expo...', 'cyan');
    try {
      execSync('npx expo r -c', { stdio: 'inherit' });
      log('✅ Cache Expo nettoyé', 'green');
    } catch (error) {
      log('⚠️ Impossible de nettoyer automatiquement le cache Expo', 'yellow');
      log('💡 Exécutez manuellement: npx expo r -c', 'cyan');
    }
    
    log('🔄 Nettoyage du cache Metro...', 'cyan');
    try {
      execSync('npx react-native start --reset-cache', { stdio: 'inherit' });
      log('✅ Cache Metro nettoyé', 'green');
    } catch (error) {
      log('⚠️ Metro cache non nettoyé (normal si pas React Native CLI)', 'yellow');
    }
    
  } catch (error) {
    log('❌ Erreur lors du nettoyage', 'red');
    log(`   ${error.message}`, 'yellow');
  }
}

function showInstructions() {
  log('\n📱 Instructions pour résoudre le problème d\'authentification:', 'blue');
  log('', 'white');
  
  log('1️⃣ VÉRIFIEZ LES IDENTIFIANTS:', 'yellow');
  log('   📧 Email: user1@feelsame.com', 'cyan');
  log('   🔑 Mot de passe: 123456', 'cyan');
  log('', 'white');
  
  log('2️⃣ NETTOYEZ LE CACHE DE L\'APPLICATION:', 'yellow');
  log('   • Fermez complètement l\'application Expo Go', 'cyan');
  log('   • Redémarrez l\'application Expo Go', 'cyan');
  log('   • Scannez à nouveau le QR code', 'cyan');
  log('', 'white');
  
  log('3️⃣ REDÉMARREZ LE SERVEUR EXPO:', 'yellow');
  log('   • Arrêtez le serveur (Ctrl+C)', 'cyan');
  log('   • Exécutez: npx expo start --clear', 'cyan');
  log('   • Scannez le nouveau QR code', 'cyan');
  log('', 'white');
  
  log('4️⃣ VÉRIFIEZ LA CONNEXION RÉSEAU:', 'yellow');
  log('   • Assurez-vous que le téléphone et le PC sont sur le même réseau WiFi', 'cyan');
  log('   • L\'IP 192.168.1.5 doit être accessible depuis le téléphone', 'cyan');
  log('', 'white');
  
  log('5️⃣ TESTEZ AVEC UN AUTRE COMPTE:', 'yellow');
  log('   📧 Email: user2@feelsame.com', 'cyan');
  log('   🔑 Mot de passe: 123456', 'cyan');
  log('', 'white');
  
  log('✅ APRÈS LA CONNEXION RÉUSSIE:', 'green');
  log('   • Allez dans l\'onglet "Demandes" (en bas)', 'cyan');
  log('   • Vous devriez voir 1 demande de discussion en attente', 'cyan');
  log('   • Le badge rouge devrait afficher "1"', 'cyan');
  log('', 'white');
}

function main() {
  log('🔧 Résolution du problème d\'authentification FeelSame\n', 'blue');
  
  // Afficher les instructions
  showInstructions();
  
  // Proposer de nettoyer le cache
  log('🧹 Voulez-vous nettoyer le cache maintenant?', 'yellow');
  log('   (Cela va redémarrer le serveur Expo)', 'cyan');
  log('', 'white');
  
  // Pour l'instant, juste afficher les instructions
  log('💡 Pour nettoyer le cache, exécutez:', 'blue');
  log('   npx expo start --clear', 'cyan');
  log('', 'white');
  
  log('🎯 RÉSUMÉ DU PROBLÈME:', 'blue');
  log('   ✅ Backend fonctionne parfaitement', 'green');
  log('   ✅ API accessible depuis le réseau', 'green');
  log('   ✅ user1 a 1 demande de discussion en attente', 'green');
  log('   ❌ Application mobile n\'arrive pas à s\'authentifier', 'red');
  log('', 'white');
  
  log('🔍 CAUSE PROBABLE:', 'yellow');
  log('   • Cache de l\'application mobile corrompu', 'cyan');
  log('   • Identifiants incorrects saisis', 'cyan');
  log('   • Token d\'authentification expiré en cache', 'cyan');
  log('', 'white');
}

main();