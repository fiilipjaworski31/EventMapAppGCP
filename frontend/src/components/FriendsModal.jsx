import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import friendService from '../services/friend.service';
import { useNavigate } from 'react-router-dom';
import './FriendsModal.css';

const FriendsModal = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Stany główne
  const [activeTab, setActiveTab] = useState('friends'); // 'friends', 'requests', 'add'
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  
  // Stany dla wyszukiwania
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Stany dla polubionych wydarzeń znajomego
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [friendEvents, setFriendEvents] = useState([]);
  const [showFriendEvents, setShowFriendEvents] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && currentUser) {
      loadData();
    }
  }, [isOpen, currentUser]);

  const loadData = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const token = await currentUser.getIdToken();
      const [friendsRes, pendingRes, sentRes] = await Promise.all([
        friendService.getFriends(token),
        friendService.getPendingRequests(token),
        friendService.getSentRequests(token),
      ]);
      
      setFriends(friendsRes.data);
      setPendingRequests(pendingRes.data);
      setSentRequests(sentRes.data);
    } catch (err) {
      console.error('Error loading friends data:', err);
      setError('Błąd podczas ładowania danych znajomych.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    setSearchError('');
    setSearchResult(null);
    
    try {
      const token = await currentUser.getIdToken();
      const response = await friendService.searchUser(searchTerm.trim(), token);
      setSearchResult(response.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setSearchError('Użytkownik nie został znaleziony.');
      } else {
        setSearchError('Błąd podczas wyszukiwania użytkownika.');
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendRequest = async (friendId) => {
    try {
      const token = await currentUser.getIdToken();
      await friendService.sendFriendRequest(friendId, token);
      setSearchResult(null);
      setSearchTerm('');
      alert('Zaproszenie zostało wysłane!');
      loadData(); // Odśwież dane
    } catch (err) {
      alert(err.response?.data?.error || 'Błąd podczas wysyłania zaproszenia.');
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const token = await currentUser.getIdToken();
      await friendService.acceptFriendRequest(requestId, token);
      loadData(); // Odśwież dane
    } catch (err) {
      alert('Błąd podczas akceptowania zaproszenia.');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const token = await currentUser.getIdToken();
      await friendService.rejectFriendRequest(requestId, token);
      loadData(); // Odśwież dane
    } catch (err) {
      alert('Błąd podczas odrzucania zaproszenia.');
    }
  };

  const handleRemoveFriend = async (friendId) => {
    if (!confirm('Czy na pewno chcesz usunąć tego znajomego?')) return;
    
    try {
      const token = await currentUser.getIdToken();
      await friendService.removeFriend(friendId, token);
      loadData(); // Odśwież dane
    } catch (err) {
      alert('Błąd podczas usuwania znajomego.');
    }
  };

  const handleViewFriendEvents = async (friend) => {
    try {
      const token = await currentUser.getIdToken();
      const response = await friendService.getFriendInterestedEvents(friend.id, token);
      setSelectedFriend(friend);
      setFriendEvents(response.data);
      setShowFriendEvents(true);
    } catch (err) {
      alert('Błąd podczas pobierania polubionych wydarzeń znajomego.');
    }
  };

  const handleEventClick = (eventId) => {
    navigate(`/event/${eventId}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="friends-modal-overlay" onClick={onClose}>
      <div className="friends-modal" onClick={(e) => e.stopPropagation()}>
        <div className="friends-modal-header">
          <h2>Znajomi</h2>
          <button className="friends-modal-close" onClick={onClose}>×</button>
        </div>

        {/* Tabs Navigation */}
        <div className="friends-tabs">
          <button 
            className={activeTab === 'friends' ? 'active' : ''} 
            onClick={() => setActiveTab('friends')}
          >
            Znajomi ({friends.length})
          </button>
          <button 
            className={activeTab === 'requests' ? 'active' : ''} 
            onClick={() => setActiveTab('requests')}
          >
            Zaproszenia ({pendingRequests.length})
          </button>
          <button 
            className={activeTab === 'add' ? 'active' : ''} 
            onClick={() => setActiveTab('add')}
          >
            Dodaj znajomego
          </button>
        </div>

        <div className="friends-modal-content">
          {loading && <div className="loading">Ładowanie...</div>}
          {error && <div className="error-message">{error}</div>}

          {/* Tab: Lista znajomych */}
          {activeTab === 'friends' && (
            <div className="friends-list">
              {friends.length > 0 ? (
                friends.map(friend => (
                  <div key={friend.id} className="friend-item">
                    <div className="friend-info">
                      <strong>{friend.username}</strong>
                      <small>{friend.email}</small>
                      <span className="friends-since">
                        Znajomi od: {new Date(friend.friends_since).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="friend-actions">
                      <button 
                        className="btn-view-events"
                        onClick={() => handleViewFriendEvents(friend)}
                      >
                        Zobacz polubione
                      </button>
                      <button 
                        className="btn-remove"
                        onClick={() => handleRemoveFriend(friend.id)}
                      >
                        Usuń
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-friends">
                  <p>Nie masz jeszcze znajomych.</p>
                  <p>Dodaj kogoś używając zakładki "Dodaj znajomego"!</p>
                </div>
              )}
            </div>
          )}

          {/* Tab: Zaproszenia */}
          {activeTab === 'requests' && (
            <div className="requests-section">
              {/* Otrzymane zaproszenia */}
              <div className="requests-received">
                <h3>Otrzymane zaproszenia</h3>
                {pendingRequests.length > 0 ? (
                  pendingRequests.map(request => (
                    <div key={request.request_id} className="request-item">
                      <div className="request-info">
                        <strong>{request.username}</strong>
                        <small>{request.email}</small>
                        <span className="request-date">
                          {new Date(request.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="request-actions">
                        <button 
                          className="btn-accept"
                          onClick={() => handleAcceptRequest(request.request_id)}
                        >
                          Akceptuj
                        </button>
                        <button 
                          className="btn-reject"
                          onClick={() => handleRejectRequest(request.request_id)}
                        >
                          Odrzuć
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>Brak oczekujących zaproszeń.</p>
                )}
              </div>

              {/* Wysłane zaproszenia */}
              <div className="requests-sent">
                <h3>Wysłane zaproszenia</h3>
                {sentRequests.length > 0 ? (
                  sentRequests.map(request => (
                    <div key={request.request_id} className="request-item sent">
                      <div className="request-info">
                        <strong>{request.username}</strong>
                        <small>{request.email}</small>
                        <span className="request-date">
                          {new Date(request.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="request-status">
                        Oczekuje...
                      </div>
                    </div>
                  ))
                ) : (
                  <p>Nie wysłałeś żadnych zaproszeń.</p>
                )}
              </div>
            </div>
          )}

          {/* Tab: Dodaj znajomego */}
          {activeTab === 'add' && (
            <div className="add-friend-section">
              <form onSubmit={handleSearch} className="search-form">
                <div className="form-group">
                  <label htmlFor="search">Wyszukaj po email lub nazwie użytkownika:</label>
                  <input
                    type="text"
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="np. jan.kowalski@email.com lub jankowalski"
                    required
                  />
                </div>
                <button type="submit" disabled={isSearching}>
                  {isSearching ? 'Wyszukiwanie...' : 'Wyszukaj'}
                </button>
              </form>

              {searchError && <div className="error-message">{searchError}</div>}

              {searchResult && (
                <div className="search-result">
                  <h4>Znaleziony użytkownik:</h4>
                  <div className="user-result">
                    <div className="user-info">
                      <strong>{searchResult.username}</strong>
                      <small>{searchResult.email}</small>
                    </div>
                    <button 
                      className="btn-send-request"
                      onClick={() => handleSendRequest(searchResult.id)}
                    >
                      Wyślij zaproszenie
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal for friend's events */}
        {showFriendEvents && (
          <div className="friend-events-modal">
            <div className="friend-events-header">
              <h3>Polubione wydarzenia - {selectedFriend?.username}</h3>
              <button 
                className="close-events"
                onClick={() => setShowFriendEvents(false)}
              >
                ×
              </button>
            </div>
            <div className="friend-events-list">
              {friendEvents.length > 0 ? (
                friendEvents.map(event => (
                  <div 
                    key={event.id} 
                    className="friend-event-item"
                    onClick={() => handleEventClick(event.id)}
                  >
                    <div className="event-info">
                      <h4>{event.title}</h4>
                      {event.venue_name && <p>{event.venue_name}</p>}
                      {event.start_time && (
                        <small>
                          {new Date(event.start_time).toLocaleString('pl-PL')}
                        </small>
                      )}
                    </div>
                    {event.image_url && (
                      <img 
                        src={event.image_url} 
                        alt={event.title}
                        className="event-thumb"
                      />
                    )}
                  </div>
                ))
              ) : (
                <p>Ten znajomy nie polubił jeszcze żadnych wydarzeń.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsModal;