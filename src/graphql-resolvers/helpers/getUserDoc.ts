import { db } from "../../firebase-admin";
import { USERS_COLLECTION } from "../../constants";
import { UID } from "../../typings";

const getUserDoc = async (
  uid: UID
): Promise<FirebaseFirestore.DocumentSnapshot> =>
  await db.doc(`${USERS_COLLECTION}/${uid}`).get();

export { getUserDoc };
