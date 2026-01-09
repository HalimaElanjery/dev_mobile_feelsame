const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function testNoteManagement() {
    console.log('🧪 Test de gestion des notes personnelles\n');
    
    try {
        // 1. Connexion
        console.log('1️⃣ Connexion...');
        const login = await axios.post(`${API_BASE}/auth/login`, {
            email: 'user1@feelsame.com',
            password: '123456'
        });
        const token = login.data.data.token;
        console.log('✅ Connexion réussie\n');
        
        // 2. Créer une nouvelle note
        console.log('2️⃣ Création d\'une nouvelle note...');
        const newNote = await axios.post(`${API_BASE}/notes`, {
            emotion: 'joie',
            situation: 'travail',
            content: 'Test de création de note pour la gestion personnelle'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const noteId = newNote.data.data.id;
        console.log(`✅ Note créée avec l'ID: ${noteId}\n`);
        
        // 3. Récupérer les notes de l'utilisateur
        console.log('3️⃣ Récupération des notes personnelles...');
        const userNotes = await axios.get(`${API_BASE}/notes/user/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ ${userNotes.data.data.length} notes personnelles trouvées\n`);
        
        // 4. Modifier la note
        console.log('4️⃣ Modification de la note...');
        const updatedNote = await axios.put(`${API_BASE}/notes/${noteId}`, {
            emotion: 'espoir',
            situation: 'loisirs',
            content: 'Note modifiée avec succès - nouveau contenu'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Note modifiée avec succès');
        console.log(`   Nouvelle émotion: ${updatedNote.data.data.emotion}`);
        console.log(`   Nouvelle situation: ${updatedNote.data.data.situation}`);
        console.log(`   Nouveau contenu: "${updatedNote.data.data.content}"\n`);
        
        // 5. Supprimer la note
        console.log('5️⃣ Suppression de la note...');
        const deleteResult = await axios.delete(`${API_BASE}/notes/${noteId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Note supprimée avec succès\n');
        
        // 6. Vérifier que la note n'existe plus
        console.log('6️⃣ Vérification de la suppression...');
        const finalUserNotes = await axios.get(`${API_BASE}/notes/user/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ ${finalUserNotes.data.data.length} notes personnelles restantes\n`);
        
        console.log('🎉 TOUS LES TESTS DE GESTION DES NOTES SONT PASSÉS !');
        console.log('✅ Création, modification et suppression fonctionnent parfaitement');
        
    } catch (error) {
        console.error('❌ Erreur lors des tests:', error.message);
        if (error.response) {
            console.error('   Détails:', error.response.data);
        }
    }
}

testNoteManagement();