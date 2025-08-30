import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig'; // Import auth from your config
import './LoginPage.css'; // Dodaj kilka stylów

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
        alert('Rejestracja pomyślna! Możesz się teraz zalogować.');
        setIsRegistering(false);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        alert('Zalogowano pomyślnie!');
        // Tutaj w przyszłości przekierujemy użytkownika np. na stronę główną
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  };

  return (
    <div className="login-container">
      <h2>{isRegistering ? 'Rejestracja' : 'Logowanie'}</h2>
      <form onSubmit={handleAuth}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Hasło</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit">{isRegistering ? 'Zarejestruj się' : 'Zaloguj się'}</button>
      </form>
      <button onClick={() => setIsRegistering(!isRegistering)} className="toggle-button">
        {isRegistering ? 'Masz już konto? Zaloguj się' : 'Nie masz konta? Zarejestruj się'}
      </button>
    </div>
  );
};

export default LoginPage;