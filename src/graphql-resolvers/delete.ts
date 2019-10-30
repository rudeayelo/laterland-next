import fetch from "isomorphic-unfetch";
import { ApolloError } from "apollo-server-micro";
import { db } from "../firebase-admin";
import { getPinboardToken, pinboardEndpoint } from "./helpers";
import { USERS_COLLECTION, POSTS_COLLECTION } from "../constants";

const deletePost = async (_, { id }, { uid }) => {
  const postDocRef = await db
    .collection(`${USERS_COLLECTION}/${uid}/${POSTS_COLLECTION}`)
    .doc(id);

  const postDoc = await postDocRef.get();

  if (!postDoc.exists) throw new Error("Post doesn't exist in the DB");

  const post = postDoc.data();

  const encodedUrl = encodeURI(post.href);

  const pinboardToken = await getPinboardToken(uid);

  const pinboardDelete = await fetch(
    pinboardEndpoint("posts/delete", pinboardToken, `url=${encodedUrl}`)
  );

  const { result_code } = await pinboardDelete.json();

  let isError = result_code !== "done";

  if (isError && result_code !== "item not found") {
    console.log("--> Something failed deleting the post:", result_code);

    throw new ApolloError(result_code, "PINBOARD_ERROR");
  }
  if (isError && result_code === "item not found") {
    console.log("--> Post not found in Pinboard");

    await postDocRef.set(
      { toread: "no", deleted: Date.now() },
      { merge: true }
    );

    throw new ApolloError("Post not found in Pinboard", "PINBOARD_NOT_FOUND");
  } else {
    try {
      await postDocRef.set(
        { toread: "no", deleted: Date.now() },
        { merge: true }
      );
      console.log("--> Succesfully deleted the post");
    } catch (error) {
      console.warn(
        "--> Deleted the post in Pinboard but something failed in Firebase:",
        error
      );

      throw new ApolloError(error, "FIREBASE_ERROR");
    }
  }

  return { result: result_code };
};

export { deletePost };
