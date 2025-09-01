const admin = require('firebase-admin');

// Inicjalizuje Firebase Admin SDK.
// Domyślnie użyje on tych samych danych uwierzytelniających co gcloud i proxy.
admin.initializeApp();

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).send('Brak autoryzacji: Nie znaleziono tokenu.');
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    // Weryfikuję token za pomocą Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    // Jeśli token jest poprawny, dołączam dane użytkownika do obiektu zapytania
    req.user = decodedToken;
    next(); // Przechodzę do następnej funkcji (logiki endpointu)
  } catch (error) {
    console.error('Błąd weryfikacji tokenu:', error);
    res.status(403).send('Brak autoryzacji: Token jest nieprawidłowy.');
  }
}

module.exports = authenticate;