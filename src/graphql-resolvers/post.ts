import fetch from "isomorphic-unfetch";
import { db } from "../firebase-admin";
import { USERS_COLLECTION, POSTS_COLLECTION } from "../constants";

const post = async (_, { id }, { uid }) => {
  const postDoc = await db
    .collection(`${USERS_COLLECTION}/${uid}/${POSTS_COLLECTION}`)
    .doc(id)
    .get();

  if (!postDoc.exists) throw new Error("Post doesn't exist in the DB");

  console.log("==> Return post from Firebase");
  return postDoc.data();
};

export { post };
