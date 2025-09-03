import React from 'react';
import { useAuth } from '../context/AuthContext';

// Komponent pojedynczej recenzji z możliwością edycji
const ReviewItem = ({ review, onEditClick, currentUserId }) => {
  const isOwnReview = currentUserId && review.user_id === currentUserId;

  return (
    <div style={{ 
      border: '1px solid #ccc', 
      padding: '15px', 
      margin: '10px 0', 
      borderRadius: '5px',
      backgroundColor: isOwnReview ? '#f0f8ff' : '#fff'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div style={{ flex: 1 }}>
          <p><strong>Ocena: {review.rating}/5</strong></p>
          {review.comment && <p style={{ margin: '8px 0' }}>{review.comment}</p>}
          <small style={{ color: '#666' }}>
            Dodano: {new Date(review.created_at).toLocaleDateString()}
            {review.updated_at !== review.created_at && (
              <span> (edytowano: {new Date(review.updated_at).toLocaleDateString()})</span>
            )}
          </small>
        </div>
        
        {isOwnReview && onEditClick && (
          <button
            onClick={() => onEditClick(review)}
            style={{
              backgroundColor: '#007cba',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Edytuj
          </button>
        )}
      </div>
    </div>
  );
};

// Główny komponent listy recenzji
const ReviewList = ({ reviews, onEditClick }) => {
  const { currentUser } = useAuth();

  return (
    <div>
      <h3>Recenzje ({reviews.length})</h3>
      {reviews.length > 0 ? (
        reviews.map(review => (
          <ReviewItem 
            key={review.id} 
            review={review} 
            onEditClick={onEditClick}
            currentUserId={currentUser?.uid}
          />
        ))
      ) : (
        <p>Brak recenzji dla tego wydarzenia. Bądź pierwszy!</p>
      )}
    </div>
  );
};

export default ReviewList;