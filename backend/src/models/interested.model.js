const knex = require('../config/database');

const findEventsByUserId = (userId) => {
  return knex('user_events')
    .join('events', 'user_events.event_id', 'events.id')
    .where('user_events.user_id', userId)
    .select('events.*');
};

const add = (userId, eventId) => {
  return knex('user_events').insert({
    user_id: userId,
    event_id: eventId,
  });
};

const remove = (userId, eventId) => {
  return knex('user_events')
    .where({
      user_id: userId,
      event_id: eventId,
    })
    .del();
};

module.exports = {
  findEventsByUserId,
  add,
  remove,
};