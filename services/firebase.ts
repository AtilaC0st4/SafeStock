// src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAUAUOhbJzgnwMI3L--B0IPe-jEJqm1LF4",
  authDomain: "safestock-8bb8a.firebaseapp.com",
  projectId: "safestock-8bb8a",
  storageBucket: "safestock-8bb8a.firebasestorage.app",
  messagingSenderId: "137256721423",
  appId: "1:137256721423:web:e3c0aa874eba7cbdcfd77a"
};

const app = initializeApp(firebaseConfig);

// Auth sem persistência entre sessões
export const auth = getAuth(app);
