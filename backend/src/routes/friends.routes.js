const express = require('express');
const router = express.Router();
const friendsController = require('../controllers/friends.controller');
const authenticate = require('../middleware/authenticate');

// Wszystkie ścieżki wymagają uwierzytelnienia
router.use(authenticate);

// GET /api/friends - Pobiera listę znajomych
router.get('/', friendsController.getFriends);

// POST /api/friends - Wysyła zaproszenie do znajomości
router.post('/', friendsController.sendFriendRequest);

// GET /api/friends/requests - Pobiera oczekujące zaproszenia
router.get('/requests', friendsController.getPendingRequests);

// PUT /api/friends/accept/:requesterId - Akceptuje zaproszenie do znajomości
router.put('/accept/:requesterId', friendsController.acceptFriendRequest);

// PUT /api/friends/decline/:requesterId - Odrzuca zaproszenie do znajomości
router.put('/decline/:requesterId', friendsController.declineFriendRequest);

// DELETE /api/friends/:friendId - Usuwa znajomego
router.delete('/:friendId', friendsController.removeFriend);

// GET /api/friends/:friendId/events - Pobiera polubione wydarzenia znajomego
router.get('/:friendId/events', friendsController.getFriendInterestedEvents);

module.exports = router;