import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import axios from 'axios'; // Potrzebujemy axios do wysłania danych do naszego API
import './AuthForm.css';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); 
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // 1. Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Send user data to your backend
      const API_URL = import.meta.env.VITE_API_URL;
      await axios.post(`${API_URL}/api/users`, {
        firebase_uid: user.uid,
        email: user.email,
        username: username,
      });

      // 3. Redirect to login page
      navigate('/login');
    } catch (err) {
      // UPDATED ERROR HANDLING
      if (err.response && err.response.status === 409) {
          setError('Ta nazwa użytkownika jest już zajęta.');
      } else if (err.code === 'auth/email-already-in-use') {
          setError('Ten adres e-mail jest już zarejestrowany.');
      } else if (err.code === 'auth/weak-password') { 
          setError('Hasło musi mieć co najmniej 6 znaków.');
      } else {
          setError('Wystąpił błąd podczas rejestracji.');
      }
      console.error(err);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="login-container">
        <h2>Rejestracja</h2>
        <form onSubmit={handleRegister}>
          {/* DODANE POLE NA NAZWĘ UŻYTKOWNIKA */}
            <div className="form-group">
              <label htmlFor="register-username">Nazwa użytkownika</label>
              <input id="register-username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required autoComplete="username" />
          </div>
          <div className="form-group">
            <label htmlFor="register-email">Email</label>
            <input id="register-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div className="form-group">
              <label htmlFor="register-password">Hasło</label>
              <input id="register-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit">Zarejestruj się</button>
        </form>
        <div className="toggle-button">
            <span>Masz już konto? <Link to="/login">Zaloguj się</Link></span>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;