import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAXQiMfH7wkD1eFxBuArs_uGsQ3nDmMGN8',
  authDomain: 'chat-app-e98fd.firebaseapp.com',
  projectId: 'chat-app-e98fd',
  storageBucket: 'chat-app-e98fd.firebasestorage.app',
  messagingSenderId: '1061775625571',
  appId: '1:1061775625571:web:016f373d226fe1afb11756',
  measurementId: 'G-3QRD4G697F',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firestore instance
export const db = getFirestore(app);
