const Interested = require('../models/interested.model');
const User = require('../models/user.model');

exports.getInterestedEvents = async (req, res) => {
  try {
    const user = await User.findByFirebaseId(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: 'Nie znaleziono użytkownika.' });
    }
    const events = await Interested.findEventsByUserId(user.id);
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Błąd podczas pobierania wydarzeń.', error: error.message });
  }
};

exports.addInterestedEvent = async (req, res) => {
  try {
    console.log('[INTERESTED] addInterestedEvent handler start', { params: req.params, uid: req.user && req.user.uid });
    const user = await User.findByFirebaseId(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: 'Nie znaleziono użytkownika.' });
    }
    const eventId = parseInt(req.params.eventId, 10);
    console.log('[INTERESTED] inserting relation', { userId: user.id, eventId });
    await Interested.add(user.id, eventId);
    res.status(201).json({ message: 'Dodano do zainteresowań.' });
  } catch (error) {
    console.error('[INTERESTED] addInterestedEvent error', error);
    if (error.code === '23505') { // Unikalny klucz
        return res.status(409).json({ message: 'Już jesteś zainteresowany tym wydarzeniem.' });
    }
    res.status(500).json({ message: 'Błąd podczas dodawania do zainteresowań.', error: error.message });
  }
};

exports.removeInterestedEvent = async (req, res) => {
  try {
    const user = await User.findByFirebaseId(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: 'Nie znaleziono użytkownika.' });
    }
    const eventId = parseInt(req.params.eventId, 10);
    await Interested.remove(user.id, eventId);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Błąd podczas usuwania z zainteresowań.', error: error.message });
  }
};