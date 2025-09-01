/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('reviews', (table) => {
    table.increments('id').primary(); // Klucz główny, auto-inkrementacja
    table.integer('rating').notNullable(); // Ocena (np. 1-5), nie może być pusta
    table.text('comment'); // Treść komentarza/recenzji, może być pusta
    
    // Klucz obcy wskazujący na użytkownika (przechowujemy UID z Firebase Auth)
    table.string('user_id').notNullable().index(); 
    
    // Klucz obcy wskazujący na wydarzenie
    table.integer('event_id')
      .unsigned()
      .references('id')
      .inTable('events') // ZAKŁADAM, ŻE TABELA Z WYDARZENIAMI NAZYWA SIĘ 'events'
      .onDelete('CASCADE') // Jeśli wydarzenie zostanie usunięte, recenzje też
      .notNullable();

    table.timestamps(true, true); // Automatycznie dodaje kolumny created_at i updated_at
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('reviews');
};