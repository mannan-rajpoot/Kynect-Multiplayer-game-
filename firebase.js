// ─── Firebase Configuration ────────────────────────────────────────────────
// Replace the values below with your actual Firebase project credentials.
// You can find these in: Firebase Console → Project Settings → Your Apps → SDK setup

import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC1ODcIa9PRIXC7ghCNq4wHoBDK66IEGTE",
  authDomain: "kynect-database-9df95.firebaseapp.com",
  databaseURL: "https://kynect-database-9df95-default-rtdb.firebaseio.com",
  projectId: "kynect-database-9df95",
  storageBucket: "kynect-database-9df95.firebasestorage.app",
  messagingSenderId: "837763138217",
  appId: "1:837763138217:web:fffe0a326ffd6f1d1cdfb8"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence (keeps user logged in across app restarts)
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize Firestore
export const db = getFirestore(app);

export default app;