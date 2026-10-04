import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBtK_2VtiVFOAAMSnED5totF3EXDJRlrqE",
  authDomain: "bootcamp-aca14.firebaseapp.com",
  projectId: "bootcamp-aca14",
  storageBucket: "bootcamp-aca14.firebasestorage.app",
  messagingSenderId: "311050540600",
  appId: "1:311050540600:web:8b7c1987b4cc97d04bb8cd"
};

console.log("Initializing Firebase with project:", firebaseConfig.projectId);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("Attempting to connect to Firestore...");
try {
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error("TIMED_OUT_AFTER_8_SECONDS: Firestore server did not respond")), 8000)
  );
  
  const readPromise = getDocs(collection(db, "menus"));
  const snap = await Promise.race([readPromise, timeoutPromise]);
  console.log("Success! Doc count in 'menus':", snap.docs.length);
} catch (err) {
  console.error("Firestore test error:", err);
}

console.log("Test finished.");
process.exit(0);
