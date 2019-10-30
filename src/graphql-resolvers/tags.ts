import fetch from "isomorphic-unfetch";
import { getPinboardToken, pinboardEndpoint } from "./helpers";

const tags = async (_, { url }, { uid }) => {
  const token = await getPinboardToken(uid);

  if (url) {
    const suggestedTags = await fetch(
      pinboardEndpoint("posts/suggest", token, `url=${url}`)
    );

    const [{ popular }, { recommended }] = await suggestedTags.json();

    console.log("--> Return popular and recommended tags from Pinboard");
    return new Set([...popular, ...recommended]);
  }

  const pinboardTags = await fetch(pinboardEndpoint("tags/get", token));

  console.log("--> Return all tags");
  return Object.keys(await pinboardTags.json());
};

export { tags };
