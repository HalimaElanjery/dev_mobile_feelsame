/**
 * Vérification directe des demandes dans la base de données
 */

const mysql = require('mysql2/promise');

const log = (message, color = 'white') => {
  const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    reset: '\x1b[0m'
  };
  console.log(`${colors[color]}${message}${colors.reset}`);
};

async function main() {
  let connection;
  
  try {
    log('🔍 Vérification des demandes dans la base de données\n', 'blue');
    
    // Connexion à la base de données
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'feelsame'
    });
    
    log('✅ Connexion à la base de données réussie', 'green');
    
    // 1. Vérifier les utilisateurs
    log('\n1️⃣ Vérification des utilisateurs...', 'blue');
    const [users] = await connection.execute('SELECT id, email FROM users WHERE email IN (?, ?)', 
      ['user1@feelsame.com', 'user2@feelsame.com']);
    
    users.forEach(user => {
      log(`   👤 ${user.email}: ${user.id}`, 'cyan');
    });
    
    const user1 = users.find(u => u.email === 'user1@feelsame.com');
    const user2 = users.find(u => u.email === 'user2@feelsame.com');
    
    // 2. Vérifier les demandes existantes
    log('\n2️⃣ Vérification des demandes existantes...', 'blue');
    const [requests] = await connection.execute(`
      SELECT mr.id, mr.from_user_id, mr.to_user_id, mr.status, mr.created_at, mr.expires_at,
             u1.email as from_email, u2.email as to_email
      FROM match_requests mr
      JOIN users u1 ON mr.from_user_id = u1.id
      JOIN users u2 ON mr.to_user_id = u2.id
      ORDER BY mr.created_at DESC
      LIMIT 10
    `);
    
    log(`✅ ${requests.length} demande(s) trouvée(s)`, 'green');
    
    requests.forEach((req, index) => {
      log(`   ${index + 1}. ${req.from_email} → ${req.to_email}`, 'cyan');
      log(`      ID: ${req.id}`, 'cyan');
      log(`      Status: ${req.status}`, 'cyan');
      log(`      Créée: ${req.created_at}`, 'cyan');
      log(`      Expire: ${req.expires_at}`, 'cyan');
      log('', 'white');
    });
    
    // 3. Vérifier les demandes spécifiquement pour user1
    log('\n3️⃣ Demandes reçues par user1...', 'blue');
    const [user1Requests] = await connection.execute(`
      SELECT mr.id, mr.from_user_id, mr.status, mr.created_at, mr.expires_at,
             u.email as from_email
      FROM match_requests mr
      JOIN users u ON mr.from_user_id = u.id
      WHERE mr.to_user_id = ? AND mr.status = 'pending'
      ORDER BY mr.created_at DESC
    `, [user1.id]);
    
    log(`✅ ${user1Requests.length} demande(s) en attente pour user1`, 'green');
    
    user1Requests.forEach((req, index) => {
      log(`   ${index + 1}. De: ${req.from_email}`, 'cyan');
      log(`      ID: ${req.id}`, 'cyan');
      log(`      Status: ${req.status}`, 'cyan');
      log(`      Créée: ${req.created_at}`, 'cyan');
    });
    
    // 4. Créer une demande manuellement si nécessaire
    if (user1Requests.length === 0) {
      log('\n4️⃣ Création manuelle d\'une demande...', 'blue');
      
      // Récupérer une note de user1
      const [notes] = await connection.execute(`
        SELECT id FROM notes WHERE user_id = ? AND is_active = TRUE LIMIT 1
      `, [user1.id]);
      
      if (notes.length > 0) {
        const noteId = notes[0].id;
        const requestId = require('crypto').randomUUID();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
        
        await connection.execute(`
          INSERT INTO match_requests (id, from_user_id, to_user_id, note_id, message, expires_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [requestId, user2.id, user1.id, noteId, 'Demande créée manuellement pour test', expiresAt]);
        
        log('✅ Demande créée manuellement', 'green');
        log(`   ID: ${requestId}`, 'cyan');
        log(`   De: user2 → user1`, 'cyan');
        log(`   Note: ${noteId}`, 'cyan');
      } else {
        log('❌ Aucune note trouvée pour créer la demande', 'red');
      }
    }
    
    // 5. Vérifier les discussions privées
    log('\n5️⃣ Vérification des discussions privées...', 'blue');
    const [discussions] = await connection.execute(`
      SELECT pd.id, pd.user1_id, pd.user2_id, pd.is_active, pd.created_at, pd.expires_at,
             u1.email as user1_email, u2.email as user2_email
      FROM private_discussions pd
      JOIN users u1 ON pd.user1_id = u1.id
      JOIN users u2 ON pd.user2_id = u2.id
      WHERE (pd.user1_id = ? OR pd.user2_id = ?) OR (pd.user1_id = ? OR pd.user2_id = ?)
      ORDER BY pd.created_at DESC
    `, [user1.id, user1.id, user2.id, user2.id]);
    
    log(`✅ ${discussions.length} discussion(s) trouvée(s)`, 'green');
    
    discussions.forEach((disc, index) => {
      log(`   ${index + 1}. ${disc.user1_email} ↔ ${disc.user2_email}`, 'cyan');
      log(`      ID: ${disc.id}`, 'cyan');
      log(`      Active: ${disc.is_active}`, 'cyan');
      log(`      Créée: ${disc.created_at}`, 'cyan');
      log(`      Expire: ${disc.expires_at}`, 'cyan');
      log('', 'white');
    });
    
  } catch (error) {
    log(`❌ Erreur: ${error.message}`, 'red');
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

main();