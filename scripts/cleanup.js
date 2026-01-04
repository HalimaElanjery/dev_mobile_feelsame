#!/usr/bin/env node

/**
 * Script de nettoyage et d'organisation du projet FeelSame
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

/**
 * Vérifie si un fichier/dossier existe
 */
const exists = (filePath) => {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
};

/**
 * Supprime un fichier s'il existe
 */
const removeFile = (filePath) => {
  if (exists(filePath)) {
    try {
      fs.unlinkSync(filePath);
      log(`✅ Supprimé: ${filePath}`, 'green');
      return true;
    } catch (error) {
      log(`❌ Erreur lors de la suppression de ${filePath}: ${error.message}`, 'red');
      return false;
    }
  }
  return false;
};

/**
 * Supprime un dossier s'il existe
 */
const removeDirectory = (dirPath) => {
  if (exists(dirPath)) {
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
      log(`✅ Dossier supprimé: ${dirPath}`, 'green');
      return true;
    } catch (error) {
      log(`❌ Erreur lors de la suppression du dossier ${dirPath}: ${error.message}`, 'red');
      return false;
    }
  }
  return false;
};

/**
 * Crée un dossier s'il n'existe pas
 */
const createDirectory = (dirPath) => {
  if (!exists(dirPath)) {
    try {
      fs.mkdirSync(dirPath, { recursive: true });
      log(`✅ Dossier créé: ${dirPath}`, 'green');
      return true;
    } catch (error) {
      log(`❌ Erreur lors de la création du dossier ${dirPath}: ${error.message}`, 'red');
      return false;
    }
  }
  return false;
};

/**
 * Vérifie la structure du projet
 */
const checkProjectStructure = () => {
  log('\n🔍 Vérification de la structure du projet...', 'blue');
  
  const requiredDirs = [
    'src',
    'backend/src',
    'database',
    'docs'
  ];
  
  const requiredFiles = [
    'package.json',
    'backend/package.json',
    'database/schema.sql',
    'README.md'
  ];
  
  let allGood = true;
  
  // Vérifier les dossiers
  requiredDirs.forEach(dir => {
    if (!exists(dir)) {
      log(`❌ Dossier manquant: ${dir}`, 'red');
      allGood = false;
    } else {
      log(`✅ Dossier OK: ${dir}`, 'green');
    }
  });
  
  // Vérifier les fichiers
  requiredFiles.forEach(file => {
    if (!exists(file)) {
      log(`❌ Fichier manquant: ${file}`, 'red');
      allGood = false;
    } else {
      log(`✅ Fichier OK: ${file}`, 'green');
    }
  });
  
  return allGood;
};

/**
 * Nettoie les fichiers temporaires et inutiles
 */
const cleanupTempFiles = () => {
  log('\n🧹 Nettoyage des fichiers temporaires...', 'blue');
  
  const tempFiles = [
    // Fichiers de log
    '*.log',
    'npm-debug.log*',
    'yarn-debug.log*',
    'yarn-error.log*',
    
    // Fichiers temporaires
    '.tmp',
    '.temp',
    'temp',
    
    // Fichiers de sauvegarde
    '*.bak',
    '*.backup',
    '*~',
    
    // Fichiers système
    '.DS_Store',
    'Thumbs.db',
    'desktop.ini'
  ];
  
  let cleaned = 0;
  
  // Nettoyer dans le dossier racine
  tempFiles.forEach(pattern => {
    // Simulation simple - en réalité il faudrait utiliser glob
    if (pattern.includes('*')) {
      // Ignorer les patterns avec wildcards pour cette version simple
      return;
    }
    
    if (removeFile(pattern)) {
      cleaned++;
    }
  });
  
  // Nettoyer les dossiers node_modules de test
  const testNodeModules = [
    'test/node_modules',
    'tests/node_modules',
    'temp/node_modules'
  ];
  
  testNodeModules.forEach(dir => {
    if (removeDirectory(dir)) {
      cleaned++;
    }
  });
  
  log(`✅ ${cleaned} éléments nettoyés`, 'green');
};

/**
 * Organise la documentation
 */
const organizeDocumentation = () => {
  log('\n📚 Organisation de la documentation...', 'blue');
  
  // Créer le dossier docs s'il n'existe pas
  createDirectory('docs');
  
  // Vérifier que tous les guides sont présents
  const docs = [
    'SETUP_MYSQL.md',
    'MIGRATION_COMPLETE.md',
    'SEEDERS_GUIDE.md',
    'GUIDE_DEMARRAGE.md',
    'GUIDE_DISCUSSIONS_PRIVEES.md'
  ];
  
  let docsOk = 0;
  docs.forEach(doc => {
    if (exists(doc)) {
      log(`✅ Documentation OK: ${doc}`, 'green');
      docsOk++;
    } else {
      log(`❌ Documentation manquante: ${doc}`, 'red');
    }
  });
  
  log(`📊 Documentation: ${docsOk}/${docs.length} fichiers présents`, 'cyan');
};

/**
 * Vérifie les dépendances
 */
const checkDependencies = () => {
  log('\n📦 Vérification des dépendances...', 'blue');
  
  // Vérifier package.json principal
  if (exists('package.json')) {
    try {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const deps = Object.keys(pkg.dependencies || {}).length;
      const devDeps = Object.keys(pkg.devDependencies || {}).length;
      log(`✅ Frontend: ${deps} dépendances, ${devDeps} dev`, 'green');
    } catch (error) {
      log(`❌ Erreur lecture package.json: ${error.message}`, 'red');
    }
  }
  
  // Vérifier package.json backend
  if (exists('backend/package.json')) {
    try {
      const pkg = JSON.parse(fs.readFileSync('backend/package.json', 'utf8'));
      const deps = Object.keys(pkg.dependencies || {}).length;
      const devDeps = Object.keys(pkg.devDependencies || {}).length;
      log(`✅ Backend: ${deps} dépendances, ${devDeps} dev`, 'green');
    } catch (error) {
      log(`❌ Erreur lecture backend/package.json: ${error.message}`, 'red');
    }
  }
};

/**
 * Affiche un résumé du projet
 */
const showProjectSummary = () => {
  log('\n📊 Résumé du projet FeelSame', 'bright');
  
  // Compter les fichiers par type
  const counts = {
    components: 0,
    screens: 0,
    services: 0,
    routes: 0,
    docs: 0
  };
  
  // Compter les composants
  if (exists('src/components')) {
    try {
      counts.components = fs.readdirSync('src/components').filter(f => f.endsWith('.tsx')).length;
    } catch {}
  }
  
  // Compter les écrans
  if (exists('src/screens')) {
    try {
      counts.screens = fs.readdirSync('src/screens').filter(f => f.endsWith('.tsx')).length;
    } catch {}
  }
  
  // Compter les services
  if (exists('src/services')) {
    try {
      counts.services = fs.readdirSync('src/services').filter(f => f.endsWith('.ts')).length;
    } catch {}
  }
  
  // Compter les routes backend
  if (exists('backend/src/routes')) {
    try {
      counts.routes = fs.readdirSync('backend/src/routes').filter(f => f.endsWith('.js')).length;
    } catch {}
  }
  
  // Compter la documentation
  const docFiles = ['README.md', 'SETUP_MYSQL.md', 'MIGRATION_COMPLETE.md', 'SEEDERS_GUIDE.md'];
  counts.docs = docFiles.filter(f => exists(f)).length;
  
  log(`   📱 Composants React Native: ${counts.components}`, 'cyan');
  log(`   📺 Écrans: ${counts.screens}`, 'cyan');
  log(`   🔧 Services: ${counts.services}`, 'cyan');
  log(`   🛣️  Routes API: ${counts.routes}`, 'cyan');
  log(`   📚 Documentation: ${counts.docs}`, 'cyan');
};

/**
 * Fonction principale
 */
const main = () => {
  log('🚀 Script de nettoyage et d\'organisation FeelSame\n', 'bright');
  
  // Vérifier la structure
  const structureOk = checkProjectStructure();
  
  // Nettoyer les fichiers temporaires
  cleanupTempFiles();
  
  // Organiser la documentation
  organizeDocumentation();
  
  // Vérifier les dépendances
  checkDependencies();
  
  // Afficher le résumé
  showProjectSummary();
  
  // Conclusion
  if (structureOk) {
    log('\n🎉 Projet nettoyé et organisé avec succès !', 'green');
  } else {
    log('\n⚠️ Projet nettoyé mais certains éléments manquent', 'yellow');
  }
  
  log('\n💡 Prochaines étapes recommandées:', 'bright');
  log('   1. Vérifier que MySQL est configuré (SETUP_MYSQL.md)', 'cyan');
  log('   2. Installer les dépendances: npm install', 'cyan');
  log('   3. Démarrer le backend: cd backend && npm run dev', 'cyan');
  log('   4. Remplir avec des données: npm run seed', 'cyan');
  log('   5. Démarrer l\'app: npm start', 'cyan');
};

// Exécuter le script
main();