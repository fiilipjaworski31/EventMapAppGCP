const express = require('express');
console.log("--- ✅ [START] Wczytano plik index.js ---"); 
const { Pool } = require('pg');
// Importuj klienta Secret Managera
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const cors = require('cors');
const eventRoutes = require('./routes/event.routes');
const userRoutes = require('./routes/user.routes');
const interestedRoutes = require('./routes/interested.routes');
const friendsRoutes = require('./routes/friends.routes');

const app = express();

app.use(cors());
app.use(express.json()); // Pozwala serwerowi rozumieć dane JSON w ciele zapytania
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/interested', interestedRoutes);
app.use('/api/friends', friendsRoutes);

const PORT = process.env.PORT || 8080;

// Nazwa sekretu, który stworzyłem w konsoli
const secretName = 'projects/healthy-result-469611-e9/secrets/db-password/versions/latest';

// Funkcja do pobierania sekretu z Secret Managera
async function getDbPassword() {
  console.log('Pobieranie hasła z Secret Manager...');
  const client = new SecretManagerServiceClient();
  const [version] = await client.accessSecretVersion({ name: secretName });
  const password = version.payload.data.toString('utf8');
  console.log('✅ Hasło pomyślnie pobrane.');
  return password;
}

// Główna funkcja uruchamiająca serwer
async function startServer() {
  try {
    // Pobierz hasło przed konfiguracją połączenia z bazą
    const dbPassword = await getDbPassword();

    // Inteligentna konfiguracja bazy danych
    const isProduction = process.env.NODE_ENV === 'production'; // Sprawdza, czy aplikacja działa w trybie produkcyjnym

    const isInCloudRun = !!process.env.K_SERVICE; // Sprawdza, czy aplikacja działa w Cloud Run

    const dbConfig = {
      user: 'postgres',
      password: dbPassword,
      database: 'eventsdb',
      // Użyj Unix socket w Cloud Run, a standardowego hosta i portu lokalnie
      host: isInCloudRun
        ? `/cloudsql/healthy-result-469611-e9:europe-central2:event-map-db` // Nazwa połączenia instancji Cloud SQL
        : '127.0.0.1',
      port: isInCloudRun ? undefined : 5433, // Domyślny port PostgreSQL to 5432, ale używam 5433, aby uniknąć konfliktów z lokalną instancją 
    };

    const pool = new Pool(dbConfig);

    app.get('/', async (req, res) => {
      try {
        const result = await pool.query('SELECT NOW()');
        const currentTime = result.rows[0].now;

        res.status(200).json({
          message: 'API działa, a hasło zostało bezpiecznie pobrane. 🚀',
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
    process.exit(1); // Zatrzymaj aplikację w przypadku błędu
  }
}

// Uruchomienie serwera
startServer();