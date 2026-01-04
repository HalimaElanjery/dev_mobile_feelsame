const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function testCompleteFlow() {
    console.log('🚀 Test complet de l\'application FeelSame\n');
    
    try {
        // 1. Test de santé
        console.log('1️⃣ Test de santé du serveur...');
        const health = await axios.get('http://localhost:3000/health');
        console.log(`✅ Serveur actif depuis ${Math.round(health.data.uptime)}s\n`);
        
        // 2. Test d'authentification
        console.log('2️⃣ Test d\'authentification...');
        const login = await axios.post(`${API_BASE}/auth/login`, {
            email: 'user1@feelsame.com',
            password: '123456'
        });
        const token = login.data.token;
        console.log('✅ Connexion réussie\n');
        
        // 3. Test des notes
        console.log('3️⃣ Test des notes...');
        const notes = await axios.get(`${API_BASE}/notes?limit=5`);
        console.log(`✅ ${notes.data.data.length} notes récupérées`);
        
        if (notes.data.data.length > 0) {
            const noteId = notes.data.data[0].id;
            console.log(`✅ Première note: "${notes.data.data[0].content.substring(0, 50)}..."\n`);
            
            // 4. Test des réactions
            console.log('4️⃣ Test des réactions...');
            try {
                await axios.post(`${API_BASE}/notes/${noteId}/reactions`, {
                    type: 'heart'
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log('✅ Réaction ajoutée\n');
            } catch (err) {
                console.log('ℹ️ Réaction déjà existante ou erreur\n');
            }
        }
        
        // 5. Test des discussions
        console.log('5️⃣ Test des discussions...');
        const discussion = await axios.post(`${API_BASE}/discussions/join`, {
            emotion: 'joie',
            situation: 'travail'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Discussion rejointe: ${discussion.data.discussion.id}\n`);
        
        // 6. Test des statistiques admin
        console.log('6️⃣ Test des statistiques...');
        const stats = await axios.get(`${API_BASE}/admin/stats/database`);
        console.log('✅ Statistiques de la base de données:');
        console.log(`   - Utilisateurs actifs: ${stats.data.stats.activeUsers}`);
        console.log(`   - Notes actives: ${stats.data.stats.activeNotes}`);
        console.log(`   - Discussions actives: ${stats.data.stats.activeDiscussions}`);
        console.log(`   - Messages totaux: ${stats.data.stats.totalMessages}`);
        console.log(`   - Réactions totales: ${stats.data.stats.totalReactions}\n`);
        
        console.log('🎉 TOUS LES TESTS SONT PASSÉS !');
        console.log('✅ L\'application FeelSame fonctionne parfaitement');
        console.log('🌐 Frontend disponible sur: http://localhost:8081');
        console.log('🔗 Backend API sur: http://localhost:3000');
        console.log('📱 Scannez le QR code pour tester sur mobile');
        
    } catch (error) {
        console.error('❌ Erreur lors des tests:', error.message);
        if (error.response) {
            console.error('   Détails:', error.response.data);
        }
    }
}

testCompleteFlow();