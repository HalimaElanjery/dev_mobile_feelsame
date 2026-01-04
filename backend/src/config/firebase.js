const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
// WARNING: YOU MUST ADD YOUR serviceAccountKey.json to backend/src/config/
// If not present, this will fail or try to use default credentials (env vars).

try {
    // Try to load service account if it exists
    const serviceAccount = require('./serviceAccountKey.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log('🔥 Firebase Admin initialized with serviceAccountKey.json');
} catch (error) {
    console.log('⚠️ serviceAccountKey.json not found, attempting to use application default credentials...');
    try {
        admin.initializeApp({
            credential: admin.credential.applicationDefault()
        });
        console.log('🔥 Firebase Admin initialized with default credentials');
    } catch (err) {
        console.error('❌ Failed to initialize Firebase Admin:', err.message);
    }
}

module.exports = admin;
