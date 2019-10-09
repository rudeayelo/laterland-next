import fetch from "isomorphic-unfetch";
import { getPinboardToken, pinboardEndpoint } from "../../helpers";

export default async (req, res) => {
  res.setHeader("Content-Type", "application/json");

  const { url, uid, dt } = req.query;

  const encodedUrl = encodeURI(url);

  const token = await getPinboardToken({ uid });

  const pinboardPost = await fetch(
    pinboardEndpoint("posts/get", token, `url=${encodedUrl}`)
  );

  const { posts } = await pinboardPost.json();

  if (!posts.length) {
    const pinboardFallbackPosts = await fetch(
      pinboardEndpoint("posts/get", token, `dt=${dt}`)
    );

    const { posts: fallbackPosts } = await pinboardFallbackPosts.json();

    console.log("==> More than one post found for the query");
    console.log(fallbackPosts);

    const unreads = fallbackPosts.filter(post => post.toread === "yes");

    console.log("==> Responding with the first entry from the unread ones");
    res.status(200).end(JSON.stringify(unreads[0]));
  }

  console.log("==> Return post from Pinboard");
  res.status(200).end(JSON.stringify(posts[0]));
};
