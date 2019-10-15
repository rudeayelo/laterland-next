import * as firebase from "firebase-admin";

try {
  firebase.app();
} catch (error) {
  firebase.initializeApp({
    credential: firebase.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      // Fix based on this StackOverflow answer:
      // https://stackoverflow.com/questions/39492587/escaping-issue-with-firebase-privatekey-as-a-heroku-config-variable/41044630#41044630
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
}

export const db = firebase.firestore();

export default firebase;
