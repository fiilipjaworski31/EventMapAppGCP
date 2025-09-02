// frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
// import { BrowserRouter } from 'react-router-dom'; 
import { AuthProvider } from './context/AuthContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Usuwamy BrowserRouter stąd, bo jest już w App.jsx */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);