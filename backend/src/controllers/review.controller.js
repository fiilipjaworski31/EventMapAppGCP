const Review = require('../models/review.model');

exports.createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const event_id = parseInt(req.params.id, 10);
    const user_id = req.user.uid;

    // --- ZMIANA: SPRAWDZANIE DUPLIKATÓW ---
    const existingReview = await Review.findByUserAndEvent(user_id, event_id);
    if (existingReview) {
      return res.status(409).json({ error: 'You have already reviewed this event.' }); // 409 Conflict
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

// --- NOWE FUNKCJE ---

exports.updateReview = async (req, res) => {
    try {
        const reviewId = parseInt(req.params.reviewId, 10);
        const { rating, comment } = req.body;

        // Tutaj można dodać logikę weryfikacji, czy użytkownik jest autorem recenzji
        // (porównując req.user.uid z user_id w recenzji o danym ID)

        const [updatedReview] = await Review.update(reviewId, { rating, comment });
        res.status(200).json(updatedReview);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update review.' });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        const reviewId = parseInt(req.params.reviewId, 10);

        // Tutaj również warto dodać weryfikację autora

        await Review.remove(reviewId);
        res.status(204).send(); // 204 No Content
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete review.' });
    }
};