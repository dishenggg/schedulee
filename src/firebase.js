import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "@firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDuwfDd3Il7PuRhyJfx-Aowl2swjLmNamE",
  authDomain: "testing-server-ac4fc.firebaseapp.com",
  projectId: "testing-server-ac4fc",
  storageBucket: "testing-server-ac4fc.appspot.com",
  messagingSenderId: "517700197493",
  appId: "1:517700197493:web:a93248a3432114bd54ac3c",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
