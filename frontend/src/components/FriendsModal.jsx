import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import friendsService from '../services/friends.service';
import './FriendsModal.css';

const FriendsModal = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [newFriendUsername, setNewFriendUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('friends'); // 'friends', 'requests', 'add'

  useEffect(() => {
    if (isOpen && currentUser) {
      fetchFriends();
      fetchPendingRequests();
    }
  }, [isOpen, currentUser]);

  const fetchFriends = async () => {
    try {
      const token = await currentUser.getIdToken();
      const response = await friendsService.getFriends(token);
      setFriends(response.data);
    } catch (error) {
      console.error('Błąd podczas pobierania znajomych:', error);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const token = await currentUser.getIdToken();
      const response = await friendsService.getPendingRequests(token);
      setPendingRequests(response.data);
    } catch (error) {
      console.error('Błąd podczas pobierania zaproszeń:', error);
    }
  };

  const handleSendFriendRequest = async (e) => {
    e.preventDefault();
    if (!newFriendUsername.trim()) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const token = await currentUser.getIdToken();
      await friendsService.sendFriendRequest(newFriendUsername.trim(), token);
      setSuccess('Zaproszenie zostało wysłane!');
      setNewFriendUsername('');
    } catch (error) {
      setError(error.response?.data?.message || 'Błąd podczas wysyłania zaproszenia');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requesterId) => {
    try {
      const token = await currentUser.getIdToken();
      await friendsService.acceptFriendRequest(requesterId, token);
      await fetchPendingRequests();
      await fetchFriends();
    } catch (error) {
      setError('Błąd podczas akceptowania zaproszenia');
    }
  };

  const handleDeclineRequest = async (requesterId) => {
    try {
      const token = await currentUser.getIdToken();
      await friendsService.declineFriendRequest(requesterId, token);
      await fetchPendingRequests();
    } catch (error) {
      setError('Błąd podczas odrzucania zaproszenia');
    }
  };

  const handleRemoveFriend = async (friendId) => {
    if (confirm('Czy na pewno chcesz usunąć tego znajomego?')) {
      try {
        const token = await currentUser.getIdToken();
        await friendsService.removeFriend(friendId, token);
        await fetchFriends();
      } catch (error) {
        setError('Błąd podczas usuwania znajomego');
      }
    }
  };

  const handleViewFriendEvents = (friend) => {
    onClose();
    // Otwórz modal z wydarzeniami znajomego
    const friendEventsModal = document.createElement('div');
    friendEventsModal.innerHTML = `<friend-events-modal friend-id="${friend.id}" friend-name="${friend.username}"></friend-events-modal>`;
    document.body.appendChild(friendEventsModal);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content friends-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Znajomi</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'friends' ? 'active' : ''}`}
            onClick={() => setActiveTab('friends')}
          >
            Znajomi ({friends.length})
          </button>
          <button 
            className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            Zaproszenia ({pendingRequests.length})
          </button>
          <button 
            className={`tab ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            Dodaj znajomego
          </button>
        </div>

        <div className="tab-content">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {activeTab === 'friends' && (
            <div className="friends-list">
              {friends.length === 0 ? (
                <p className="no-data">Nie masz jeszcze znajomych.</p>
              ) : (
                friends.map(friend => (
                  <div key={friend.id} className="friend-item">
                    <div className="friend-info">
                      <span className="friend-username">{friend.username}</span>
                      <span className="friend-email">{friend.email}</span>
                    </div>
                    <div className="friend-actions">
                      <button 
                        className="view-events-btn"
                        onClick={() => handleViewFriendEvents(friend)}
                      >
                        Zobacz wydarzenia
                      </button>
                      <button 
                        className="remove-friend-btn"
                        onClick={() => handleRemoveFriend(friend.id)}
                      >
                        Usuń
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="requests-list">
              {pendingRequests.length === 0 ? (
                <p className="no-data">Brak oczekujących zaproszeń.</p>
              ) : (
                pendingRequests.map(request => (
                  <div key={request.id} className="request-item">
                    <div className="request-info">
                      <span className="request-username">{request.username}</span>
                      <span className="request-email">{request.email}</span>
                    </div>
                    <div className="request-actions">
                      <button 
                        className="accept-btn"
                        onClick={() => handleAcceptRequest(request.requester_id)}
                      >
                        Akceptuj
                      </button>
                      <button 
                        className="decline-btn"
                        onClick={() => handleDeclineRequest(request.requester_id)}
                      >
                        Odrzuć
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'add' && (
            <div className="add-friend-form">
              <form onSubmit={handleSendFriendRequest}>
                <div className="form-group">
                  <label htmlFor="username">Nazwa użytkownika:</label>
                  <input
                    type="text"
                    id="username"
                    value={newFriendUsername}
                    onChange={(e) => setNewFriendUsername(e.target.value)}
                    placeholder="Wpisz nazwę użytkownika"
                    disabled={loading}
                  />
                </div>
                <button type="submit" disabled={loading || !newFriendUsername.trim()}>
                  {loading ? 'Wysyłanie...' : 'Wyślij zaproszenie'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendsModal;