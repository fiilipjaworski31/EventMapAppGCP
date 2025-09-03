exports.up = function(knex) {
  return knex.schema.table('events', function(table) {
    table.string('url'); // URL do strony wydarzenia/biletów
    table.string('image_url'); // URL do głównego zdjęcia wydarzenia
    table.string('venue_name'); // Nazwa miejsca (np. "PGE Narodowy")
  });
};

exports.down = function(knex) {
  return knex.schema.table('events', function(table) {
    table.dropColumn('url');
    table.dropColumn('image_url');
    table.dropColumn('venue_name');
  });
};