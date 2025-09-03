import './EventDetailsPage.css';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import eventService from '../services/event.service';
import reviewService from '../services/review.service';

import ReviewList from '../components/ReviewList';
import ReviewForm from '../components/ReviewForm';
import { useAuth } from '../context/AuthContext';

const EventDetailsPage = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();

  const [event, setEvent] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      setError('Nieprawidłowy identyfikator wydarzenia.');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const [eventResponse, reviewsResponse] = await Promise.all([
          eventService.getEventById(id),
          reviewService.getReviewsForEvent(id)
        ]);

        setEvent(eventResponse.data);
        setReviews(reviewsResponse.data || []);
      } catch (err) {
        console.error('Błąd podczas pobierania danych:', err);
        const errorMessage = err.response?.data?.message || 
                            err.message || 
                            'Nie udało się załadować danych wydarzenia.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleReviewAdded = (newReview) => {
    setReviews(prevReviews => [newReview, ...prevReviews]);
  };

  if (loading) {
    return (
      <div className="page-background">
        <div className="event-details-container">
          <div className="loading-spinner">
            <p>Ładowanie danych wydarzenia...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-background">
        <div className="event-details-container">
          <div className="error-message">
            <h2>Wystąpił błąd</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="page-background">
        <div className="event-details-container">
          <div className="not-found">
            <h2>Nie znaleziono wydarzenia</h2>
            <p>Wydarzenie o podanym identyfikatorze nie istnieje.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-background">
      <div className="event-details-container">
        <header className="event-header">
          <h1 className="event-title">{event.title}</h1>
          <div className="event-meta">
            <span className="event-date">{event.date}</span>
            <span className="event-separator">|</span>
            <span className="event-location">{event.location}</span>
          </div>
        </header>

        <main className="event-main">
          <section className="event-description-section">
            <h2 className="section-title">Opis wydarzenia</h2>
            <div className="event-description">
              {event.description ? (
                event.description.includes('<a href=') ? (
                  <div dangerouslySetInnerHTML={{ __html: event.description }} />
                ) : (
                  event.description
                )
              ) : (
                'Brak opisu dla tego wydarzenia.'
              )}
            </div>
          </section>

          <section className="reviews-section">
            <h2 className="section-title">
              Recenzje ({reviews.length})
            </h2>
            
            <div className="reviews-container">
              {reviews.length === 0 ? (
                <div className="no-reviews">
                  <p>Brak recenzji dla tego wydarzenia.</p>
                  <p>Bądź pierwszą osobą, która podzieli się opinią!</p>
                </div>
              ) : (
                <ReviewList reviews={reviews} />
              )}
            </div>
          </section>

          <section className="review-form-section">
            <h2 className="section-title">Dodaj recenzję</h2>
            {currentUser ? (
              <ReviewForm 
                eventId={id} 
                onReviewAdded={handleReviewAdded} 
              />
            ) : (
              <div className="login-prompt">
                <p>Zaloguj się, aby dodać recenzję.</p>
                <button 
                  className="login-button"
                  onClick={() => window.location.href = '/login'}
                >
                  Zaloguj się
                </button>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default EventDetailsPage;