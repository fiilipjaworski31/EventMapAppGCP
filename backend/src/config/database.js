const knex = require('knex');
const knexfile = require('../../knexfile');

// W Cloud Run (K_SERVICE ustawione) wymuś konfigurację 'production',
// nawet jeśli NODE_ENV nie jest ustawione. Lokalnie użyj NODE_ENV lub 'development'.
const isInCloudRun = !!process.env.K_SERVICE;
const selectedEnv = isInCloudRun ? 'production' : (process.env.NODE_ENV || 'development');
const config = knexfile[selectedEnv];

if (!config) {
  throw new Error(`Brak konfiguracji Knex dla środowiska: ${selectedEnv}`);
}

module.exports = knex(config);