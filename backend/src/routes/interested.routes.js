const express = require('express');
const router = express.Router();
const interestedController = require('../controllers/interested.controller');
const authenticate = require('../middleware/authenticate');

// --- ŚCIEŻKI CHRONIONE (WYMAGAJĄ LOGOWANIA) ---

// GET /api/interested - Pobiera listę wydarzeń, którymi użytkownik jest zainteresowany
router.get('/', authenticate, interestedController.getInterestedEvents);

// POST /api/interested/:eventId - Dodaje wydarzenie do listy zainteresowań
router.post('/:eventId', authenticate, interestedController.addInterestedEvent);

// DELETE /api/interested/:eventId - Usuwa wydarzenie z listy zainteresowań
router.delete('/:eventId', authenticate, interestedController.removeInterestedEvent);

module.exports = router;