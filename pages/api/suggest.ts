import fetch from "isomorphic-unfetch";
import { getPinboardToken, pinboardEndpoint } from "../../helpers";

export default async (req, res) => {
  res.setHeader("Content-Type", "application/json");

  const { url, uid } = req.query;

  const token = await getPinboardToken({ uid });

  const suggestedTags = await fetch(
    pinboardEndpoint("posts/suggest", token, `url=${url}`)
  );

  const [{ popular }, { recommended }] = await suggestedTags.json();

  // Remove duplicates
  const suggestedTagsSet = new Set([...popular, ...recommended]);

  console.log("==> Return popular and recommended tags from Pinboard");
  res.status(200).end(JSON.stringify(suggestedTagsSet));
};
