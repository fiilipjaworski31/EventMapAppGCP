const knex = require('../config/database');

// NOWA FUNKCJA: Znajduje recenzję po ID użytkownika i ID wydarzenia
const findByUserAndEvent = (userId, eventId) => {
  return knex('reviews')
    .where({ user_id: userId, event_id: eventId })
    .first();
};

// NOWA FUNKCJA: Znajduje recenzję po ID
const findById = (reviewId) => {
  return knex('reviews')
    .where({ id: reviewId })
    .first();
};

const addReview = (review) => {
  return knex('reviews').insert(review).returning('*');
};

const getReviewsByEventId = (eventId) => {
  return knex('reviews').where({ event_id: eventId }).orderBy('created_at', 'desc');
};

// FUNKCJA: Aktualizuje istniejącą recenzję
const update = (reviewId, reviewData) => {
    return knex('reviews').where({ id: reviewId }).update(reviewData).returning('*');
};

// FUNKCJA: Usuwa recenzję
const remove = (reviewId) => {
    return knex('reviews').where({ id: reviewId }).del();
};

module.exports = {
  findByUserAndEvent,
  findById, // <--- nowy eksport
  addReview,
  getReviewsByEventId,
  update,
  remove,
};