/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  // Metoda 'up' opisuje, co ma się wydarzyć, gdy uruchamiamy migrację.
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary(); // Klucz główny, auto-inkrementujący ID (1, 2, 3...)
    table.string('firebase_uid').notNullable().unique(); // ID użytkownika z Firebase Authentication
    table.string('email').notNullable().unique(); // Adres email użytkownika
    table.timestamps(true, true); // Automatycznie dodaje kolumny created_at i updated_at
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  // Metoda 'down' opisuje, jak cofnąć zmiany z metody 'up'.
  return knex.schema.dropTable('users');
};