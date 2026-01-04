#!/usr/bin/env node

/**
 * Script CLI pour gérer les seeders
 */

const { seedDatabase, clearDatabase } = require('../seeders/seedData');
const { testConnection } = require('../config/database');

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const showHelp = () => {
  log('\n📚 Gestionnaire de Seeders FeelSame\n', 'bright');
  log('Usage: npm run seed [command]', 'cyan');
  log('\nCommandes disponibles:', 'bright');
  log('  seed     - Remplit la base de données avec des données de test', 'green');
  log('  clear    - Vide complètement la base de données', 'red');
  log('  reset    - Vide puis remplit la base de données', 'yellow');
  log('  help     - Affiche cette aide', 'blue');
  log('\nExemples:', 'bright');
  log('  npm run seed', 'cyan');
  log('  npm run seed clear', 'cyan');
  log('  npm run seed reset', 'cyan');
  log('');
};

const confirmAction = (message) => {
  return new Promise((resolve) => {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question(`${colors.yellow}${message} (y/N): ${colors.reset}`, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
};

const main = async () => {
  const command = process.argv[2] || 'seed';
  
  // Afficher l'aide
  if (command === 'help' || command === '--help' || command === '-h') {
    showHelp();
    return;
  }
  
  try {
    // Tester la connexion à la base de données
    log('🔌 Test de connexion à la base de données...', 'blue');
    const connected = await testConnection();
    
    if (!connected) {
      log('❌ Impossible de se connecter à la base de données', 'red');
      log('Vérifiez votre configuration dans le fichier .env', 'yellow');
      process.exit(1);
    }
    
    log('✅ Connexion à la base de données réussie\n', 'green');
    
    switch (command) {
      case 'seed':
        log('🌱 Démarrage du seeding...', 'green');
        const seedSuccess = await seedDatabase();
        if (seedSuccess) {
          log('\n🎉 Seeding terminé avec succès !', 'green');
        } else {
          log('\n❌ Erreur lors du seeding', 'red');
          process.exit(1);
        }
        break;
        
      case 'clear':
        const confirmClear = await confirmAction('⚠️ Êtes-vous sûr de vouloir vider la base de données ?');
        if (confirmClear) {
          log('🧹 Nettoyage de la base de données...', 'yellow');
          const clearSuccess = await clearDatabase();
          if (clearSuccess) {
            log('✅ Base de données vidée avec succès', 'green');
          } else {
            log('❌ Erreur lors du nettoyage', 'red');
            process.exit(1);
          }
        } else {
          log('Opération annulée', 'yellow');
        }
        break;
        
      case 'reset':
        const confirmReset = await confirmAction('⚠️ Êtes-vous sûr de vouloir réinitialiser la base de données ?');
        if (confirmReset) {
          log('🔄 Réinitialisation de la base de données...', 'yellow');
          
          // Vider d'abord
          const clearSuccess = await clearDatabase();
          if (!clearSuccess) {
            log('❌ Erreur lors du nettoyage', 'red');
            process.exit(1);
          }
          
          // Puis remplir
          const seedSuccess = await seedDatabase();
          if (seedSuccess) {
            log('\n🎉 Réinitialisation terminée avec succès !', 'green');
          } else {
            log('\n❌ Erreur lors du seeding', 'red');
            process.exit(1);
          }
        } else {
          log('Opération annulée', 'yellow');
        }
        break;
        
      default:
        log(`❌ Commande inconnue: ${command}`, 'red');
        log('Utilisez "npm run seed help" pour voir les commandes disponibles', 'yellow');
        process.exit(1);
    }
    
  } catch (error) {
    log(`❌ Erreur: ${error.message}`, 'red');
    process.exit(1);
  }
  
  process.exit(0);
};

// Gestion des signaux d'interruption
process.on('SIGINT', () => {
  log('\n\n🛑 Opération interrompue par l\'utilisateur', 'yellow');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('\n\n🛑 Opération terminée', 'yellow');
  process.exit(0);
});

// Exécuter le script
main();