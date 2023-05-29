import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from "firebase/storage";



const firebaseConfig = {
  apiKey: "AIzaSyBAZspf4GG-WHSEge0zCmhBWERhAkVVjwA",
  authDomain: "company-website-52f14.firebaseapp.com",
  projectId: "company-website-52f14",
  storageBucket: "company-website-52f14.appspot.com",
  messagingSenderId: "471442215060",
  appId: "1:471442215060:web:4f1ad1a982aec9a1536481",
  measurementId: "G-S7S3N7WL4L",
  databaseURL: "https://company-website-52f14-default-rtdb.europe-west1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage();
export default app;
