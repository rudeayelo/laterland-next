import { db } from "../firebase-admin";
import { USERS_COLLECTION } from "../constants";

const updateCheckpoint = async (_, { id }, { uid }) => {
  try {
    await db
      .doc(`${USERS_COLLECTION}/${uid}`)
      .set({ checkpoint: id }, { merge: true });
    console.log("--> Succesfully updated the checkpoint");
  } catch (error) {
    console.warn("--> Failed updating the checkpoint:", error);

    throw new Error(error);
  }

  return { checkpoint: id };
};

export { updateCheckpoint };
