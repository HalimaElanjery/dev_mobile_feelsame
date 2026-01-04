const axios = require('axios');

async function resetTestData() {
  try {
    console.log('🧹 Nettoyage et création de nouvelles données de test\n');

    // 1. Se connecter avec user1 pour créer une nouvelle note
    const loginUser1 = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'user1@feelsame.com',
      password: '123456'
    });

    const tokenUser1 = loginUser1.data.data.token;
    console.log('✅ Connecté avec user1');

    // 2. Créer une nouvelle note avec user1
    const createResponse = await axios.post('http://localhost:3000/api/notes', {
      emotion: 'sadness',
      situation: 'Travail',
      content: 'Je me sens vraiment dépassé par ma charge de travail. Quelqu\'un d\'autre vit la même chose ?'
    }, {
      headers: {
        'Authorization': `Bearer ${tokenUser1}`
      }
    });

    const newNote = createResponse.data.data;
    console.log('✅ Nouvelle note créée par user1:', newNote.id);

    // 3. Se connecter avec user2 pour envoyer une demande
    const loginUser2 = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'user2@feelsame.com',
      password: '123456'
    });

    const tokenUser2 = loginUser2.data.data.token;
    console.log('✅ Connecté avec user2');

    // 4. Envoyer une demande de match de user2 vers user1
    const matchResponse = await axios.post('http://localhost:3000/api/match/request', {
      noteId: newNote.id,
      toUserId: newNote.user_id,
      message: 'Salut ! Ton message résonne vraiment avec ce que je vis. On peut en parler ?'
    }, {
      headers: {
        'Authorization': `Bearer ${tokenUser2}`
      }
    });

    console.log('✅ Nouvelle demande créée:', matchResponse.data.data.id);

    // 5. Se connecter avec user3 pour envoyer une autre demande
    const loginUser3 = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'user3@feelsame.com',
      password: '123456'
    });

    const tokenUser3 = loginUser3.data.data.token;
    console.log('✅ Connecté avec user3');

    // 6. Envoyer une deuxième demande
    const matchResponse2 = await axios.post('http://localhost:3000/api/match/request', {
      noteId: newNote.id,
      toUserId: newNote.user_id,
      message: 'Je traverse exactement la même situation. Ça m\'aiderait beaucoup de discuter avec toi.'
    }, {
      headers: {
        'Authorization': `Bearer ${tokenUser3}`
      }
    });

    console.log('✅ Deuxième demande créée:', matchResponse2.data.data.id);

    console.log('\n🎯 Données de test prêtes !');
    console.log('📋 Pour tester :');
    console.log('   1. Se connecter avec user1@feelsame.com');
    console.log('   2. Aller dans "Demandes de match" (💬)');
    console.log('   3. Voir les 2 nouvelles demandes');
    console.log('   4. Tester l\'acceptation');

  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

resetTestData();