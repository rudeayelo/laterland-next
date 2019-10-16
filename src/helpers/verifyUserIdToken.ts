import firebase from "../firebase-admin";

const verifyUserIdToken = async (userToken: string): Promise<string> => {
  const { uid } = await firebase.auth().verifyIdToken(userToken);

  return uid;
};

export { verifyUserIdToken };
