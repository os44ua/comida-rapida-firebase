import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { ref, push, onValue, update, remove, get } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAWz1qigmDRQmICewX9JMDf6GVg8nFEQZs",
  authDomain: "comidarapidafirebase.firebaseapp.com",
  databaseURL: "https://comidarapidafirebase-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "comidarapidafirebase",
  storageBucket: "comidarapidafirebase.firebasestorage.app",
  messagingSenderId: "825049278697",
  appId: "1:825049278697:web:8b6ea3032e59148b93e878",
  measurementId: "G-G9JBR7T9ZS"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

export { ref, push, onValue, update, remove, get };
