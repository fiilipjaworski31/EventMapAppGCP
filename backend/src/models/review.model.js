const knex = require('../config/database');

// NOWA FUNKCJA: Znajduje recenzję po ID użytkownika i ID wydarzenia
const findByUserAndEvent = (userId, eventId) => {
  return knex('reviews')
    .where({ user_id: userId, event_id: eventId })
    .first();
};

const addReview = (review) => {
  return knex('reviews').insert(review).returning('*');
};

const getReviewsByEventId = (eventId) => {
  return knex('reviews').where({ event_id: eventId }).orderBy('created_at', 'desc');
};

// NOWA FUNKCJA: Aktualizuje istniejącą recenzję
const update = (reviewId, reviewData) => {
    return knex('reviews').where({ id: reviewId }).update(reviewData).returning('*');
};

// NOWA FUNKCJA: Usuwa recenzję
const remove = (reviewId) => {
    return knex('reviews').where({ id: reviewId }).del();
};

module.exports = {
  findByUserAndEvent, // <--- eksport
  addReview,
  getReviewsByEventId,
  update, // <--- eksport
  remove, // <--- eksport
};