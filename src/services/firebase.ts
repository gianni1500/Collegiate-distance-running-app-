import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyALPLqiNAmfxZVJwe56EySsKWjTRWcbHWU',
  authDomain: 'cd-running-app.firebaseapp.com',
  projectId: 'cd-running-app',
  storageBucket: 'cd-running-app.firebasestorage.app',
  messagingSenderId: '97608185849',
  appId: '1:97608185849:web:58910b9106a55ff4f82f28',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Use initializeAuth with AsyncStorage so the session persists across app restarts
export const auth = getApps().length === 1
  ? initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) })
  : getAuth(app);

export const db = getFirestore(app);
