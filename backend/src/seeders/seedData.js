/**
 * Seeders pour remplir la base de données avec des données de test
 */

const bcrypt = require('bcrypt');
const { query, generateUUID } = require('../config/database');

// Données de test
const EMOTIONS = ['joie', 'tristesse', 'colère', 'peur', 'surprise', 'dégoût', 'anxiété', 'espoir'];
const SITUATIONS = ['travail', 'famille', 'amour', 'amitié', 'santé', 'études', 'argent', 'loisirs'];

const SAMPLE_NOTES = [
  {
    emotion: 'joie',
    situation: 'travail',
    content: 'J\'ai enfin décroché le poste de mes rêves ! Après des mois de recherche, je commence lundi. Je suis tellement excité(e) de cette nouvelle aventure.'
  },
  {
    emotion: 'tristesse',
    situation: 'famille',
    content: 'Ma grand-mère nous a quittés ce matin. Elle était ma confidente, celle qui m\'écoutait toujours. Je vais tellement la regretter.'
  },
  {
    emotion: 'anxiété',
    situation: 'études',
    content: 'Les examens approchent et je me sens complètement dépassé(e). J\'ai l\'impression de ne rien retenir malgré mes révisions.'
  },
  {
    emotion: 'espoir',
    situation: 'santé',
    content: 'Les résultats de mes analyses sont encourageants. Le médecin dit que le traitement fonctionne bien. Je reprends confiance.'
  },
  {
    emotion: 'colère',
    situation: 'travail',
    content: 'Mon chef m\'a encore fait des reproches injustes devant toute l\'équipe. Je ne mérite pas d\'être traité(e) comme ça.'
  },
  {
    emotion: 'joie',
    situation: 'amour',
    content: 'Il/elle m\'a dit oui ! Nous nous marions l\'année prochaine. Je n\'arrive pas à réaliser que nous allons construire notre vie ensemble.'
  },
  {
    emotion: 'peur',
    situation: 'santé',
    content: 'J\'ai rendez-vous chez le spécialiste demain pour les résultats. Je n\'arrive pas à dormir, j\'imagine le pire.'
  },
  {
    emotion: 'tristesse',
    situation: 'amitié',
    content: 'Mon meilleur ami déménage à l\'étranger. Nous nous connaissons depuis l\'enfance, ça va être dur de ne plus l\'avoir près de moi.'
  },
  {
    emotion: 'surprise',
    situation: 'famille',
    content: 'Mes parents m\'ont annoncé qu\'ils divorçaient. Après 25 ans de mariage, je ne m\'y attendais vraiment pas.'
  },
  {
    emotion: 'joie',
    situation: 'loisirs',
    content: 'J\'ai terminé mon premier marathon ! 4h30 de course, mais j\'ai réussi. Je suis fier(e) de moi et de ma persévérance.'
  },
  {
    emotion: 'anxiété',
    situation: 'argent',
    content: 'Les factures s\'accumulent et mon salaire ne suffit plus. Je ne sais pas comment je vais m\'en sortir ce mois-ci.'
  },
  {
    emotion: 'espoir',
    situation: 'travail',
    content: 'J\'ai eu un entretien très prometteur aujourd\'hui. L\'équipe avait l\'air sympa et le projet m\'intéresse vraiment.'
  },
  {
    emotion: 'colère',
    situation: 'famille',
    content: 'Mes parents ne comprennent pas mes choix de vie. Ils critiquent constamment mes décisions sans essayer de me comprendre.'
  },
  {
    emotion: 'joie',
    situation: 'amitié',
    content: 'Retrouvailles incroyables avec mes amis d\'enfance ! Nous avons ri comme avant, comme si le temps ne s\'était pas écoulé.'
  },
  {
    emotion: 'tristesse',
    situation: 'amour',
    content: 'Nous avons décidé de nous séparer après 3 ans ensemble. C\'est d\'un commun accord mais ça fait mal quand même.'
  },
  {
    emotion: 'peur',
    situation: 'études',
    content: 'Je présente ma thèse dans une semaine. Et si je n\'étais pas à la hauteur ? Et si toutes ces années d\'études ne servaient à rien ?'
  },
  {
    emotion: 'surprise',
    situation: 'travail',
    content: 'Mon patron m\'a proposé une promotion inattendue ! Je ne pensais pas être remarqué(e), mais apparemment mon travail paie.'
  },
  {
    emotion: 'joie',
    situation: 'famille',
    content: 'Ma sœur a accouché ! Je suis tante/oncle pour la première fois. Ce petit bout de chou est déjà tout mon monde.'
  },
  {
    emotion: 'anxiété',
    situation: 'santé',
    content: 'J\'ai des symptômes bizarres depuis quelques jours. J\'ai pris rendez-vous chez le médecin mais l\'attente me stresse.'
  },
  {
    emotion: 'espoir',
    situation: 'amour',
    content: 'Après des mois de célibat, j\'ai rencontré quelqu\'un de spécial. Nous avons eu un premier rendez-vous magique.'
  }
];

const SAMPLE_MESSAGES = [
  'Je comprends ce que tu ressens, j\'ai vécu quelque chose de similaire.',
  'Courage, ça va aller mieux ! 💪',
  'Tu n\'es pas seul(e) dans cette épreuve.',
  'Merci de partager ton expérience, ça m\'aide beaucoup.',
  'Je te souhaite plein de bonheur pour la suite !',
  'Prends soin de toi, c\'est le plus important.',
  'Tes émotions sont légitimes, ne les ignore pas.',
  'Parfois il faut du temps pour guérir, sois patient(e) avec toi-même.',
  'Félicitations ! Tu mérites ce bonheur.',
  'Je t\'envoie toute ma force et mon soutien.',
  'C\'est normal de se sentir comme ça dans cette situation.',
  'Tu as fait le bon choix, fais-toi confiance.',
  'L\'avenir te réserve de belles surprises, j\'en suis sûr(e).',
  'Merci pour ce partage, ça me touche beaucoup.',
  'Tu es plus fort(e) que tu ne le penses.'
];

/**
 * Crée des utilisateurs de test
 */
const createTestUsers = async () => {
  console.log('👥 Création des utilisateurs de test...');
  
  const users = [];
  const saltRounds = 12;
  
  for (let i = 1; i <= 10; i++) {
    const userId = generateUUID();
    const email = `user${i}@feelsame.com`;
    const passwordHash = await bcrypt.hash('123456', saltRounds);
    
    await query(
      'INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)',
      [userId, email, passwordHash]
    );
    
    users.push({ id: userId, email });
  }
  
  console.log(`✅ ${users.length} utilisateurs créés`);
  return users;
};

/**
 * Crée des notes de test
 */
const createTestNotes = async (users) => {
  console.log('📝 Création des notes de test...');
  
  const notes = [];
  
  // Créer des notes avec le contenu prédéfini
  for (let i = 0; i < SAMPLE_NOTES.length; i++) {
    const noteData = SAMPLE_NOTES[i];
    const noteId = generateUUID();
    const userId = users[i % users.length].id;
    
    await query(
      'INSERT INTO notes (id, user_id, emotion, situation, content) VALUES (?, ?, ?, ?, ?)',
      [noteId, userId, noteData.emotion, noteData.situation, noteData.content]
    );
    
    notes.push({
      id: noteId,
      userId,
      emotion: noteData.emotion,
      situation: noteData.situation,
      content: noteData.content
    });
  }
  
  // Créer des notes supplémentaires aléatoirement
  for (let i = 0; i < 30; i++) {
    const noteId = generateUUID();
    const userId = users[Math.floor(Math.random() * users.length)].id;
    const emotion = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)];
    const situation = SITUATIONS[Math.floor(Math.random() * SITUATIONS.length)];
    const content = `Note générée automatiquement pour tester l'émotion ${emotion} dans la situation ${situation}. Contenu de test numéro ${i + 1}.`;
    
    await query(
      'INSERT INTO notes (id, user_id, emotion, situation, content) VALUES (?, ?, ?, ?, ?)',
      [noteId, userId, emotion, situation, content]
    );
    
    notes.push({ id: noteId, userId, emotion, situation, content });
  }
  
  console.log(`✅ ${notes.length} notes créées`);
  return notes;
};

/**
 * Crée des réactions sur les notes
 */
const createTestReactions = async (users, notes) => {
  console.log('❤️ Création des réactions de test...');
  
  const reactionTypes = ['heart', 'comfort', 'strength', 'gratitude', 'hope'];
  let reactionCount = 0;
  
  for (const note of notes) {
    // Chaque note a entre 0 et 8 réactions
    const numReactions = Math.floor(Math.random() * 9);
    
    for (let i = 0; i < numReactions; i++) {
      const userId = users[Math.floor(Math.random() * users.length)].id;
      const reactionType = reactionTypes[Math.floor(Math.random() * reactionTypes.length)];
      
      // Éviter les doublons (même utilisateur, même note, même type)
      try {
        const reactionId = generateUUID();
        await query(
          'INSERT INTO note_reactions (id, note_id, user_id, reaction_type) VALUES (?, ?, ?, ?)',
          [reactionId, note.id, userId, reactionType]
        );
        reactionCount++;
      } catch (error) {
        // Ignorer les erreurs de doublons
      }
    }
  }
  
  console.log(`✅ ${reactionCount} réactions créées`);
};

/**
 * Crée des discussions et messages de test
 */
const createTestDiscussions = async (users, notes) => {
  console.log('💬 Création des discussions de test...');
  
  const discussions = [];
  
  // Créer 5 discussions actives
  for (let i = 0; i < 5; i++) {
    const discussionId = generateUUID();
    const emotion = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)];
    const situation = SITUATIONS[Math.floor(Math.random() * SITUATIONS.length)];
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes
    
    await query(
      'INSERT INTO discussions (id, emotion, situation, expires_at) VALUES (?, ?, ?, ?)',
      [discussionId, emotion, situation, expiresAt]
    );
    
    discussions.push({ id: discussionId, emotion, situation });
    
    // Ajouter des messages à chaque discussion
    const numMessages = Math.floor(Math.random() * 10) + 5; // 5-15 messages
    
    for (let j = 0; j < numMessages; j++) {
      const messageId = generateUUID();
      const userId = users[Math.floor(Math.random() * users.length)].id;
      const content = SAMPLE_MESSAGES[Math.floor(Math.random() * SAMPLE_MESSAGES.length)];
      
      await query(
        'INSERT INTO messages (id, discussion_id, user_id, content) VALUES (?, ?, ?, ?)',
        [messageId, discussionId, userId, content]
      );
    }
  }
  
  console.log(`✅ ${discussions.length} discussions créées avec des messages`);
  return discussions;
};

/**
 * Crée des demandes de match de test
 */
const createTestMatchRequests = async (users, notes) => {
  console.log('🤝 Création des demandes de match de test...');
  
  let requestCount = 0;
  
  // Créer 10 demandes de match
  for (let i = 0; i < 10; i++) {
    const requestId = generateUUID();
    const fromUser = users[Math.floor(Math.random() * users.length)];
    const note = notes[Math.floor(Math.random() * notes.length)];
    const toUserId = note.userId;
    
    // Éviter les demandes à soi-même
    if (fromUser.id === toUserId) continue;
    
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 heures
    const messages = [
      'J\'aimerais discuter avec toi de ton expérience.',
      'Ton message m\'a touché, peux-tu m\'en dire plus ?',
      'Je vis quelque chose de similaire, on pourrait échanger ?',
      'Merci pour ton partage, j\'aimerais te parler en privé.',
      'Ton témoignage m\'aide beaucoup, accepterais-tu de discuter ?'
    ];
    const message = messages[Math.floor(Math.random() * messages.length)];
    
    try {
      await query(
        'INSERT INTO match_requests (id, from_user_id, to_user_id, note_id, message, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
        [requestId, fromUser.id, toUserId, note.id, message, expiresAt]
      );
      requestCount++;
    } catch (error) {
      // Ignorer les erreurs de doublons
    }
  }
  
  console.log(`✅ ${requestCount} demandes de match créées`);
};

/**
 * Crée des discussions privées de test
 */
const createTestPrivateDiscussions = async (users, notes) => {
  console.log('🔒 Création des discussions privées de test...');
  
  let discussionCount = 0;
  
  // Créer 3 discussions privées actives
  for (let i = 0; i < 3; i++) {
    const discussionId = generateUUID();
    const user1 = users[Math.floor(Math.random() * users.length)];
    const user2 = users[Math.floor(Math.random() * users.length)];
    
    // Éviter les discussions avec soi-même
    if (user1.id === user2.id) continue;
    
    const note = notes[Math.floor(Math.random() * notes.length)];
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 heures
    
    await query(
      'INSERT INTO private_discussions (id, user1_id, user2_id, note_id, expires_at) VALUES (?, ?, ?, ?, ?)',
      [discussionId, user1.id, user2.id, note.id, expiresAt]
    );
    
    // Ajouter quelques messages privés
    const numMessages = Math.floor(Math.random() * 8) + 3; // 3-10 messages
    
    for (let j = 0; j < numMessages; j++) {
      const messageId = generateUUID();
      const senderId = j % 2 === 0 ? user1.id : user2.id; // Alternance
      const content = SAMPLE_MESSAGES[Math.floor(Math.random() * SAMPLE_MESSAGES.length)];
      
      await query(
        'INSERT INTO private_messages (id, discussion_id, user_id, content) VALUES (?, ?, ?, ?)',
        [messageId, discussionId, senderId, content]
      );
    }
    
    discussionCount++;
  }
  
  console.log(`✅ ${discussionCount} discussions privées créées avec des messages`);
};

/**
 * Fonction principale de seeding
 */
const seedDatabase = async () => {
  try {
    console.log('🌱 Démarrage du seeding de la base de données...\n');
    
    // Vérifier si des données existent déjà
    const existingUsers = await query('SELECT COUNT(*) as count FROM users');
    if (existingUsers[0].count > 0) {
      console.log('⚠️ La base de données contient déjà des données.');
      console.log('Voulez-vous continuer ? Cela ajoutera des données supplémentaires.\n');
    }
    
    // Créer les données de test
    const users = await createTestUsers();
    const notes = await createTestNotes(users);
    await createTestReactions(users, notes);
    await createTestDiscussions(users, notes);
    await createTestMatchRequests(users, notes);
    await createTestPrivateDiscussions(users, notes);
    
    console.log('\n🎉 Seeding terminé avec succès !');
    console.log('\n📊 Résumé des données créées :');
    console.log(`   👥 Utilisateurs: ${users.length}`);
    console.log(`   📝 Notes: ${notes.length}`);
    console.log(`   💬 Discussions actives: 5`);
    console.log(`   🤝 Demandes de match: ~10`);
    console.log(`   🔒 Discussions privées: ~3`);
    console.log(`   ❤️ Réactions: Variables`);
    
    console.log('\n🔑 Comptes de test créés :');
    for (let i = 1; i <= 10; i++) {
      console.log(`   📧 user${i}@feelsame.com / 🔒 123456`);
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    return false;
  }
};

/**
 * Nettoie toutes les données de test
 */
const clearDatabase = async () => {
  try {
    console.log('🧹 Nettoyage de la base de données...');
    
    // Supprimer dans l'ordre inverse des dépendances
    await query('DELETE FROM private_messages');
    await query('DELETE FROM private_discussions');
    await query('DELETE FROM match_requests');
    await query('DELETE FROM messages');
    await query('DELETE FROM discussions');
    await query('DELETE FROM note_reactions');
    await query('DELETE FROM user_sessions');
    await query('DELETE FROM notes');
    await query('DELETE FROM users');
    
    console.log('✅ Base de données nettoyée');
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    return false;
  }
};

module.exports = {
  seedDatabase,
  clearDatabase
};