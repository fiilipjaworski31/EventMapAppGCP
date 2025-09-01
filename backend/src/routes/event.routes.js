const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');
const authenticate = require('../middleware/authenticate');
const reviewsRouter = require('./review.routes'); // Import routera recenzji

// --- Ścieżki dla Wydarzeń ---
router.get('/', eventController.getAllEvents);
router.post('/', authenticate, eventController.createEvent);
router.get('/:id', eventController.getEventById);
router.put('/:id', authenticate, eventController.updateEvent);
router.delete('/:id', authenticate, eventController.deleteEvent);

// --- Przekierowanie do Recenzji ---
// Przekieruj zapytania /api/events/:id/reviews do routera recenzji
router.use('/:id/reviews', reviewsRouter);

module.exports = router;