// frontend/src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useAuth } from '../context/AuthContext';
import './AuthForm.css'; // Assuming this is your stylesheet

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Jeśli użytkownik jest już zalogowany, pokaż komunikat zamiast formularza
  if (currentUser) {
    return (
      <div className="auth-page-wrapper">
        <div className="login-container">
          <h2>Już jesteś zalogowany</h2>
          <p>Witaj, {currentUser.email}!</p>
          <div className="toggle-button">
            <button onClick={() => navigate('/')} className="nav-link">
              Wróć na stronę główną
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Po udanym logowaniu przekieruj na stronę główną
      navigate('/');
    } catch (err) {
      if (err.code === 'auth/invalid-credential') {
        setError('Nieprawidłowy e-mail lub hasło.');
      } else if (err.code === 'auth/user-not-found') {
        setError('Użytkownik o tym adresie e-mail nie istnieje.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Nieprawidłowe hasło.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Zbyt wiele nieudanych prób. Spróbuj ponownie później.');
      } else {
        setError('Wystąpił błąd podczas logowania.');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="login-container">
        <h2>Logowanie</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="login-email">Email</label>
            <input 
              id="login-email"
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              disabled={isLoading}
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="login-password">Hasło</label>
            <input 
              id="login-password"
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Logowanie...' : 'Zaloguj się'}
          </button>
        </form>
        <div className="toggle-button">
          <span>Nie masz konta? <Link to="/register">Zarejestruj się</Link></span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;