import { db } from "../firebase";
import { USERS_COLLECTION } from "../constants";

const getPinboardToken = async ({ uid }: { uid: string }): Promise<string> => {
  const userDoc = await db.doc(`${USERS_COLLECTION}/${uid}`).get();
  const pinboardToken = userDoc && userDoc.data().pinboardToken;

  return pinboardToken;
};

export { getPinboardToken };
