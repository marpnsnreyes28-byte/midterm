import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBEwbbYnSA2csRaXtagqyLq6mAqwNn6A6U",
  authDomain: "midterm-d1804.firebaseapp.com",
  projectId: "midterm-d1804",
  storageBucket: "midterm-d1804.firebasestorage.app",
  messagingSenderId: "170841081629",
  appId: "1:170841081629:web:76045c8545151d5a1803f4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
