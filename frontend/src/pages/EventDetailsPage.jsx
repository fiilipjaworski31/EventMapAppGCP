import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

// Import komponentów i serwisów
import ReviewList from '../components/ReviewList';
import ReviewForm from '../components/ReviewForm';
import reviewService from '../services/review.service';
// import eventService from '../services/event.service'; // Warto mieć serwis także dla wydarzeń

// Import hooka do autoryzacji
import { useAuth } from '../context/AuthContext';

const EventDetailsPage = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();

  // Stany komponentu
  const [event, setEvent] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Efekt do pobierania danych z API po załadowaniu
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Przykładowe dane wydarzenia, w docelowej aplikacji pobierzesz je z API
        const eventPromise = Promise.resolve({ id, name: `Nazwa Wydarzenia ${id}`, description: "Szczegółowy opis wydarzenia pojawi się tutaj." });
        const reviewsPromise = reviewService.getReviewsForEvent(id);

        const [eventResponse, reviewsResponse] = await Promise.all([eventPromise, reviewsPromise]);

        setEvent(eventResponse);
        setReviews(reviewsResponse.data);
        setError('');
      } catch (err) {
        setError('Nie udało się załadować danych wydarzenia.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Callback do aktualizacji listy recenzji po dodaniu nowej
  const handleReviewAdded = (newReview) => {
    setReviews(prevReviews => [newReview, ...prevReviews]);
  };

  // Renderowanie
  if (loading) return <p>Ładowanie danych wydarzenia...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!event) return <p>Nie znaleziono wydarzenia.</p>;

  return (
    <div>
      <h2>{event.name}</h2>
      <p>{event.description}</p>

      <hr style={{ margin: '2rem 0' }} />

      {/* Komponent listy recenzji przekazuje dane ze stanu */}
      <ReviewList reviews={reviews} />

      {/* Renderowanie warunkowe formularza */}
      {currentUser ? (
        <ReviewForm eventId={id} onReviewAdded={handleReviewAdded} />
      ) : (
        <p style={{ marginTop: '20px', fontWeight: 'bold' }}>Zaloguj się, aby dodać recenzję.</p>
      )}
    </div>
  );
};

export default EventDetailsPage;