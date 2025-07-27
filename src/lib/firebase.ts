// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "kisan-ai2",
  "appId": "1:32985753477:web:46df0b1f69ab6b3886c6ec",
  "storageBucket": "kisan-ai2.firebasestorage.app",
  "apiKey": "AIzaSyBbomBtjT7nqQO_lh2AfkF1BuExkf67CPA",
  "authDomain": "kisan-ai2.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "32985753477"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
