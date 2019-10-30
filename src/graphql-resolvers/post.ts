import fetch from "isomorphic-unfetch";
import { db } from "../firebase-admin";
import { getPinboardToken, pinboardEndpoint } from "./helpers";
import { USERS_COLLECTION, POSTS_COLLECTION } from "../constants";

const post = async (_, { id }, { uid }) => {
  const pinboardToken = await getPinboardToken(uid);

  const postDocRef = db
    .collection(`${USERS_COLLECTION}/${uid}/${POSTS_COLLECTION}`)
    .doc(id);
  let postDoc = await postDocRef.get();
  let post = postDoc.data();

  if (!postDoc.exists) throw new Error("Post doesn't exist in the DB");

  if (post.updated) {
    const encodedUrl = encodeURI(post.href);

    const pinboardPost = await fetch(
      pinboardEndpoint("posts/get", pinboardToken, `url=${encodedUrl}`)
    );

    const { posts } = await pinboardPost.json();

    const updatedPost = posts[0];

    await postDocRef.set(
      { description: updatedPost.description, tags: updatedPost.tags },
      { merge: true }
    );

    postDoc = await postDocRef.get();
    post = postDoc.data();
  }

  const suggestedTagsRes = await fetch(
    pinboardEndpoint("posts/suggest", pinboardToken, `url=${post.href}`)
  );

  const [{ popular }, { recommended }] = await suggestedTagsRes.json();

  const suggestedTags = new Set([...popular, ...recommended]);

  console.log("--> Return post from Firebase");
  return { ...post, suggestedTags };
};

export { post };
