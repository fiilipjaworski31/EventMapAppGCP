const express = require('express');
const { Pool } = require('pg');
// Importuj klienta Secret Managera
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

const app = express();

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

    const dbConfig = {
      user: 'postgres',
      password: dbPassword, // Używamy hasła pobranego z Secret Managera
      database: 'eventsdb',
      host: '127.0.0.1',
      port: 5433, // Zmieniony port na 5433
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