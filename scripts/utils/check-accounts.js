const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function checkAccountsWithNotes() {
    console.log('🔍 Vérification des comptes avec plusieurs notes\n');
    
    const testAccounts = [
        'user1@feelsame.com',
        'user2@feelsame.com', 
        'user3@feelsame.com',
        'user4@feelsame.com',
        'user5@feelsame.com'
    ];
    
    for (const email of testAccounts) {
        try {
            // Connexion
            const login = await axios.post(`${API_BASE}/auth/login`, {
                email: email,
                password: '123456'
            });
            
            const token = login.data.data.token;
            
            // Récupérer les notes de l'utilisateur
            const userNotes = await axios.get(`${API_BASE}/notes/user/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const noteCount = userNotes.data.data?.length || 0;
            
            console.log(`📧 ${email}`);
            console.log(`   🔑 Mot de passe: 123456`);
            console.log(`   📝 Notes: ${noteCount}`);
            
            if (noteCount > 0) {
                console.log(`   📋 Exemples de notes:`);
                userNotes.data.data.slice(0, 3).forEach((note, index) => {
                    console.log(`      ${index + 1}. ${note.emotion} - ${note.situation}: "${note.content.substring(0, 50)}..."`);
                });
            }
            console.log('');
            
        } catch (error) {
            console.log(`❌ ${email}: Erreur - ${error.message}\n`);
        }
    }
}

checkAccountsWithNotes();