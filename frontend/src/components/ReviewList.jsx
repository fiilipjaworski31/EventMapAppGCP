import React from 'react';

// Prosty komponent do wyświetlenia pojedynczej recenzji
const ReviewItem = ({ review }) => (
  <div style={{ border: '1px solid #ccc', padding: '10px', margin: '5px 0', borderRadius: '5px' }}>
    <p><strong>Ocena: {review.rating}/5</strong></p>
    <p>{review.comment}</p>
    <small>Dodano: {new Date(review.created_at).toLocaleDateString()}</small>
  </div>
);

// Zaktualizowany ReviewList - teraz tylko przyjmuje 'reviews' jako prop
const ReviewList = ({ reviews }) => {
  return (
    <div>
      <h3>Recenzje ({reviews.length})</h3>
      {reviews.length > 0 ? (
        reviews.map(review => <ReviewItem key={review.id} review={review} />)
      ) : (
        <p>Brak recenzji dla tego wydarzenia. Bądź pierwszy!</p>
      )}
    </div>
  );
};

export default ReviewList;