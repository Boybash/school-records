// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_APIKEY,
  authDomain: process.env.NEXT_PUBLIC_AUTHDOMAIN,
  databaseURL: "https://school-records-c65a6-default-rtdb.firebaseio.com",
  projectId: "school-records-c65a6",
  storageBucket: "school-records-c65a6.firebasestorage.app",
  messagingSenderId: "443130908737",
  appId: "1:443130908737:web:61e221a271526441ee76c0",
  measurementId: "G-B2WQCF5B2Z",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
