// backend/db/migrations/[timestamp]_create_friends_table.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('friends', (table) => {
    table.increments('id').primary();
    
    // Użytkownik który wysyła zaproszenie
    table.integer('user_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    
    // Użytkownik który otrzymuje zaproszenie
    table.integer('friend_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    
    // Status: 'pending', 'accepted', 'rejected'
    table.enum('status', ['pending', 'accepted', 'rejected']).defaultTo('pending');
    
    table.timestamps(true, true);
    
    // Zapobieganie duplikatom - jeden użytkownik może wysłać zaproszenie do drugiego tylko raz
    table.unique(['user_id', 'friend_id']);
    
    // Dodatkowy indeks dla szybszego wyszukiwania
    table.index(['friend_id', 'status']);
    table.index(['user_id', 'status']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('friends');
};