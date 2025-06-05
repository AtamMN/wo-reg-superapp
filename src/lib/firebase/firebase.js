import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserSessionPersistence
} from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";

// Primary Firebase config
const primaryConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MSG_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

// Secondary Firebase config
const secondaryConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_SECONDARY_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_SECONDARY_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_SECONDARY_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_SECONDARY_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_SECONDARY_MSG_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_SECONDARY_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_SECONDARY_DATABASE_URL,
};

let auth, db, personalDb; 
// Initialize primary app & services
if (typeof window !== "undefined") {
  const primaryApp = initializeApp(primaryConfig);
  auth = getAuth(primaryApp);
  db = getDatabase(primaryApp);

  setPersistence(auth, browserSessionPersistence)
    .then(() => console.log("Auth persistence set to session."))
    .catch((error) => console.error("Failed to set session persistence:", error));

  const secondaryApp = initializeApp(secondaryConfig, 'secondary');
  personalDb = getFirestore(secondaryApp);
}

export { auth, db, personalDb };