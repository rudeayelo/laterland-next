import * as firebase from "firebase-admin";

try {
  firebase.app();
} catch (error) {
  firebase.initializeApp({
    credential: firebase.credential.cert({
      // @ts-ignore
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY,
      client_email: process.env.FIREBASE_CLIENT_EMAIL
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
}

export const db = firebase.firestore();

export default firebase;
