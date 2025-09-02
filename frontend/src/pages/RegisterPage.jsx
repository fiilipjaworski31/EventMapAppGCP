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
    <div className="login-container">
      <h2>Rejestracja</h2>
      <form onSubmit={handleRegister}>
        {/* DODANE POLE NA NAZWĘ UŻYTKOWNIKA */}
        <div className="form-group">
          <label>Nazwa użytkownika</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Hasło</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit">Zarejestruj się</button>
      </form>
      <div className="toggle-button">
        <p>Masz już konto? <Link to="/login">Zaloguj się</Link></p>
      </div>
    </div>
  );
};

export default RegisterPage;