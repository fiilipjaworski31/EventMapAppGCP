const knex = require('../config/database');

// Pobiera wszystkie wydarzenia
const findAll = (filters = {}) => {
  console.log('Model received filters:', filters); // Debug log
  const query = knex('events').select('*');

  // Add a search filter (searches title and description)
  if (filters.search) {
    console.log('Applying search filter:', filters.search); // Debug log
    query.where(function() {
      this.where('title', 'ilike', `%${filters.search}%`)
        .orWhere('description', 'ilike', `%${filters.search}%`);
    });
  }

  // Add a date filter
  if (filters.date) {
    console.log('Applying date filter:', filters.date); // Debug log
    // This query finds events that start on the given date
    query.whereRaw('DATE(start_time) = ?', [filters.date]);
  }

  return query;
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