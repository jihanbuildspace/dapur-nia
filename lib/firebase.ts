import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeFirestore, getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

export const isFirebaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== "your_api_key_here" &&
  !process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes("your_api")
);

let app: any = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

try {
  if (isFirebaseConfigured) {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    try {
      // Use forceLongPolling to avoid 10s WebSocket timeout & network handshake delays
      db = initializeFirestore(app, {
        experimentalForceLongPolling: true,
      });
    } catch {
      db = getFirestore(app);
    }
    try {
      auth = getAuth(app);
    } catch (authErr) {
      console.warn("Firebase auth initialization warning:", authErr);
    }
  }
} catch (error) {
  console.warn("Firebase initialization warning:", error);
}

export { app, db, auth };
