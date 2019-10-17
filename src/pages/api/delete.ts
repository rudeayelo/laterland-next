import fetch from "isomorphic-unfetch";
import { db } from "../../firebase-admin";
import {
  getPinboardToken,
  pinboardEndpoint,
  verifyUserIdToken
} from "../../helpers";
import { USERS_COLLECTION, POSTS_COLLECTION } from "../../constants";

export default async (req, res) => {
  res.setHeader("Content-Type", "application/json");

  const { userToken, url, hash } = JSON.parse(req.body);

  const uid = await verifyUserIdToken(userToken);

  const encodedUrl = encodeURI(url);

  const pinboardToken = await getPinboardToken({ uid });

  const pinboardDelete = await fetch(
    pinboardEndpoint("posts/delete", pinboardToken, `url=${encodedUrl}`)
  );

  const { result_code } = await pinboardDelete.json();

  const isError = result_code !== "done";

  if (isError && result_code !== "item not found") {
    console.log("==> Something failed deleting the post:", result_code);
  } else {
    try {
      await db
        .collection(`${USERS_COLLECTION}/${uid}/${POSTS_COLLECTION}`)
        .doc(hash)
        .delete();
      console.log("==> Succesfully deleted the post");
    } catch (error) {
      console.warn(
        "==> Deleted the post in Pinboard but something failed in Firebase:",
        error
      );
    }
  }

  res.status(200).end(
    JSON.stringify({
      data: result_code,
      ...(isError ? { error: true } : {})
    })
  );
};
