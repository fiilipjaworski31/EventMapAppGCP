const knex = require('./db-config'); 

// Funkcja do dodawania nowej recenzji
const addReview = (review) => {
  return knex('reviews').insert(review).returning('*');
};

// Funkcja do pobierania recenzji dla danego wydarzenia
const getReviewsByEventId = (eventId) => {
  return knex('reviews').where({ event_id: eventId }).orderBy('created_at', 'desc');
};

module.exports = {
  addReview,
  getReviewsByEventId,
};