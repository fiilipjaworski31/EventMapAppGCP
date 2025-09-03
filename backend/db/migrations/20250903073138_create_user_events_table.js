/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('user_events', (table) => {
    // Ustawienie klucza głównego jako kombinacji user_id i event_id
    // gwarantuje, że jeden użytkownik może polubić jedno wydarzenie tylko raz.
    table.primary(['user_id', 'event_id']);

    // Klucz obcy wskazujący na użytkownika (z tabeli 'users')
    table.integer('user_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE'); // Jeśli użytkownik zostanie usunięty, jego "polubienia" też

    // Klucz obcy wskazujący na wydarzenie (z tabeli 'events')
    table.integer('event_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('events')
      .onDelete('CASCADE'); // Jeśli wydarzenie zostanie usunięte, "polubienia" też

    // Automatyczne kolumny created_at i updated_at
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('user_events');
};