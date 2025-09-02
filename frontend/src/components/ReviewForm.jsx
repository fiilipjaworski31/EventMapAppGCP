import React, { useState } from 'react';
import reviewService from '../services/review.service';
import { useAuth } from '../context/AuthContext';
import './ReviewForm.css';

const ReviewForm = ({ eventId, onReviewAdded }) => {
  const { currentUser } = useAuth();
  
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Musisz wybrać ocenę w skali od 1 do 5.');
      return;
    }
    if (!currentUser) {
        setError('Musisz być zalogowany, aby dodać recenzję.');
        return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Dynamiczne i bezpieczne pobranie tokenu JWT aktualnego użytkownika
      const token = await currentUser.getIdToken();

      const reviewData = { rating, comment };
      const response = await reviewService.addReview(eventId, reviewData, token);
      
      onReviewAdded(response.data);

      setRating(0);
      setComment('');
    } catch (err) {
      setError('Nie udało się dodać recenzji. Spróbuj ponownie.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '20px', padding: '15px', border: '1px solid #eee', borderRadius: '8px' }}>
      <h4>Dodaj swoją recenzję</h4>
      
      <div>
        <label>Ocena:</label>
        <div style={{ margin: '5px 0' }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button 
              type="button" 
              key={star} 
              onClick={() => setRating(star)}
              style={{ 
                backgroundColor: star <= rating ? 'gold' : 'lightgray', 
                marginRight: '5px', 
                border: 'none', 
                cursor: 'pointer',
                fontSize: '1.5rem',
                padding: '0 5px'
              }}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '10px' }}>
        <label htmlFor="comment">Komentarz (opcjonalnie):</label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          style={{ width: '100%', minHeight: '80px', marginTop: '5px', boxSizing: 'border-box' }}
          placeholder="Podziel się swoimi wrażeniami..."
        />
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit" disabled={isSubmitting} style={{ marginTop: '10px' }}>
        {isSubmitting ? 'Wysyłanie...' : 'Opublikuj recenzję'}
      </button>
    </form>
  );
};

export default ReviewForm;