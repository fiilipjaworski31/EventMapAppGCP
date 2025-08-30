const express = require('express');
const router = express.Router();

// Połączenie z konfiguracją Knex z pliku knexfile.js
const knexConfig = require('../knexfile').development;
const knex = require('knex')(knexConfig);

// --- Endpointy CRUD ---

// GET /api/events - Pobierz wszystkie wydarzenia
router.get('/', async (req, res) => {
  try {
    const events = await knex('events').select('*');
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Błąd podczas pobierania wydarzeń.', error });
  }
});

// POST /api/events - Stwórz nowe wydarzenie
router.post('/', async (req, res) => {
  try {
    // Na tym etapie zakładam, że dane przychodzą w poprawnym formacie
    // W przyszłości dodam tu walidację i autoryzację
    const [newEvent] = await knex('events').insert(req.body).returning('*');
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ message: 'Błąd podczas tworzenia wydarzenia.', error });
  }
});

module.exports = router;