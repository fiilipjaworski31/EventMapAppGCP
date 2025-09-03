const Review = require('../models/review.model');

exports.createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const event_id = parseInt(req.params.id, 10);
    const user_id = req.user.uid;

    // --- ZMIANA: SPRAWDZANIE DUPLIKATÓW ---
    const existingReview = await Review.findByUserAndEvent(user_id, event_id);
    if (existingReview) {
      return res.status(409).json({ 
        error: 'You have already reviewed this event.',
        existingReview: existingReview
      });
    }
    // ------------------------------------

    if (!rating || !user_id) {
      return res.status(400).json({ error: 'Rating and user authentication are required.' });
    }

    const newReview = { rating, comment, event_id, user_id };
    const [addedReview] = await Review.addReview(newReview);
    res.status(201).json(addedReview);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review.' });
  }
};

exports.getReviews = async (req, res) => {
    try {
        const event_id = parseInt(req.params.id, 10);
        const reviews = await Review.getReviewsByEventId(event_id);
        res.status(200).json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Failed to fetch reviews.' });
    }
};

// --- ZAKTUALIZOWANE FUNKCJE Z WERYFIKACJĄ AUTORA ---

exports.updateReview = async (req, res) => {
    try {
        const reviewId = parseInt(req.params.reviewId, 10);
        const { rating, comment } = req.body;
        const user_id = req.user.uid;

        // Sprawdź czy recenzja istnieje
        const existingReview = await Review.findById(reviewId);
        if (!existingReview) {
            return res.status(404).json({ error: 'Review not found.' });
        }

        // Sprawdź czy użytkownik jest autorem recenzji
        if (existingReview.user_id !== user_id) {
            return res.status(403).json({ error: 'You can only edit your own reviews.' });
        }

        const [updatedReview] = await Review.update(reviewId, { rating, comment });
        res.status(200).json(updatedReview);
    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({ error: 'Failed to update review.' });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        const reviewId = parseInt(req.params.reviewId, 10);
        const user_id = req.user.uid;

        // Sprawdź czy recenzja istnieje
        const existingReview = await Review.findById(reviewId);
        if (!existingReview) {
            return res.status(404).json({ error: 'Review not found.' });
        }

        // Sprawdź czy użytkownik jest autorem recenzji
        if (existingReview.user_id !== user_id) {
            return res.status(403).json({ error: 'You can only delete your own reviews.' });
        }

        await Review.remove(reviewId);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ error: 'Failed to delete review.' });
    }
};