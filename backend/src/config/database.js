const knex = require('knex');
const knexfile = require('../../knexfile'); // Ścieżka do głównego pliku knexfile

// Określa, której konfiguracji użyć (development, production, etc.)
// Domyślnie używam 'development', chyba że zmienna środowiskowa NODE_ENV mówi inaczej.
const environment = process.env.NODE_ENV || 'development';
const config = knexfile[environment];

// Tworzę i eksportuję jedną, centralną instancję Knex dla całej aplikacji.
module.exports = knex(config);