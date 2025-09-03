const Event = require('../models/event.model');
const User = require('../models/user.model'); 

// GET /api/events
exports.getAllEvents = async (req, res) => {
  try {
    // Read search and date from the query string (e.g., /api/events?search=rock&date=2025-09-10)
    const filters = {
      search: req.query.search,
      date: req.query.date,
    };
    
    const events = await Event.findAll(filters);
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Błąd podczas pobierania wydarzeń.', error });
  }
};

// GET /api/events/:id
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Nie znaleziono wydarzenia.' });
    }
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Błąd podczas pobierania wydarzenia.', error });
  }
};

// POST /api/events
exports.createEvent = async (req, res) => {
  try {
    // ZMIANA: Używamy teraz modelu User.
    const user = await User.findByFirebaseId(req.user.uid); 
    if (!user) {
      return res.status(404).json({ message: 'Nie znaleziono użytkownika.' });
    }
    const eventData = { ...req.body, creator_id: user.id };
    const [newEvent] = await Event.create(eventData);
    res.status(201).json(newEvent);
  } catch (error) {
    console.error("BŁĄD PODCZAS TWORZENIA WYDARZENIA:", error); // <-- DODAJ TEN LOG
    res.status(500).json({ message: 'Błąd podczas tworzenia wydarzenia.', error: error.message });
  }
};

// PUT /api/events/:id
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Nie znaleziono wydarzenia.' });
    }
    
    // ZMIANA: Używa teraz modelu User.
    const user = await User.findByFirebaseId(req.user.uid);
    if (event.creator_id !== user.id) {
      return res.status(403).json({ message: 'Brak uprawnień do edycji.' });
    }
    
    const [updatedEvent] = await Event.update(req.params.id, req.body);
    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: 'Błąd podczas aktualizacji wydarzenia.', error: error.message });
  }
};

// DELETE /api/events/:id
exports.deleteEvent = async (req, res) => {
  try {
    // 1. Znajdź wydarzenie, które ma zostać usunięte
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Nie znaleziono wydarzenia o podanym ID.' });
    }

    // 2. Znajdź użytkownika, który próbuje usunąć wydarzenie
    const user = await User.findByFirebaseId(req.user.uid);
    if (!user) {
        return res.status(404).json({ message: 'Nie znaleziono użytkownika powiązanego z tokenem.' });
    }

    // 3. Sprawdź, czy użytkownik jest autorem wydarzenia (AUTORYZACJA)
    if (event.creator_id !== user.id) {
      return res.status(403).json({ message: 'Brak uprawnień do usunięcia tego wydarzenia.' });
    }

    // 4. Jeśli wszystko się zgadza, usuń wydarzenie
    await Event.remove(req.params.id);

    // 5. Wyślij odpowiedź 204 No Content, informującą o sukcesie
    res.status(204).send();

  } catch (error) {
    console.error('Błąd podczas usuwania wydarzenia:', error);
    res.status(500).json({ message: 'Wystąpił błąd serwera podczas usuwania wydarzenia.', error: error.message });
  }
};