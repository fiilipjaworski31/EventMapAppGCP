// Plik: backend/src/test-db.js

const { Pool } = require('pg');

console.log('--- Rozpoczynam test połączenia z bazą danych... ---');

const dbConfig = {
  user: 'postgres',
  // UWAGA: Wklej tutaj swoje hasło do bazy danych na potrzeby tego testu.
  password: 'Filipek123Postgres!', 
  database: 'eventsdb',
  host: '127.0.0.1', // Łączymy się przez proxy, więc host to localhost
  port: 5433,      // Port, na którym nasłuchuje proxy
};

const pool = new Pool(dbConfig);

async function testConnection() {
  let client;
  try {
    // Próbujemy pobrać połączenie z puli
    console.log('Próba pobrania klienta z puli...');
    client = await pool.connect();
    console.log('✅ Klient pomyślnie pobrany. Wysyłam zapytanie...');
    
    // Wykonujemy proste zapytanie
    const result = await client.query('SELECT NOW()');
    console.log('✅ Zapytanie wykonane pomyślnie!');
    console.log('--- WYNIK TESTU: POŁĄCZENIE Z BAZĄ DANYCH UDANE! ---');
    console.log('Aktualny czas z bazy danych:', result.rows[0].now);

  } catch (error) {
    console.error('--- WYNIK TESTU: BŁĄD POŁĄCZENIA! ---');
    console.error('Szczegóły błędu:', error);
  } finally {
    // Zwalniamy klienta z powrotem do puli
    if (client) {
      client.release();
      console.log('Połączenie zwolnione.');
    }
    // Zamykamy całą pulę połączeń
    await pool.end();
    console.log('Pula połączeń zamknięta.');
  }
}

testConnection();