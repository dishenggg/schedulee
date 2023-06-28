import { initializeApp } from "firebase/app";
import { getFirestore } from "@firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_APIKEY,
  authDomain: process.env.REACT_APP_AUTHDOMAIN,
  projectId: process.env.REACT_APP_PROJECTID,
  storageBucket: "schedulee-4860e.appspot.com",
  messagingSenderId: "115286191907",
  appId: "1:115286191907:web:ebaf356710e9dc32f6a696",
  measurementId: "G-245PGPG8N0",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
