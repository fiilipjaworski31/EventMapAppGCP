const Friend = require('../models/friend.model');
const User = require('../models/user.model');
const admin = require('firebase-admin');

// POST /api/friends/search - Wyszukaj użytkownika po email lub username
exports.searchUser = async (req, res) => {
  try {
    const { emailOrUsername } = req.body;
    
    if (!emailOrUsername) {
      return res.status(400).json({ error: 'Email lub username jest wymagany.' });
    }

    // 1) Najpierw szukaj w lokalnej bazie (po email LUB username)
    let dbUser = await Friend.findUserByEmailOrUsername(emailOrUsername);

    // 2) Jeśli nie znaleziono i zapytanie wygląda jak email, spróbuj pobrać z Firebase
    const looksLikeEmail = /.+@.+\..+/.test(emailOrUsername);
    if (!dbUser && looksLikeEmail) {
      try {
        const fbUser = await admin.auth().getUserByEmail(emailOrUsername);
        if (fbUser) {
          // Sprawdź, czy mamy już użytkownika po firebase_uid
          dbUser = await User.findByFirebaseId(fbUser.uid);
          if (!dbUser) {
            const generatedUsername = (fbUser.email && fbUser.email.split('@')[0]) || `user_${fbUser.uid.slice(0, 8)}`;
            try {
              const [created] = await User.create({ firebase_uid: fbUser.uid, email: fbUser.email, username: generatedUsername });
              dbUser = created;
            } catch (err) {
              // Jeśli ktoś równolegle utworzył wpis, pobierz ponownie
              if (err && err.code === '23505') {
                dbUser = await User.findByFirebaseId(fbUser.uid);
              } else {
                throw err;
              }
            }
          }
        }
      } catch (_) {
        // Ignoruj: jeśli nie ma w Firebase, przejdziemy do 404 poniżej
      }
    }

    if (!dbUser) {
      return res.status(404).json({ error: 'Użytkownik nie został znaleziony.' });
    }

    const safeUser = { id: dbUser.id, username: dbUser.username, email: dbUser.email };
    res.status(200).json(safeUser);
  } catch (error) {
    console.error('Error searching user:', error);
    res.status(500).json({ error: 'Błąd podczas wyszukiwania użytkownika.' });
  }
};

// POST /api/friends/request - Wyślij zaproszenie do znajomości
exports.sendFriendRequest = async (req, res) => {
  try {
    const { friendId } = req.body;
    const currentUser = await User.findByFirebaseId(req.user.uid);
    
    if (!currentUser) {
      return res.status(404).json({ error: 'Użytkownik nie został znaleziony.' });
    }

    if (currentUser.id === parseInt(friendId)) {
      return res.status(400).json({ error: 'Nie możesz dodać siebie jako znajomego.' });
    }

    // Sprawdź czy już istnieje jakaś relacja
    const existingFriendship = await Friend.getFriendshipStatus(currentUser.id, friendId);
    
    if (existingFriendship) {
      if (existingFriendship.status === 'pending') {
        return res.status(409).json({ error: 'Zaproszenie już zostało wysłane.' });
      } else if (existingFriendship.status === 'accepted') {
        return res.status(409).json({ error: 'Jesteście już znajomymi.' });
      }
    }

    const [request] = await Friend.sendFriendRequest(currentUser.id, friendId);
    res.status(201).json({ message: 'Zaproszenie zostało wysłane.', request });
  } catch (error) {
    console.error('Error sending friend request:', error);
    if (error.code === '23505') { // Unique constraint violation
      return res.status(409).json({ error: 'Zaproszenie już zostało wysłane.' });
    }
    res.status(500).json({ error: 'Błąd podczas wysyłania zaproszenia.' });
  }
};

// GET /api/friends - Pobierz listę znajomych
exports.getFriends = async (req, res) => {
  try {
    const currentUser = await User.findByFirebaseId(req.user.uid);
    if (!currentUser) {
      return res.status(404).json({ error: 'Użytkownik nie został znaleziony.' });
    }

    const friends = await Friend.getFriends(currentUser.id);
    res.status(200).json(friends);
  } catch (error) {
    console.error('Error getting friends:', error);
    res.status(500).json({ error: 'Błąd podczas pobierania znajomych.' });
  }
};

// GET /api/friends/requests/pending - Pobierz oczekujące zaproszenia
exports.getPendingRequests = async (req, res) => {
  try {
    const currentUser = await User.findByFirebaseId(req.user.uid);
    if (!currentUser) {
      return res.status(404).json({ error: 'Użytkownik nie został znaleziony.' });
    }

    const requests = await Friend.getPendingRequests(currentUser.id);
    res.status(200).json(requests);
  } catch (error) {
    console.error('Error getting pending requests:', error);
    res.status(500).json({ error: 'Błąd podczas pobierania zaproszeń.' });
  }
};

// GET /api/friends/requests/sent - Pobierz wysłane zaproszenia
exports.getSentRequests = async (req, res) => {
  try {
    const currentUser = await User.findByFirebaseId(req.user.uid);
    if (!currentUser) {
      return res.status(404).json({ error: 'Użytkownik nie został znaleziony.' });
    }

    const requests = await Friend.getSentRequests(currentUser.id);
    res.status(200).json(requests);
  } catch (error) {
    console.error('Error getting sent requests:', error);
    res.status(500).json({ error: 'Błąd podczas pobierania wysłanych zaproszeń.' });
  }
};

// PUT /api/friends/requests/:requestId/accept - Zaakceptuj zaproszenie
exports.acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const currentUser = await User.findByFirebaseId(req.user.uid);
    
    if (!currentUser) {
      return res.status(404).json({ error: 'Użytkownik nie został znaleziony.' });
    }

    const [updatedRequest] = await Friend.acceptFriendRequest(requestId, currentUser.id);
    
    if (!updatedRequest) {
      return res.status(404).json({ error: 'Zaproszenie nie zostało znalezione.' });
    }

    res.status(200).json({ message: 'Zaproszenie zostało zaakceptowane.', request: updatedRequest });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    res.status(500).json({ error: 'Błąd podczas akceptowania zaproszenia.' });
  }
};

// PUT /api/friends/requests/:requestId/reject - Odrzuć zaproszenie
exports.rejectFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const currentUser = await User.findByFirebaseId(req.user.uid);
    
    if (!currentUser) {
      return res.status(404).json({ error: 'Użytkownik nie został znaleziony.' });
    }

    const [updatedRequest] = await Friend.rejectFriendRequest(requestId, currentUser.id);
    
    if (!updatedRequest) {
      return res.status(404).json({ error: 'Zaproszenie nie zostało znalezione.' });
    }

    res.status(200).json({ message: 'Zaproszenie zostało odrzucone.', request: updatedRequest });
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    res.status(500).json({ error: 'Błąd podczas odrzucania zaproszenia.' });
  }
};

// DELETE /api/friends/:friendId - Usuń znajomego
exports.removeFriend = async (req, res) => {
  try {
    const { friendId } = req.params;
    const currentUser = await User.findByFirebaseId(req.user.uid);
    
    if (!currentUser) {
      return res.status(404).json({ error: 'Użytkownik nie został znaleziony.' });
    }

    await Friend.removeFriend(currentUser.id, friendId);
    res.status(200).json({ message: 'Znajomy został usunięty.' });
  } catch (error) {
    console.error('Error removing friend:', error);
    res.status(500).json({ error: 'Błąd podczas usuwania znajomego.' });
  }
};

// GET /api/friends/:friendId/interested - Pobierz polubione wydarzenia znajomego
exports.getFriendInterestedEvents = async (req, res) => {
  try {
    const { friendId } = req.params;
    const currentUser = await User.findByFirebaseId(req.user.uid);
    
    if (!currentUser) {
      return res.status(404).json({ error: 'Użytkownik nie został znaleziony.' });
    }

    const events = await Friend.getFriendInterestedEvents(currentUser.id, friendId);
    res.status(200).json(events);
  } catch (error) {
    if (error.message === 'Not friends') {
      return res.status(403).json({ error: 'Nie jesteście znajomymi.' });
    }
    console.error('Error getting friend interested events:', error);
    res.status(500).json({ error: 'Błąd podczas pobierania polubionych wydarzeń.' });
  }
};