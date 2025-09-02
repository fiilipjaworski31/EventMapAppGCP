import React, { useContext, useState, useEffect, createContext } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Inicjalizujemy kontekst
const AuthContext = createContext();

// Tworzymy hook, którego będziemy używać w komponentach
export function useAuth() {
  return useContext(AuthContext);
}

// Tworzymy komponent Providera
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    // onAuthStateChanged to "nasłuchiwacz" od Firebase.
    // Uruchamia się za każdym razem, gdy użytkownik się loguje, wylogowuje,
    // a także raz po załadowaniu aplikacji.
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Zwracamy funkcję czyszczącą, aby przestać nasłuchiwać, gdy komponent zostanie odmontowany
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
  };

  // Udostępniamy 'currentUser' wszystkim komponentom-dzieciom.
  // Renderujemy dzieci dopiero, gdy zakończy się wstępne sprawdzanie stanu logowania.
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}