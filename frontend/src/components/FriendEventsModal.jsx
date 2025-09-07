// frontend/src/components/FriendEventsModal.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import friendsService from '../services/friends.service';
import './FriendEventsModal.css';

const FriendEventsModal = ({ isOpen, onClose, friend }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && currentUser && friend) {
      fetchFriendEvents();
    }
  }, [isOpen, currentUser, friend]);

  const fetchFriendEvents = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = await currentUser.getIdToken();
      const response = await friendsService.getFriendInterestedEvents(friend.id, token);
      setEvents(response.data);
    } catch (error) {
      setError('Błąd podczas pobierania wydarzeń znajomego');
      console.error('Błąd podczas pobierania wydarzeń znajomego:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (eventId) => {
    onClose();
    navigate(`/event/${eventId}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content friend-events-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Wydarzenia użytkownika {friend?.username}</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          {loading && <div className="loading">Ładowanie wydarzeń...</div>}
          {error && <div className="error-message">{error}</div>}
          
          {!loading && !error && (
            <div className="events-list">
              {events.length === 0 ? (
                <p className="no-data">Ten użytkownik nie polubił jeszcze żadnych wydarzeń.</p>
              ) : (
                events.map(event => (
                  <div 
                    key={event.id} 
                    className="event-item" 
                    onClick={() => handleEventClick(event.id)}
                  >
                    <div className="event-image">
                      {event.image_url ? (
                        <img 
                          src={event.image_url} 
                          alt={event.title}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="placeholder-image">
                          <span>📅</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="event-details">
                      <h3 className="event-title">{event.title}</h3>
                      <p className="event-date">{formatDate(event.start_time)}</p>
                      {event.venue_name && (
                        <p className="event-venue">{event.venue_name}</p>
                      )}
                      {event.address && (
                        <p className="event-address">{event.address}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendEventsModal;