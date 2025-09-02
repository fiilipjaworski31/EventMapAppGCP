const User = require('../models/user.model');
console.log("--- ✅ [CONTROLLER] Wczytano kontroler użytkownika ---");

exports.createUser = async (req, res) => {
   console.log("--- 🔥 [HANDLER] OTRZYMANO ŻĄDANIE POST /api/users ---");
   try {
    const { firebase_uid, email, username } = req.body;
    if (!firebase_uid || !email || !username) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }
    const [newUser] = await User.create({ firebase_uid, email, username });
    res.status(201).json(newUser);
  } catch (error) {
    // Obsługa błędu unikalności nicku
    if (error.code === '23505') { 
        return res.status(409).json({ error: 'Username already exists.' });
    }
    res.status(500).json({ error: 'Failed to create user.' });
  }
};