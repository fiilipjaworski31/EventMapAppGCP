const Friends = require('../models/friends.model');
const User = require('../models/user.model');
const Interested = require('../models/interested.model');

// Pobiera listę znajomych użytkownika
exports.getFriends = async (req, res) => {
  try {
    const user = await User.findByFirebaseId(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: 'Nie znaleziono użytkownika.' });
    }
    
    const friends = await Friends.findFriendsByUserId(user.id);
    res.status(200).json(friends);
  } catch (error) {
    res.status(500).json({ message: 'Błąd podczas pobierania znajomych.', error: error.message });
  }
};

// Wysyła zaproszenie do znajomości po username
exports.sendFriendRequest = async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ message: 'Nazwa użytkownika jest wymagana.' });
    }
    
    const requester = await User.findByFirebaseId(req.user.uid);
    if (!requester) {
      return res.status(404).json({ message: 'Nie znaleziono użytkownika.' });
    }
    
    const addressee = await Friends.findUserByUsername(username);
    if (!addressee) {
      return res.status(404).json({ message: 'Nie znaleziono użytkownika o podanej nazwie.' });
    }
    
    if (requester.id === addressee.id) {
      return res.status(400).json({ message: 'Nie możesz dodać siebie do znajomych.' });
    }
    
    // Sprawdź czy już istnieje znajomość lub zaproszenie
    const existingFriendship = await Friends.checkFriendshipStatus(requester.id, addressee.id);
    if (existingFriendship) {
      if (existingFriendship.status === 'accepted') {
        return res.status(409).json({ message: 'Ten użytkownik jest już Twoim znajomym.' });
      } else if (existingFriendship.status === 'pending') {
        return res.status(409).json({ message: 'Zaproszenie do tego użytkownika już zostało wysłane.' });
      }
    }
    
    await Friends.sendFriendRequest(requester.id, addressee.id);
    res.status(201).json({ message: 'Zaproszenie do znajomości zostało wysłane.' });
  } catch (error) {
    res.status(500).json({ message: 'Błąd podczas wysyłania zaproszenia.', error: error.message });
  }
};

// Akceptuje zaproszenie do znajomości
exports.acceptFriendRequest = async (req, res) => {
  try {
    const { requesterId } = req.params;
    
    const addressee = await User.findByFirebaseId(req.user.uid);
    if (!addressee) {
      return res.status(404).json({ message: 'Nie znaleziono użytkownika.' });
    }
    
    const result = await Friends.acceptFriendRequest(parseInt(requesterId), addressee.id);
    if (result === 0) {
      return res.status(404).json({ message: 'Nie znaleziono zaproszenia do zaakceptowania.' });
    }
    
    res.status(200).json({ message: 'Zaproszenie zostało zaakceptowane.' });
  } catch (error) {
    res.status(500).json({ message: 'Błąd podczas akceptowania zaproszenia.', error: error.message });
  }
};

// Odrzuca zaproszenie do znajomości
exports.declineFriendRequest = async (req, res) => {
  try {
    const { requesterId } = req.params;
    
    const addressee = await User.findByFirebaseId(req.user.uid);
    if (!addressee) {
      return res.status(404).json({ message: 'Nie znaleziono użytkownika.' });
    }
    
    const result = await Friends.declineFriendRequest(parseInt(requesterId), addressee.id);
    if (result === 0) {
      return res.status(404).json({ message: 'Nie znaleziono zaproszenia do odrzucenia.' });
    }
    
    res.status(200).json({ message: 'Zaproszenie zostało odrzucone.' });
  } catch (error) {
    res.status(500).json({ message: 'Błąd podczas odrzucania zaproszenia.', error: error.message });
  }
};

// Usuwa znajomego
exports.removeFriend = async (req, res) => {
  try {
    const { friendId } = req.params;
    
    const user = await User.findByFirebaseId(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: 'Nie znaleziono użytkownika.' });
    }
    
    const result = await Friends.removeFriend(user.id, parseInt(friendId));
    if (result === 0) {
      return res.status(404).json({ message: 'Nie znaleziono znajomości do usunięcia.' });
    }
    
    res.status(200).json({ message: 'Znajomość została usunięta.' });
  } catch (error) {
    res.status(500).json({ message: 'Błąd podczas usuwania znajomego.', error: error.message });
  }
};

// Pobiera oczekujące zaproszenia
exports.getPendingRequests = async (req, res) => {
  try {
    const user = await User.findByFirebaseId(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: 'Nie znaleziono użytkownika.' });
    }
    
    const pendingRequests = await Friends.getPendingRequests(user.id);
    res.status(200).json(pendingRequests);
  } catch (error) {
    res.status(500).json({ message: 'Błąd podczas pobierania zaproszeń.', error: error.message });
  }
};

// Pobiera polubione wydarzenia znajomego
exports.getFriendInterestedEvents = async (req, res) => {
  try {
    const { friendId } = req.params;
    
    const user = await User.findByFirebaseId(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: 'Nie znaleziono użytkownika.' });
    }
    
    // Sprawdź czy użytkownik jest znajomym
    const friendship = await Friends.checkFriendshipStatus(user.id, parseInt(friendId));
    if (!friendship || friendship.status !== 'accepted') {
      return res.status(403).json({ message: 'Nie masz uprawnień do przeglądania wydarzeń tego użytkownika.' });
    }
    
    const events = await Interested.findEventsByUserId(parseInt(friendId));
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Błąd podczas pobierania wydarzeń znajomego.', error: error.message });
  }
};