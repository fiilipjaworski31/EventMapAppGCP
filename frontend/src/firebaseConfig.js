import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
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

// Zainicjuj Firebase
const app = initializeApp(firebaseConfig);

// Eksportuj usługę uwierzytelniania
export const auth = getAuth(app);