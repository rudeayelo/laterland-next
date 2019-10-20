import { db } from "../../firebase-admin";
import { verifyUserIdToken } from "../../helpers";
import { USERS_COLLECTION } from "../../constants";

export default async (req, res) => {
  res.setHeader("Content-Type", "application/json");

  const { userToken, hash } = JSON.parse(req.body);

  const uid = await verifyUserIdToken(userToken);

  try {
    await db
      .doc(`${USERS_COLLECTION}/${uid}`)
      .set({ checkpoint: hash }, { merge: true });
    console.log("==> Succesfully updated the checkpoint");
  } catch (error) {
    console.warn("==> Failed updating the checkpoint:", error);
  }

  res.status(200).end();
};
