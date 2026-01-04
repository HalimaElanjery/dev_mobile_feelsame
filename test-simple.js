const axios = require('axios');

async function testSimple() {
    console.log('🧪 Test simple de l\'application FeelSame\n');
    
    try {
        // Test de santé
        const health = await axios.get('http://localhost:3000/health');
        console.log('✅ Serveur backend: ACTIF');
        console.log(`   Uptime: ${Math.round(health.data.uptime)}s`);
        console.log(`   Environnement: ${health.data.environment}\n`);
        
        // Test des notes publiques (sans auth)
        const notes = await axios.get('http://localhost:3000/api/notes?limit=3');
        console.log('✅ API Notes: FONCTIONNELLE');
        console.log(`   Notes disponibles: ${notes.data.data.length}`);
        if (notes.data.data.length > 0) {
            console.log(`   Exemple: "${notes.data.data[0].content.substring(0, 40)}..."`);
        }
        console.log('');
        
        // Test des statistiques
        const stats = await axios.get('http://localhost:3000/api/admin/stats/database');
        console.log('✅ Base de données: CONNECTÉE');
        console.log(`   Utilisateurs: ${stats.data.stats.activeUsers}`);
        console.log(`   Notes: ${stats.data.stats.activeNotes}`);
        console.log(`   Discussions: ${stats.data.stats.activeDiscussions}`);
        console.log(`   Messages: ${stats.data.stats.totalMessages}`);
        console.log(`   Réactions: ${stats.data.stats.totalReactions}\n`);
        
        console.log('🎉 APPLICATION PRÊTE !');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📱 Frontend React Native: http://localhost:8081');
        console.log('🔗 Backend API: http://localhost:3000');
        console.log('🗄️ Base de données MySQL: feelsame_db');
        console.log('📊 Données de test: Disponibles');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('');
        console.log('🚀 Pour tester l\'application:');
        console.log('   1. Ouvrez http://localhost:8081 dans votre navigateur');
        console.log('   2. Ou scannez le QR code avec Expo Go sur mobile');
        console.log('   3. Utilisez les comptes de test:');
        console.log('      Email: user1@feelsame.com à user10@feelsame.com');
        console.log('      Mot de passe: 123456');
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error('   Le serveur backend n\'est pas démarré');
        }
    }
}

testSimple();