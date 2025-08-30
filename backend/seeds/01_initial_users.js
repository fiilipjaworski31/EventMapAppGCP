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
      firebase_uid: 'XuHUuUmcDpOtIBO0ueKT42QDFt72', 
      email: 'test@user.com'
    }
  ]);
};