import { db } from "../firebase-admin";
import { USERS_COLLECTION } from "../constants";

const getCheckpoint = async ({ uid }: { uid: string }): Promise<string> => {
  const userDoc = await db.doc(`${USERS_COLLECTION}/${uid}`).get();
  const checkpoint = userDoc && userDoc.data().checkpoint;

  return checkpoint;
};

export { getCheckpoint };
