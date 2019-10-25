import fetch from "isomorphic-unfetch";
import { db } from "../../firebase-admin";
import {
  getPinboardToken,
  pinboardEndpoint,
  verifyUserIdToken
} from "../../helpers";
import { USERS_COLLECTION, POSTS_COLLECTION } from "../../constants";

export default async (req, res) => {
  const { userToken, url, description, tags, hash } = JSON.parse(req.body);

  const uid = await verifyUserIdToken(userToken);

  const encodedUrl = encodeURI(url);
  const encodedDescription = encodeURI(description);
  const encodedTags = encodeURI(tags);

  const pinboardToken = await getPinboardToken({ uid });

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
  } else {
    try {
      await db
        .collection(`${USERS_COLLECTION}/${uid}/${POSTS_COLLECTION}`)
        .doc(hash)
        .set({ toread: "no" }, { merge: true });
      console.log("==> Succesfully updated the post");
    } catch (error) {
      console.warn(
        "==> Updated post in Pinboard but something failed in Firebase:",
        error
      );
    }
  }

  res.setHeader("Content-Type", "application/json");
  res.status(200).end(
    JSON.stringify({
      data: result_code,
      ...(isError ? { error: true } : {})
    })
  );
};
