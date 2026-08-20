import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAv7KB0NOsdFKglYcIw0yfG4lJA4dQpV0M',
  authDomain: 'duomessage-c1b87.firebaseapp.com',
  projectId: 'duomessage-c1b87',
  storageBucket: 'duomessage-c1b87.firebasestorage.app',
  messagingSenderId: '871084431083',
  appId: '1:871084431083:web:279a441bc0d0a85b5990ae',
  measurementId: 'G-P3TYEHG71P',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export const ADMIN_EMAIL = 'isabekdanial34@gmail.com';
