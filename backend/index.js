const express = require('express');
const { Pool } = require('pg');
// Importuj klienta Secret Managera
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json()); // Pozwala serwerowi rozumieć dane JSON w ciele zapytania
app.use('/api/events', require('./routes/events')); // Wszystkie zapytania do /api/events obsłuży nowy router zdefiniowany w events.js

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
    const isProduction = process.env.NODE_ENV === 'production';

    const isInCloudRun = !!process.env.K_SERVICE;

    const dbConfig = {
      user: 'postgres',
      password: dbPassword,
      database: 'eventsdb',
      // Użyj Unix socket w Cloud Run, a standardowego hosta i portu lokalnie
      host: isInCloudRun
        ? `/cloudsql/healthy-result-469611-e9:europe-central2:event-map-db` // Nazwa połączenia instancji Cloud SQL
        : '127.0.0.1',
      port: isInCloudRun ? undefined : 5433,
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