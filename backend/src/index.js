const express = require('express');
console.log("--- ✅ [START] Wczytano plik index.js ---"); 
const cors = require('cors');

const app = express();

// Konfiguracja CORS z poprawną obsługą preflight (OPTIONS) przed autoryzacją
const corsOptions = {
  origin: true, // Odbijaj pochodzenie
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
// Express 5 + path-to-regexp v6 nie akceptuje '*' jako ścieżki – użyj RegExp
app.options(/.*/, cors(corsOptions));
app.use(express.json()); // Pozwala serwerowi rozumieć dane JSON w ciele zapytania

const PORT = process.env.PORT || 8080;

// Nazwa sekretu w GCP Secret Manager (używana tylko w Cloud Run)
const DEFAULT_INSTANCE = 'healthy-result-469611-e9:europe-central2:event-map-db';
const SECRET_NAME = 'projects/healthy-result-469611-e9/secrets/db-password/versions/latest';

// Bezpieczne pobieranie hasła tylko w produkcji/Cloud Run, lokalnie użyj .env
async function ensureDbPassword() {
  const isInCloudRun = !!process.env.K_SERVICE;
  if (process.env.DB_PASSWORD) {
    console.log('🔐 Używam hasła z env DB_PASSWORD.');
    return process.env.DB_PASSWORD;
  }
  if (!isInCloudRun) {
    console.warn('⚠️ DB_PASSWORD nie ustawione, a środowisko nie jest Cloud Run. Upewnij się, że masz lokalne .env.');
    return undefined;
  }
  try {
    console.log('Pobieranie hasła z Secret Manager (Cloud Run)...');
    const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
    const client = new SecretManagerServiceClient();
    const [version] = await client.accessSecretVersion({ name: SECRET_NAME });
    const password = version.payload.data.toString('utf8');
    console.log('✅ Hasło pomyślnie pobrane z Secret Manager.');
    process.env.DB_PASSWORD = password; // Ustaw, aby widoczne było dla knex/knexfile
    return password;
  } catch (err) {
    console.error('❌ Nie udało się pobrać hasła z Secret Manager:', err);
    throw err;
  }
}

async function startServer() {
  try {
    // 1) Zapewnij, że mamy hasło zanim załadujemy trasy i modele (które korzystają z Knex)
    await ensureDbPassword();

    // Ustaw domyślne INSTANCE_CONNECTION_NAME w Cloud Run, jeśli nie podano
    const isInCloudRunBoot = !!process.env.K_SERVICE;
    if (isInCloudRunBoot && !process.env.INSTANCE_CONNECTION_NAME) {
      process.env.INSTANCE_CONNECTION_NAME = DEFAULT_INSTANCE;
      console.log(`🔧 Ustawiono domyślne INSTANCE_CONNECTION_NAME: ${process.env.INSTANCE_CONNECTION_NAME}`);
    }

    // 2) Middleware diagnostyczny dla przestrzeni /api
    app.use('/api', (req, _res, next) => {
      try {
        console.log(`[API] ${req.method} ${req.originalUrl}`);
      } catch (_) {
        // no-op
      }
      next();
    });

    // 3) Prosty endpoint diagnostyczny
    app.get('/api/ping', (req, res) => {
      res.status(200).json({ ok: true, message: 'pong' });
    });

    // 4) Załaduj trasy dopiero teraz, aby modele/Knex miały dostęp do poprawnego hasła
    const eventRoutes = require('./routes/event.routes');
    const userRoutes = require('./routes/user.routes');
    const interestedRoutes = require('./routes/interested.routes');
    const friendRoutes = require('./routes/friend.routes');

    app.use('/api/events', eventRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/interested', interestedRoutes);
    app.use('/api/friends', friendRoutes);

    // Opcjonalny debug: lista zarejestrowanych endpointów
    if (process.env.DEBUG_ROUTES === '1') {
      const listEndpoints = require('express-list-endpoints');
      const endpoints = listEndpoints(app);
      console.log('📋 Zarejestrowane endpointy:', endpoints);
      app.get('/_debug/routes', (req, res) => res.json(endpoints));
    }

    // 5) Fallback 404 dla /api z logowaniem, aby łatwiej diagnozować brakujące trasy
    app.use('/api', (req, res) => {
      console.warn(`[API-404] ${req.method} ${req.originalUrl}`);
      res.status(404).json({ message: 'Not found', path: req.originalUrl, method: req.method });
    });

    // 3) Proste sprawdzenie połączenia do bazy (używa pg bezpośrednio)
    const isInCloudRun = !!process.env.K_SERVICE;
    const instanceName = process.env.INSTANCE_CONNECTION_NAME || DEFAULT_INSTANCE;
    const { Pool } = require('pg');
    const dbConfig = {
      user: 'postgres',
      password: process.env.DB_PASSWORD,
      database: 'eventsdb',
      host: isInCloudRun ? `/cloudsql/${instanceName}` : '127.0.0.1',
      port: isInCloudRun ? undefined : 5433,
    };
    const pool = new Pool(dbConfig);

    app.get('/', async (req, res) => {
      try {
        const result = await pool.query('SELECT NOW()');
        const currentTime = result.rows[0].now;
        res.status(200).json({
          message: 'API działa i ma dostęp do bazy. 🚀',
          dbTime: currentTime,
        });
      } catch (error) {
        console.error('Błąd zapytania do bazy danych:', error);
        res.status(500).json({ message: 'Błąd podczas wykonywania zapytania do bazy.' });
      }
    });

    app.listen(PORT, () => {
      console.log(`✅ Serwer uruchomiony i nasłuchuje na porcie ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Krytyczny błąd podczas uruchamiania serwera:', error);
    process.exit(1);
  }
}

startServer();