const express = require('express');
const router = express.Router();
const interestedController = require('../controllers/interested.controller');
const authenticate = require('../middleware/authenticate');
const ensureAppUser = require('../middleware/ensureAppUser');

// --- ŚCIEŻKI CHRONIONE (WYMAGAJĄ LOGOWANIA) ---

// GET /api/interested - Pobiera listę wydarzeń, którymi użytkownik jest zainteresowany
router.get('/', authenticate, ensureAppUser, interestedController.getInterestedEvents);

// POST /api/interested/:eventId - Dodaje wydarzenie do listy zainteresowań
router.post('/:eventId', authenticate, ensureAppUser, interestedController.addInterestedEvent);

// DELETE /api/interested/:eventId - Usuwa wydarzenie z listy zainteresowań
router.delete('/:eventId', authenticate, ensureAppUser, interestedController.removeInterestedEvent);

module.exports = router;