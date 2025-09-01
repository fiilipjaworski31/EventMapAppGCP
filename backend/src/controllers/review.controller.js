const Review = require('../models/review.model'); 

// Kontroler do tworzenia recenzji
exports.createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const event_id = parseInt(req.params.id, 10);

    const user_id = req.user.uid; 

    if (!rating || !user_id) {
      return res.status(400).json({ error: 'Rating and user authentication are required.' });
    }

    const newReview = {
      rating,
      comment,
      event_id,
      user_id,
    };

    const [addedReview] = await Review.addReview(newReview);
    res.status(201).json(addedReview);

  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review.' });
  }
};

// Kontroler do pobierania recenzji
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