import fetch from "isomorphic-unfetch";
import { db } from "../firebase-admin";
import { pinboardEndpoint } from "../helpers";
import { getPinboardToken } from "./helpers";
import { USERS_COLLECTION, POSTS_COLLECTION } from "../constants";

const deletePost = async (_, { url, id }, { uid }) => {
  const encodedUrl = encodeURI(url);

  const pinboardToken = await getPinboardToken(uid);

  const pinboardDelete = await fetch(
    pinboardEndpoint("posts/delete", pinboardToken, `url=${encodedUrl}`)
  );

  const { result_code } = await pinboardDelete.json();

  let isError = result_code !== "done";
  console.log("result_code", result_code);

  if (isError && result_code !== "item not found") {
    console.log("==> Something failed deleting the post:", result_code);

    throw new Error(result_code);
  } else {
    try {
      await db
        .collection(`${USERS_COLLECTION}/${uid}/${POSTS_COLLECTION}`)
        .doc(id)
        .set({ toread: "no", deleted: Date.now() }, { merge: true });
      console.log("==> Succesfully deleted the post");
    } catch (error) {
      console.warn(
        "==> Deleted the post in Pinboard but something failed in Firebase:",
        error
      );

      throw new Error(error);
    }
  }

  return { result: result_code };
};

export { deletePost };
