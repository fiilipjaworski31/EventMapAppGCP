/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Usuwa WSZYSTKICH istniejących użytkowników, aby uniknąć duplikatów
  await knex('users').del();

  // Wstawia nowego użytkownika
  await knex('users').insert([
    {
      id: 1, 
      firebase_uid: 'test-firebase-uid-12345', 
      email: 'test.user@example.com'
    }
  ]);
};