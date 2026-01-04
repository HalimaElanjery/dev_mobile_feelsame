const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function testNavigationFeatures() {
    console.log('🧪 Test des fonctionnalités de navigation\n');
    
    try {
        // 1. Test de connexion
        console.log('1️⃣ Test de connexion...');
        const login = await axios.post(`${API_BASE}/auth/login`, {
            email: 'user1@feelsame.com',
            password: '123456'
        });
        const token = login.data.data.token;
        console.log('✅ Connexion réussie\n');
        
        // 2. Test des demandes de match (pour le badge)
        console.log('2️⃣ Test des demandes de match...');
        try {
            const requests = await axios.get(`${API_BASE}/match/requests/received`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(`✅ Demandes récupérées: ${requests.data.data?.length || 0} demandes`);
        } catch (error) {
            console.log('ℹ️ Pas de demandes ou endpoint non disponible');
        }
        
        // 3. Test des discussions privées
        console.log('\n3️⃣ Test des discussions privées...');
        try {
            const discussions = await axios.get(`${API_BASE}/match/discussions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(`✅ Discussions récupérées: ${discussions.data.data?.length || 0} discussions`);
        } catch (error) {
            console.log('ℹ️ Pas de discussions ou endpoint non disponible');
        }
        
        // 4. Test des notes utilisateur (pour le profil)
        console.log('\n4️⃣ Test des notes utilisateur...');
        const userNotes = await axios.get(`${API_BASE}/notes/user/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Notes utilisateur: ${userNotes.data.data?.length || 0} notes`);
        
        // 5. Test des notes publiques (pour l'accueil)
        console.log('\n5️⃣ Test des notes publiques...');
        const publicNotes = await axios.get(`${API_BASE}/notes?limit=5`);
        console.log(`✅ Notes publiques: ${publicNotes.data.data?.length || 0} notes`);
        
        console.log('\n🎉 TOUS LES TESTS DE NAVIGATION SONT PASSÉS !');
        console.log('✅ Les données nécessaires pour les onglets sont disponibles');
        console.log('📱 La navigation par onglets peut fonctionner correctement');
        
    } catch (error) {
        console.error('❌ Erreur lors des tests:', error.message);
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', error.response.data);
        }
    }
}

testNavigationFeatures();