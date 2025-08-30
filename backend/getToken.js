const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, getIdToken } = require('firebase/auth');

// ❗ WAŻNE: Konfiguracja skopiowana z konsoli Firebase
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBZdfu-50HTmAHYzH5Z0TeYpRnXpUsIxKc",
  authDomain: "healthy-result-469611-e9.firebaseapp.com",
  projectId: "healthy-result-469611-e9",
  storageBucket: "healthy-result-469611-e9.firebasestorage.app",
  messagingSenderId: "182465916792",
  appId: "1:182465916792:web:a87180a7706f091a83e28d",
  measurementId: "G-5R9N7XYLXB"
};

// Dane testowego użytkownika
const email = 'test@user.com'; 
const password = 'testuser'; 

// --- Logika skryptu ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

console.log('Logowanie w celu pobrania tokenu...');

signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => getIdToken(userCredential.user))
  .then((token) => {
    console.log('\n✅ Twój ID Token jest gotowy! Skopiuj wszystko poniżej:\n');
    console.log(token);
    console.log('\n');
  })
  .catch((error) => {
    console.error('\n❌ Błąd podczas pobierania tokenu:', error.message);
  })
  .finally(() => process.exit());