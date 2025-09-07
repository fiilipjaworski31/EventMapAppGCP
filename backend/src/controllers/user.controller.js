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

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByFirebaseId(req.user.uid);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      created_at: user.created_at
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user data.' });
  }
};