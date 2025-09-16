const User = require('../models/user.model');

// Tworzy wpis użytkownika w DB, jeśli nie istnieje, na podstawie tokenu Firebase
module.exports = async function ensureAppUser(req, res, next) {
  try {
    const firebaseUid = req.user && req.user.uid;
    const email = (req.user && req.user.email) || null;
    if (!firebaseUid) {
      return res.status(401).send('Brak autoryzacji: brak uid w tokenie.');
    }

    const existing = await User.findByFirebaseId(firebaseUid);
    if (!existing) {
      const generatedUsername = email ? email.split('@')[0] : `user_${firebaseUid.slice(0, 8)}`;
      try {
        await User.create({ firebase_uid: firebaseUid, email, username: generatedUsername });
      } catch (err) {
        // Jeśli równolegle utworzono użytkownika, zignoruj błąd unikalności
        if (err && err.code !== '23505') {
          throw err;
        }
      }
    }
    return next();
  } catch (err) {
    console.error('ensureAppUser error:', err);
    return res.status(500).json({ error: 'Błąd podczas zakładania profilu użytkownika.' });
  }
};


