console.log("--- ▶️ START: Ładowanie pliku friend.routes.js ---");
const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friend.controller');
// --- POCZĄTEK SPRAWDZANIA ---
console.log("--- 🕵️ Sprawdzanie obiektu friendController ---");
console.log(friendController);
console.log("Czy funkcja 'getFriends' istnieje?:", typeof friendController.getFriends);
// --- KONIEC SPRAWDZANIA ---
const authenticate = require('../middleware/authenticate');

// Wszystkie route'y wymagają uwierzytelnienia
router.use(authenticate);

// POST /api/friends/search - Wyszukaj użytkownika
router.post('/search', friendController.searchUser);

// POST /api/friends/request - Wyślij zaproszenie
router.post('/request', friendController.sendFriendRequest);

// GET /api/friends - Pobierz listę znajomych
router.get('/', friendController.getFriends);

// GET /api/friends/requests/pending - Pobierz oczekujące zaproszenia
router.get('/requests/pending', friendController.getPendingRequests);

// GET /api/friends/requests/sent - Pobierz wysłane zaproszenia
router.get('/requests/sent', friendController.getSentRequests);

// PUT /api/friends/requests/:requestId/accept - Zaakceptuj zaproszenie
router.put('/requests/:requestId/accept', friendController.acceptFriendRequest);

// PUT /api/friends/requests/:requestId/reject - Odrzuć zaproszenie
router.put('/requests/:requestId/reject', friendController.rejectFriendRequest);

// DELETE /api/friends/:friendId - Usuń znajomego
router.delete('/:friendId', friendController.removeFriend);

// GET /api/friends/:friendId/interested - Pobierz polubione wydarzenia znajomego
router.get('/:friendId/interested', friendController.getFriendInterestedEvents);

console.log("--- ✅ KONIEC: Pomyślnie załadowano friend.routes.js ---");
module.exports = router;