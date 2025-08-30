const express = require('express');
const router = express.Router();
const knexConfig = require('../knexfile').development;
const knex = require('knex')(knexConfig); 
const authenticate = require('../middleware/authenticate');

// --- GOTOWE ENDPOINTY ---

// GET /api/events - Pobierz wszystkie wydarzenia (publiczny)
router.get('/', async (req, res) => {
  try {
    const events = await knex('events').select('*');
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Błąd podczas pobierania wydarzeń.', error });
  }
});

// POST /api/events - Stwórz nowe wydarzenie (zabezpieczony)
router.post('/', authenticate, async (req, res) => {
  try {
    const firebaseUid = req.user.uid;
    const user = await knex('users').where({ firebase_uid: firebaseUid }).first(); 

    if (!user) {
      return res.status(404).json({ message: 'Nie znaleziono użytkownika powiązanego z tym tokenem.' });
    }

    const eventData = { ...req.body, creator_id: user.id };
    const [newEvent] = await knex('events').insert(eventData).returning('*');
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ message: 'Błąd podczas tworzenia wydarzenia.', error: error.message });
  }
});

// --- NOWE ENDPOINTY ---

// GET /api/events/:id - Pobierz jedno wydarzenie po ID (publiczny)
router.get('/:id', async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await knex('events').where({ id: eventId }).first();

    if (!event) {
      return res.status(404).json({ message: 'Nie znaleziono wydarzenia o podanym ID.' });
    }
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Błąd podczas pobierania wydarzenia.', error });
  }
});

// PUT /api/events/:id - Aktualizuj wydarzenie (zabezpieczony i autoryzowany)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const eventId = req.params.id;
    const firebaseUid = req.user.uid;

    const user = await knex('users').where({ firebase_uid: firebaseUid }).first();
    const event = await knex('events').where({ id: eventId }).first();

    if (!event) {
      return res.status(404).json({ message: 'Nie znaleziono wydarzenia o podanym ID.' });
    }

    // AUTORYZACJA: Sprawdzamy, czy ID autora wydarzenia zgadza się z ID zalogowanego użytkownika
    if (event.creator_id !== user.id) {
      return res.status(403).json({ message: 'Brak uprawnień do edycji tego wydarzenia.' });
    }

    const [updatedEvent] = await knex('events').where({ id: eventId }).update(req.body).returning('*');
    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: 'Błąd podczas aktualizacji wydarzenia.', error: error.message });
  }
});

// DELETE /api/events/:id - Usuń wydarzenie (zabezpieczony i autoryzowany)
router.delete('/:id', authenticate, async (req, res) => { 
  try {
    const eventId = req.params.id;
    const firebaseUid = req.user.uid;

    const user = await knex('users').where({ firebase_uid: firebaseUid }).first();
    const event = await knex('events').where({ id: eventId }).first();

    if (!event) {
      return res.status(404).json({ message: 'Nie znaleziono wydarzenia o podanym ID.' });
    }

    // AUTORYZACJA: Ta sama logika co przy aktualizacji
    if (event.creator_id !== user.id) {
      return res.status(403).json({ message: 'Brak uprawnień do usunięcia tego wydarzenia.' });
    }

    await knex('events').where({ id: eventId }).del();
    res.status(204).send(); // 204 No Content - standardowa odpowiedź po pomyślnym usunięciu
  } catch (error) {
    res.status(500).json({ message: 'Błąd podczas usuwania wydarzenia.', error: error.message });
  }
});


module.exports = router;