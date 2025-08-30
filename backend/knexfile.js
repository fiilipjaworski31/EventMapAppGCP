// Na górze pliku wczytuje zmienne z pliku .env
require('dotenv').config();

module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: '127.0.0.1',
      port: 5433, 
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: 'eventsdb'
    },
    migrations: {
      directory: './db/migrations'
    }
  },

  // Tutaj w przyszłości dodam konfigurację dla środowiska produkcyjnego (Cloud Run)
  // production: { ... }
};