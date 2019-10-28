import fetch from "isomorphic-unfetch";
import { pinboardEndpoint } from "../helpers";
import { getPinboardToken } from "./helpers";

const tags = async (_, { url }, { uid }) => {
  const token = await getPinboardToken(uid);

  if (url) {
    const suggestedTags = await fetch(
      pinboardEndpoint("posts/suggest", token, `url=${url}`)
    );

    const [{ popular }, { recommended }] = await suggestedTags.json();

    console.log("==> Return popular and recommended tags from Pinboard");
    return { tags: new Set([...popular, ...recommended]) };
  }

  const pinboardTags = await fetch(pinboardEndpoint("tags/get", token));

  console.log("==> Return all tags");
  return { tags: Object.keys(await pinboardTags.json()) };
};

export { tags };
