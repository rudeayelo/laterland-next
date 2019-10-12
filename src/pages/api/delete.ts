import fetch from "isomorphic-unfetch";
import { db } from "../../firebase";
import { getPinboardToken, pinboardEndpoint } from "../../helpers";
import { USERS_COLLECTION, POSTS_COLLECTION } from "../../constants";

export default async (req, res) => {
  res.setHeader("Content-Type", "application/json");

  const { uid } = req.query;
  const { url, hash } = JSON.parse(req.body);

  const encodedUrl = encodeURI(url);

  const token = await getPinboardToken({ uid });

  const pinboardAdd = await fetch(
    pinboardEndpoint("posts/delete", token, `url=${encodedUrl}`)
  );

  const { result_code } = await pinboardAdd.json();

  const isError = result_code !== "done";

  if (isError && result_code !== "item not found") {
    console.log("==> Something failed deleting the post:", result_code);
  } else {
    await db
      .collection(`${USERS_COLLECTION}/${uid}/${POSTS_COLLECTION}`)
      .doc(hash)
      .delete();
    console.log("==> Succesfully deleted the post");
  }

  res.status(200).end(
    JSON.stringify({
      data: result_code,
      ...(isError ? { error: true } : {})
    })
  );
};
