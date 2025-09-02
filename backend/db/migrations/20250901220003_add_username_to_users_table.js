exports.up = function(knex) {
  return knex.schema.table('users', function(table) {
    // Dodaje kolumnę na nazwę użytkownika.
    // .unique() sprawi, że każdy nick musi być unikalny w całej bazie.
    table.string('username').notNullable().unique();
  });
};

exports.down = function(knex) {
  return knex.schema.table('users', function(table) {
    table.dropColumn('username');
  });
};