import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";  // Import Firebase Storage

// Firebase configuration for KisanMartApp
const firebaseConfig = {
  apiKey: "AIzaSyAc7c32NfQIXmPbkrcYRs4Z3EjFPOI7qUk",
  authDomain: "kisanmartapp.firebaseapp.com",
  projectId: "kisanmartapp",
  storageBucket: "kisanmartapp.appspot.com",
  messagingSenderId: "390350632346",
  appId: "1:390350632346:web:40161d2f6f4f2c5be3b623",
  measurementId: "G-15YCQSQPD9"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Get Firestore database instance
const db = getFirestore(app);

// Get Firebase Storage instance
const storage = getStorage(app);  // Initialize Firebase Storage

// Export Firestore and Storage instances
export { db, storage };
