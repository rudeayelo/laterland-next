import fetch from "isomorphic-unfetch";
import {
  getPinboardToken,
  pinboardEndpoint,
  verifyUserIdToken
} from "../../helpers";

export default async (req, res) => {
  const { userToken, url } = JSON.parse(req.body);

  const uid = await verifyUserIdToken(userToken);

  const token = await getPinboardToken({ uid });

  const suggestedTags = await fetch(
    pinboardEndpoint("posts/suggest", token, `url=${url}`)
  );

  const [{ popular }, { recommended }] = await suggestedTags.json();

  // Remove duplicates
  const suggestedTagsSet = new Set([...popular, ...recommended]);

  console.log("==> Return popular and recommended tags from Pinboard");
  res.setHeader("Content-Type", "application/json");
  res.status(200).end(JSON.stringify(suggestedTagsSet));
};
