import React, { useState, useEffect } from 'react';
import reviewService from '../services/review.service';
import { useAuth } from '../context/AuthContext';
import './ReviewForm.css';

const ReviewForm = ({ eventId, onReviewAdded, existingReview = null }) => {
  const { currentUser } = useAuth();
  
  const [rating, setRating] = useState(existingReview ? existingReview.rating : 0);
  const [comment, setComment] = useState(existingReview ? existingReview.comment || '' : '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState(existingReview ? 'edit' : 'add'); // 'add' lub 'edit'

  // Resetuj formularz gdy existingReview się zmieni
  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment || '');
      setMode('edit');
    } else {
      setRating(0);
      setComment('');
      setMode('add');
    }
  }, [existingReview]);

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
      const token = await currentUser.getIdToken();
      const reviewData = { rating, comment };

      let response;
      if (mode === 'edit' && existingReview) {
        // Aktualizuj istniejącą recenzję
        response = await reviewService.updateReview(eventId, existingReview.id, reviewData, token);
        onReviewAdded(response.data, 'updated');
      } else {
        // Dodaj nową recenzję lub spróbuj ponownie
        try {
          response = await reviewService.addReview(eventId, reviewData, token);
          onReviewAdded(response.data, 'added');
          
          // Resetuj formularz po pomyślnym dodaniu
          setRating(0);
          setComment('');
        } catch (err) {
          if (err.response && err.response.status === 409) {
            // Konflikt - użytkownik już ma recenzję dla tego wydarzenia
            setError('Już masz recenzję dla tego wydarzenia. Spróbuj odświeżyć stronę, aby ją edytować.');
            return;
          }
          throw err; // Re-throw other errors
        }
      }

    } catch (err) {
      setError('Nie udało się zapisać recenzji. Spróbuj ponownie.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (mode === 'edit') {
      // Anuluj edycję - przywróć pierwotne wartości
      setRating(existingReview.rating);
      setComment(existingReview.comment || '');
      onReviewAdded(null, 'cancelled');
    }
  };

  return (
    <div className="review-form">
      <h4>{mode === 'edit' ? 'Edytuj swoją recenzję' : 'Dodaj swoją recenzję'}</h4>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Ocena:</label>
          <div className="rating-buttons">
            {[1, 2, 3, 4, 5].map((star) => (
              <button 
                type="button" 
                key={star} 
                onClick={() => setRating(star)}
                className={star <= rating ? 'active' : ''}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="comment">Komentarz (opcjonalnie):</label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Podziel się swoimi wrażeniami..."
          />
        </div>

        {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" disabled={isSubmitting} className="submit-button">
            {isSubmitting 
              ? (mode === 'edit' ? 'Aktualizuję...' : 'Wysyłanie...') 
              : (mode === 'edit' ? 'Zaktualizuj recenzję' : 'Opublikuj recenzję')
            }
          </button>
          
          {mode === 'edit' && (
            <button 
              type="button" 
              onClick={handleCancel}
              disabled={isSubmitting}
              style={{ 
                backgroundColor: '#6c757d', 
                color: 'white', 
                border: 'none', 
                padding: '0.75rem 1.5rem',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Anuluj
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;