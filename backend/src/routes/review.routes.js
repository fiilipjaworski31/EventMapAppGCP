const express = require('express');
const router = express.Router({ mergeParams: true });
const reviewsController = require('../controllers/review.controller');
const authenticate = require('../middleware/authenticate.js');

// --- ŚCIEŻKI PUBLICZNE (NIE WYMAGAJĄ LOGOWANIA) ---

// GET /api/events/:id/reviews - Pobiera listę recenzji. Musi być publiczne.
router.get('/', reviewsController.getReviews);


// --- ŚCIEŻKI CHRONIONE (WYMAGAJĄ LOGOWANIA) ---

// POST /api/events/:id/reviews - Dodaje nową recenzję.
router.post('/', authenticate, reviewsController.createReview);

// PUT /api/events/:id/reviews/:reviewId - Aktualizuje recenzję.
router.put('/:reviewId', authenticate, reviewsController.updateReview);

// DELETE /api/events/:id/reviews/:reviewId - Usuwa recenzję.
router.delete('/:reviewId', authenticate, reviewsController.deleteReview);


module.exports = router;