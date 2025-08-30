/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('events', (table) => {
    table.increments('id').primary(); // Klucz główny
    table.string('title').notNullable(); // Tytuł wydarzenia
    table.text('description'); // Dłuższy opis
    table.timestamp('start_time', { useTz: true }).notNullable(); // Czas rozpoczęcia
    table.timestamp('end_time', { useTz: true }); // Czas zakończenia (opcjonalny)
    table.decimal('latitude', 9, 6).notNullable(); // Szerokość geograficzna
    table.decimal('longitude', 9, 6).notNullable(); // Długość geograficzna
    table.string('address'); // Adres tekstowy

    // Klucz obcy - powiązanie z tabelą 'users'
    table.integer('creator_id').unsigned().references('id').inTable('users').onDelete('CASCADE');

    table.timestamps(true, true); // Kolumny created_at i updated_at
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('events');
};