// backend/knexfile.js
require('dotenv').config({ path: './.env' });

module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: '127.0.0.1',
      port: 5433, // Using a clean port
      user: 'postgres',
      password: process.env.DB_PASSWORD,
      database: 'eventsdb',
    },
    migrations: {
      directory: './db/migrations',
    },
    seeds: {
      directory: './db/seeds',
    },
  },
  // Production config remains unchanged
  production: {
    client: 'pg',
    connection: {
      user: 'postgres',
      password: process.env.DB_PASSWORD,
      database: 'eventsdb',
      host: `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`,
    },
    migrations: {
      directory: './db/migrations',
    },
  },
};