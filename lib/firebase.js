// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  doc, 
  setDoc,
  getDocs,
  getDoc,
  query,
  where 
} from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyANDRNupFHFLsGpNpDLdNNHWQ1I2U_bM7A",
  authDomain: "sbexchange-65bf1.firebaseapp.com",
  projectId: "sbexchange-65bf1",
  storageBucket: "sbexchange-65bf1.firebasestorage.app",
  messagingSenderId: "274140119137",
  appId: "1:274140119137:web:17d4a45da19b59c2276a20",
  measurementId: "G-VQQZW2E5J4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export Firebase instances
export const auth = getAuth(app);
export const db = getFirestore(app);

// Export Firebase Auth methods
export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
};

// Export Firestore methods
export {
  collection,
  addDoc,
  doc,
  setDoc,
  getDocs,
  getDoc,
  query,
  where
};