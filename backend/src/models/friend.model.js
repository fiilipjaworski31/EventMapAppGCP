const knex = require('../config/database');

// Wyszukaj użytkownika po email lub username
const findUserByEmailOrUsername = (emailOrUsername) => {
  return knex('users')
    .where('email', emailOrUsername)
    .orWhere('username', emailOrUsername)
    .first();
};

// Wyślij zaproszenie do znajomości
const sendFriendRequest = (userId, friendId) => {
  return knex('friends').insert({
    user_id: userId,
    friend_id: friendId,
    status: 'pending'
  }).returning('*');
};

// Pobierz wszystkich znajomych użytkownika (zaakceptowani)
const getFriends = (userId) => {
  return knex('friends')
    .join('users', function() {
      this.on('friends.friend_id', '=', 'users.id')
        .orOn('friends.user_id', '=', 'users.id');
    })
    .where(function() {
      this.where('friends.user_id', userId)
        .orWhere('friends.friend_id', userId);
    })
    .where('friends.status', 'accepted')
    .whereNot('users.id', userId) // Wykluczamy siebie
    .select(
      'users.id',
      'users.username', 
      'users.email',
      'friends.created_at as friends_since'
    );
};

// Pobierz oczekujące zaproszenia (otrzymane przez użytkownika)
const getPendingRequests = (userId) => {
  return knex('friends')
    .join('users', 'friends.user_id', 'users.id')
    .where('friends.friend_id', userId)
    .where('friends.status', 'pending')
    .select(
      'friends.id as request_id',
      'users.id as user_id',
      'users.username',
      'users.email',
      'friends.created_at'
    );
};

// Pobierz wysłane zaproszenia
const getSentRequests = (userId) => {
  return knex('friends')
    .join('users', 'friends.friend_id', 'users.id')
    .where('friends.user_id', userId)
    .where('friends.status', 'pending')
    .select(
      'friends.id as request_id',
      'users.id as friend_id',
      'users.username',
      'users.email',
      'friends.created_at'
    );
};

// Zaakceptuj zaproszenie
const acceptFriendRequest = (requestId, userId) => {
  return knex('friends')
    .where('id', requestId)
    .where('friend_id', userId) // Upewnij się, że użytkownik może zaakceptować tylko swoje zaproszenia
    .update({ status: 'accepted' })
    .returning('*');
};

// Odrzuć zaproszenie
const rejectFriendRequest = (requestId, userId) => {
  return knex('friends')
    .where('id', requestId)
    .where('friend_id', userId)
    .update({ status: 'rejected' })
    .returning('*');
};

// Usuń znajomego lub anuluj zaproszenie
const removeFriend = (userId, friendId) => {
  return knex('friends')
    .where(function() {
      this.where({ user_id: userId, friend_id: friendId })
        .orWhere({ user_id: friendId, friend_id: userId });
    })
    .del();
};

// Pobierz polubione wydarzenia znajomego
const getFriendInterestedEvents = (userId, friendId) => {
  // Najpierw sprawdź czy są znajomymi
  return knex('friends')
    .where(function() {
      this.where({ user_id: userId, friend_id: friendId, status: 'accepted' })
        .orWhere({ user_id: friendId, friend_id: userId, status: 'accepted' });
    })
    .first()
    .then(friendship => {
      if (!friendship) {
        throw new Error('Not friends');
      }
      
      // Jeśli są znajomymi, pobierz polubione wydarzenia
      return knex('user_events')
        .join('events', 'user_events.event_id', 'events.id')
        .join('users', 'user_events.user_id', 'users.id')
        .where('user_events.user_id', friendId)
        .select(
          'events.*',
          'users.username as liked_by'
        );
    });
};

// Sprawdź status znajomości między dwoma użytkownikami
const getFriendshipStatus = (userId, friendId) => {
  return knex('friends')
    .where(function() {
      this.where({ user_id: userId, friend_id: friendId })
        .orWhere({ user_id: friendId, friend_id: userId });
    })
    .first();
};

module.exports = {
  findUserByEmailOrUsername,
  sendFriendRequest,
  getFriends,
  getPendingRequests,
  getSentRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getFriendInterestedEvents,
  getFriendshipStatus,
};