import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyBACLke2a21OxZLymJfh16zMD7ShjGPQ_U",
  authDomain: "resqall-231be.firebaseapp.com",
  databaseURL: "https://resqall-231be-default-rtdb.firebaseio.com",
  projectId: "resqall-231be",
  storageBucket: "resqall-231be.firebasestorage.app",
  messagingSenderId: "539151099258",
  appId: "1:539151099258:web:b29dc95d73497c8a3e22c3",
  measurementId: "G-8KN1K137J8"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db };
