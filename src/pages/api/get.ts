import fetch from "isomorphic-unfetch";
import {
  getPinboardToken,
  pinboardEndpoint,
  verifyUserIdToken
} from "../../helpers";

export default async (req, res) => {
  const { userToken, url, dt } = JSON.parse(req.body);

  const uid = await verifyUserIdToken(userToken);

  const encodedUrl = encodeURI(url);

  const pinboardToken = await getPinboardToken({ uid });

  const pinboardPost = await fetch(
    pinboardEndpoint("posts/get", pinboardToken, `url=${encodedUrl}`)
  );

  const { posts } = await pinboardPost.json();

  let post;

  if (!posts.length) {
    const pinboardFallbackPosts = await fetch(
      pinboardEndpoint("posts/get", pinboardToken, `dt=${dt}`)
    );

    const { posts: fallbackPosts } = await pinboardFallbackPosts.json();

    console.log("==> More than one post found for the query");
    console.log(fallbackPosts);

    const unreads = fallbackPosts.filter(post => post.toread === "yes");

    console.log("==> Responding with the first entry from the unread ones");
    post = unreads[0];
  } else {
    console.log("==> Return post from Pinboard");
    post = posts[0];
  }

  res.setHeader("Content-Type", "application/json");
  res.status(200).end(JSON.stringify(post));
};
