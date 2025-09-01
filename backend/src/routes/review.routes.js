const express = require('express');
// UWAGA: Potrzebna opcja mergeParams, aby mieć dostęp do :id z routera nadrzędnego (events)
const router = express.Router({ mergeParams: true }); 

const reviewsController = require('../controllers/review.controller');
const authenticate = require('../middleware/authenticate');

// GET /api/events/:id/reviews - pobierz wszystkie recenzje dla wydarzenia
router.get('/', reviewsController.getReviews);

// POST /api/events/:id/reviews - dodaj nową recenzję (tylko dla zalogowanych)
router.post('/', authenticate, reviewsController.createReview);

module.exports = router;