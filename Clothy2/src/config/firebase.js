import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBgGx_OskEdbq3INWX0j9emYrF8r87_0N0",
  authDomain: "clothy-36814.firebaseapp.com",
  databaseURL: "https://clothy-36814-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "clothy-36814",
  storageBucket: "clothy-36814.appspot.com",
  messagingSenderId: "884934321429",
  appId: "1:884934321429:web:55162a2a3c61ec65a9f51c",
  measurementId: "G-2LKR5MVR5X"
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const firestore = getFirestore(app);
const database = getDatabase(app);
const storage = getStorage(app);

export { app, auth, firestore, database, storage };
