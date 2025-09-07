const knex = require('../config/database');

// Znajduje wszystkich znajomych użytkownika (zaakceptowane znajomości)
const findFriendsByUserId = async (userId) => {
  return knex('friends')
    .join('users as u', function() {
      this.on('u.id', '=', 'friends.requester_id')
          .orOn('u.id', '=', 'friends.addressee_id');
    })
    .where('friends.status', 'accepted')
    .where(function() {
      this.where('friends.requester_id', userId)
          .orWhere('friends.addressee_id', userId);
    })
    .where('u.id', '!=', userId) // Wykluczamy samego siebie
    .select('u.id', 'u.username', 'u.email')
    .distinct();
};

// Wysyła zaproszenie do znajomości
const sendFriendRequest = async (requesterId, addresseeId) => {
  return knex('friends').insert({
    requester_id: requesterId,
    addressee_id: addresseeId,
    status: 'pending'
  });
};

// Akceptuje zaproszenie do znajomości
const acceptFriendRequest = async (requesterId, addresseeId) => {
  return knex('friends')
    .where({
      requester_id: requesterId,
      addressee_id: addresseeId,
      status: 'pending'
    })
    .update({ status: 'accepted' });
};

// Odrzuca zaproszenie do znajomości
const declineFriendRequest = async (requesterId, addresseeId) => {
  return knex('friends')
    .where({
      requester_id: requesterId,
      addressee_id: addresseeId,
      status: 'pending'
    })
    .update({ status: 'declined' });
};

// Usuwa znajomość
const removeFriend = async (userId1, userId2) => {
  return knex('friends')
    .where(function() {
      this.where({
        requester_id: userId1,
        addressee_id: userId2
      }).orWhere({
        requester_id: userId2,
        addressee_id: userId1
      });
    })
    .del();
};

// Znajduje oczekujące zaproszenia wysłane do użytkownika
const getPendingRequests = async (userId) => {
  return knex('friends')
    .join('users', 'friends.requester_id', 'users.id')
    .where('friends.addressee_id', userId)
    .where('friends.status', 'pending')
    .select('friends.*', 'users.username', 'users.email');
};

// Sprawdza czy między użytkownikami istnieje już znajomość
const checkFriendshipStatus = async (userId1, userId2) => {
  return knex('friends')
    .where(function() {
      this.where({
        requester_id: userId1,
        addressee_id: userId2
      }).orWhere({
        requester_id: userId2,
        addressee_id: userId1
      });
    })
    .first();
};

// Znajduje użytkownika po username
const findUserByUsername = async (username) => {
  return knex('users')
    .where('username', username)
    .first();
};

module.exports = {
  findFriendsByUserId,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
  getPendingRequests,
  checkFriendshipStatus,
  findUserByUsername
};