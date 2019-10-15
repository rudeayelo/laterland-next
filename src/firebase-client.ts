import * as firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

const credentials = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET
};

if (!firebase.apps.length) {
  firebase.initializeApp(credentials);
}

export const db = firebase.firestore();

export default firebase;
