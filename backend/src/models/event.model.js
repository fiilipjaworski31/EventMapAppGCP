const knex = require('../config/database'); //

// Pobiera wszystkie wydarzenia
const findAll = () => {
  // ... reszta funkcji bez zmian
  return knex('events').select('*');
};

// Znajduje jedno wydarzenie po jego ID
const findById = (id) => {
  // ... reszta funkcji bez zmian
  return knex('events').where({ id }).first();
};

// Tworzy nowe wydarzenie
const create = (eventData) => {
  return knex('events').insert(eventData).returning('*');
};

// Aktualizuje istniejące wydarzenie
const update = (id, eventData) => {
  return knex('events').where({ id }).update(eventData).returning('*');
};

// Usuwa wydarzenie
const remove = (id) => {
  return knex('events').where({ id }).del();
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
};