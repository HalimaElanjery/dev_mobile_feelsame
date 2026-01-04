/**
 * Middleware d'authentification Firebase (Remplace JWT)
 */

const { verifyFirebaseToken } = require('./firebaseAuth');
const admin = require('../config/firebase');
// const { query } = require('../config/database'); // If needed to fetch full profile in optionalAuth

/**
 * Middleware pour vérifier le token (Maintenant délégué à Firebase)
 */
const authenticateToken = verifyFirebaseToken;

/**
 * Middleware optionnel pour récupérer l'utilisateur si connecté
 */
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // We already have the logic to sync/fetch user in verifyFirebaseToken.
    // To avoid duplication, we can reuse the logic, BUT verifyFirebaseToken sends responses.
    // Ideally, specific sync logic should be extracted.
    // For now, let's just decode the token. 
    // If the full user object from DB is needed (like userId vs firebase_uid), 
    // we would need to duplicate the DB lookup logic here or refactor.

    // Assuming for now simple decoding is enough to "know" who it is, 
    // BUT the rest of the app expects req.user.userId (UUID).
    // So we DO need the DB lookup.

    const { query } = require('../config/database');
    const { uid, email } = decodedToken;
    let users = await query('SELECT id, email FROM users WHERE firebase_uid = ?', [uid]);

    if (users.length === 0 && email) {
      users = await query('SELECT id, email FROM users WHERE email = ?', [email]);
    }

    if (users.length > 0) {
      req.user = { userId: users[0].id, email: users[0].email };
    } else {
      // User valid in Firebase but not in DB? 
      // We could create them here too, but optionalAuth usually implies "read only" or "if available".
      req.user = null;
    }
  } catch (error) {
    req.user = null;
  }

  next();
};

module.exports = {
  authenticateToken,
  optionalAuth
};