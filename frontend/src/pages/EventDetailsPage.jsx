import './EventDetailsPage.css';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import eventService from '../services/event.service';
import reviewService from '../services/review.service';
import interestedService from '../services/interested.service';

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
  const [editingReview, setEditingReview] = useState(null);
  const [userReview, setUserReview] = useState(null);
  const [isInterested, setIsInterested] = useState(false);

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

        if (currentUser && reviewsResponse.data) {
          const existingUserReview = reviewsResponse.data.find(
            review => review.user_id === currentUser.uid
          );
          setUserReview(existingUserReview || null);
        }
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
    const checkIfInterested = async () => {
        if (currentUser) {
            try {
                const token = await currentUser.getIdToken();
                const response = await interestedService.getInterested(token);
                const isEventInList = response.data.some(e => e.id === parseInt(id, 10));
                setIsInterested(isEventInList);
            } catch (error) {
                console.error("Błąd sprawdzania zainteresowań:", error);
            }
        }
    }
    checkIfInterested();

    fetchData();
  }, [id, currentUser]);

  const handleReviewAction = (reviewData, action) => {
    if (action === 'added') {
      setReviews(prevReviews => [reviewData, ...prevReviews]);
      setUserReview(reviewData);
    } else if (action === 'updated') {
      setReviews(prevReviews => 
        prevReviews.map(review => 
          review.id === reviewData.id ? reviewData : review
        )
      );
      setUserReview(reviewData);
      setEditingReview(null);
    } else if (action === 'cancelled') {
      setEditingReview(null);
    }
  };

  const handleEditClick = (review) => {
    setEditingReview(review);
  };

  const shouldShowForm = currentUser && (!userReview || editingReview);

  // Helper function to format date and time
  const formatDateTime = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleString('pl-PL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleInterestToggle = async () => {
    if (!currentUser) return;
    try {
        const token = await currentUser.getIdToken();
        if (isInterested) {
            await interestedService.removeInterested(id, token);
        } else {
            await interestedService.addInterested(id, token);
        }
        setIsInterested(!isInterested);
    } catch (error) {
        console.error("Błąd zmiany zainteresowania:", error);
    }
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
        {/* Event Image Section */}
        {event.image_url && (
          <div className="event-image-section">
            <img 
              src={event.image_url} 
              alt={event.title}
              className="event-main-image"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}

        <header className="event-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <h1 className="event-title">{event.title}</h1>
                {currentUser && (
                    <button onClick={handleInterestToggle} className={`interest-button ${isInterested ? 'active' : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={isInterested ? 'red' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                    </button>
                )}
            </div>
          
          {/* Event Meta Information */}
          <div className="event-meta-grid">
            {event.start_time && (
              <div className="meta-item">
                <span className="meta-icon">🗓️</span>
                <div className="meta-content">
                  <strong>Data rozpoczęcia:</strong>
                  <span>{formatDateTime(event.start_time)}</span>
                </div>
              </div>
            )}
            
            {event.end_time && (
              <div className="meta-item">
                <span className="meta-icon">🏁</span>
                <div className="meta-content">
                  <strong>Data zakończenia:</strong>
                  <span>{formatDateTime(event.end_time)}</span>
                </div>
              </div>
            )}
            
            {event.venue_name && (
              <div className="meta-item">
                <span className="meta-icon">🏢</span>
                <div className="meta-content">
                  <strong>Miejsce:</strong>
                  <span>{event.venue_name}</span>
                </div>
              </div>
            )}
            
            {event.address && (
              <div className="meta-item">
                <span className="meta-icon">📍</span>
                <div className="meta-content">
                  <strong>Adres:</strong>
                  <span>{event.address}</span>
                </div>
              </div>
            )}
            
            {event.url && (
              <div className="meta-item">
                <span className="meta-icon">🎫</span>
                <div className="meta-content">
                  <strong>Bilety/Więcej info:</strong>
                  <a 
                    href={event.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="event-link"
                  >
                    Zobacz oficjalną stronę
                  </a>
                </div>
              </div>
            )}
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
                  <p>{event.description}</p>
                )
              ) : (
                <p className="no-description">Brak opisu dla tego wydarzenia.</p>
              )}
            </div>
          </section>

          {/* Additional Event Information */}
          <section className="event-info-section">
            <h2 className="section-title">Informacje dodatkowe</h2>
            <div className="info-grid">
              {event.created_at && (
                <div className="info-item">
                  <strong>Dodano do systemu:</strong>
                  <span>{new Date(event.created_at).toLocaleDateString('pl-PL')}</span>
                </div>
              )}
              
              {event.external_id && (
                <div className="info-item">
                  <strong>ID zewnętrzne:</strong>
                  <span>{event.external_id}</span>
                </div>
              )}
              
              {event.latitude && event.longitude && (
                <div className="info-item">
                  <strong>Współrzędne:</strong>
                  <span>{parseFloat(event.latitude).toFixed(6)}, {parseFloat(event.longitude).toFixed(6)}</span>
                </div>
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
                <ReviewList 
                  reviews={reviews} 
                  onEditClick={handleEditClick}
                />
              )}
            </div>
          </section>

          <section className="review-form-section">
            <h2 className="section-title">
              {userReview && !editingReview ? 'Twoja recenzja' : 'Dodaj recenzję'}
            </h2>
            
            {shouldShowForm ? (
              <ReviewForm 
                eventId={id} 
                onReviewAdded={handleReviewAction}
                existingReview={editingReview}
              />
            ) : currentUser && userReview ? (
              <div className="user-has-review">
                <p>
                  Już dodałeś recenzję do tego wydarzenia. Możesz ją edytować klikając przycisk "Edytuj" przy swojej recenzji powyżej.
                </p>
              </div>
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