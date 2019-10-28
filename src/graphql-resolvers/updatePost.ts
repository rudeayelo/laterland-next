import fetch from "isomorphic-unfetch";
import { db } from "../firebase-admin";
import { pinboardEndpoint } from "../helpers";
import { getPinboardToken } from "./helpers";
import { USERS_COLLECTION, POSTS_COLLECTION } from "../constants";

const updatePost = async (_, { description, tags, id }, { uid }) => {
  const postDocRef = await db
    .collection(`${USERS_COLLECTION}/${uid}/${POSTS_COLLECTION}`)
    .doc(id);

  const postDoc = await postDocRef.get();

  if (!postDoc.exists) throw new Error("Post doesn't exist in the DB");

  const post = postDoc.data();

  const encodedUrl = encodeURI(post.href);
  const encodedDescription = encodeURI(description);
  const encodedTags = encodeURI(tags);

  const pinboardToken = await getPinboardToken(uid);

  const pinboardAdd = await fetch(
    pinboardEndpoint(
      "posts/add",
      pinboardToken,
      `url=${encodedUrl}&description=${encodedDescription}&tags=${encodedTags}`
    )
  );

  const { result_code } = await pinboardAdd.json();

  const isError = result_code !== "done";

  if (isError) {
    console.log("==> Something failed updating the post");

    throw new Error(result_code);
  } else {
    try {
      await db
        .collection(`${USERS_COLLECTION}/${uid}/${POSTS_COLLECTION}`)
        .doc(id)
        .set({ toread: "no", updated: Date.now() }, { merge: true });
      console.log("==> Succesfully updated the post");
    } catch (error) {
      console.warn(
        "==> Updated post in Pinboard but something failed in Firebase:",
        error
      );
      throw new Error(error);
    }
  }

  return { result: result_code };
};

export { updatePost };
