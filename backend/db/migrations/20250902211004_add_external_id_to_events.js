exports.up = function(knex) {
  return knex.schema.table('events', function(table) {
    // ID z Ticketmastera jest tekstem, np. 'G5v0Z9bKx_Qv7'
    table.string('external_id').unique(); // UNIQUE zapobiegnie duplikatom
  });
};

exports.down = function(knex) {
  return knex.schema.table('events', function(table) {
    table.dropColumn('external_id');
  });
};