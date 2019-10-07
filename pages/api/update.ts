import fetch from "isomorphic-unfetch";
import { db } from "../../firebase";
import { getPinboardToken, pinboardEndpoint } from "../../helpers";
import { USERS_COLLECTION, POSTS_COLLECTION } from "../../constants";

export default async (req, res) => {
  res.setHeader("Content-Type", "application/json");

  const { uid } = req.query;
  const { url, description, tags, hash } = JSON.parse(req.body);

  const encodedUrl = encodeURI(url);
  const encodedDescription = encodeURI(description);
  const encodedTags = encodeURI(tags);

  const token = await getPinboardToken({ uid });

  const pinboardAdd = await fetch(
    pinboardEndpoint(
      "posts/add",
      token,
      `url=${encodedUrl}&description=${encodedDescription}&tags=${encodedTags}`
    )
  );

  const { result_code } = await pinboardAdd.json();

  const isError = result_code !== "done";

  if (isError) {
    console.log("==> Something failed updating the post");
  } else {
    console.log("==> Succesfully updated the post");
    db.collection(`${USERS_COLLECTION}/${uid}/${POSTS_COLLECTION}`)
      .doc(hash)
      .set({ toread: "no" }, { merge: true });
  }

  res.status(200).end(
    JSON.stringify({
      data: result_code,
      ...(isError ? { error: true } : {})
    })
  );
};
