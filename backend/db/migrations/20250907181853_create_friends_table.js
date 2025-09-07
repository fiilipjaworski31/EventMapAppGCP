/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('friends', (table) => {
    table.increments('id').primary(); // Klucz główny
    
    // Użytkownik który wysyła zaproszenie do znajomości
    table.integer('requester_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    
    // Użytkownik który otrzymuje zaproszenie do znajomości
    table.integer('addressee_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    
    // Status znajomości: 'pending', 'accepted', 'declined'
    table.enu('status', ['pending', 'accepted', 'declined']).defaultTo('pending');
    
    // Zapobiega duplikatom - jeden użytkownik może wysłać zaproszenie do drugiego tylko raz
    table.unique(['requester_id', 'addressee_id']);
    
    table.timestamps(true, true); // created_at i updated_at
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('friends');
};