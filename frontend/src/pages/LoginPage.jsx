import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useAuth } from '../context/AuthContext';
import './AuthForm.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      navigate('/'); // Przekieruj na stronę główną, jeśli użytkownik jest już zalogowany
    }
  }, [currentUser, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Przekierowanie nastąpi automatycznie dzięki useEffect
    } catch (err) {
    if (err.code === 'auth/invalid-credential') {
        setError('Nieprawidłowy e-mail lub hasło.');
      } else {
        // Dla innych, nieprzewidzianych błędów, możemy pokazać ogólną wiadomość
        setError('Wystąpił błąd podczas logowania.');
      }
      console.error(err); // Nadal logujemy oryginalny błąd w konsoli dla dewelopera
    }
  };

  return (
    <div className="login-container">
      <h2>Logowanie</h2>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Hasło</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit">Zaloguj się</button>
      </form>
      <div className="toggle-button">
        <p>Nie masz konta? <Link to="/register">Zarejestruj się</Link></p>
      </div>
    </div>
  );
};

export default LoginPage;