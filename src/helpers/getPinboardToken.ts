import { db } from "../firebase-admin";
import { USERS_COLLECTION } from "../constants";

const getPinboardToken = async ({ uid }: { uid: string }): Promise<string> => {
  console.log("==> Getting Pinboard token");
  const userDoc = await db.doc(`${USERS_COLLECTION}/${uid}`).get();
  const pinboardToken = userDoc && userDoc.data().pinboardToken;

  return pinboardToken;
};

export { getPinboardToken };
