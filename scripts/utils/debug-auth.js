const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function debugAuth() {
    console.log('🔍 Debug de l\'authentification\n');
    
    try {
        // 1. Connexion
        console.log('1️⃣ Connexion...');
        const login = await axios.post(`${API_BASE}/auth/login`, {
            email: 'user1@feelsame.com',
            password: '123456'
        });
        
        const token = login.data.data.token;
        console.log('✅ Connexion réussie');
        console.log('Token reçu:', token.substring(0, 50) + '...');
        
        // 2. Test avec /auth/me
        console.log('\n2️⃣ Test avec /auth/me...');
        try {
            const me = await axios.get(`${API_BASE}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('✅ /auth/me fonctionne:', me.data.data.email);
        } catch (err) {
            console.error('❌ /auth/me échoue:', err.response?.data || err.message);
        }
        
        // 3. Test avec les notes publiques (sans auth)
        console.log('\n3️⃣ Test notes publiques...');
        try {
            const notes = await axios.get(`${API_BASE}/notes?limit=1`);
            console.log('✅ Notes publiques fonctionnent:', notes.data.data.length, 'notes');
        } catch (err) {
            console.error('❌ Notes publiques échouent:', err.response?.data || err.message);
        }
        
        // 4. Test création de note avec auth
        console.log('\n4️⃣ Test création de note...');
        try {
            const newNote = await axios.post(`${API_BASE}/notes`, {
                emotion: 'joie',
                situation: 'travail',
                content: 'Test debug auth'
            }, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('✅ Création de note fonctionne:', newNote.data.data.id);
        } catch (err) {
            console.error('❌ Création de note échoue:', err.response?.data || err.message);
            console.error('Status:', err.response?.status);
        }
        
    } catch (error) {
        console.error('❌ Erreur générale:', error.message);
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', error.response.data);
        }
    }
}

debugAuth();