import fetch from "isomorphic-unfetch";
import { db } from "../firebase-admin";
import { getPinboardToken, getSyncPending, pinboardEndpoint } from "./helpers";
import { USERS_COLLECTION, POSTS_COLLECTION } from "../constants";
import { Post, PublicPost, UID } from "../typings";

const setLastUpdate = ({
  uid,
  lastPinboardUpdate
}: {
  uid: UID;
  lastPinboardUpdate: Date;
}): void => {
  db.doc(`${USERS_COLLECTION}/${uid}`).set(
    { lastUpdate: lastPinboardUpdate },
    { merge: true }
  );
};

const fetchLastUpdate = async ({
  pinboardToken
}: {
  pinboardToken: string;
}): Promise<Date> => {
  const res = await fetch(pinboardEndpoint("posts/update", pinboardToken));
  const lastUpdate = await res.json();

  const updateDateTime = new Date(lastUpdate.update_time);

  return updateDateTime;
};

const fetchPosts = async ({
  pinboardToken
}: {
  pinboardToken: string;
}): Promise<Post[]> => {
  console.log("--> Fetch Pinboard");
  const res = await fetch(pinboardEndpoint("posts/all", pinboardToken));
  const allPosts = await res.json();
  const unreadPosts = allPosts.reduce((acc: Post[], current) => {
    if (current.toread === "yes") {
      return [...acc, { ...current }];
    }
    return acc;
  }, []);
  const sortedUnreadPosts = [...unreadPosts].reverse();

  return sortedUnreadPosts;
};

const getDbPosts = async ({
  uid,
  toread
}: {
  uid: UID;
  toread: "yes" | "no";
}): Promise<PublicPost[]> => {
  console.log("--> Get posts from Firebase");

  const postsQuery = await db
    .collection(`${USERS_COLLECTION}/${uid}/${POSTS_COLLECTION}`)
    .where("toread", "==", toread)
    .orderBy("time", "asc")
    .get();

  return postsQuery.docs.map(post => {
    const postData = post.data();

    return {
      id: postData.id,
      href: postData.href,
      description: postData.description,
      tags: postData.tags,
      time: postData.time,
      extended: postData.extended,
      deleted: postData.deleted,
      updated: postData.updated
    };
  });
};

const updatePosts = async ({
  posts,
  uid
}: {
  posts: Post[];
  uid: UID;
}): Promise<void> => {
  console.log("--> Write posts to DB");
  const batch = db.batch();

  posts.forEach(post => {
    const postsDoc = db
      .collection(`${USERS_COLLECTION}/${uid}/${POSTS_COLLECTION}`)
      .doc(post.hash);
    batch.set(postsDoc, { ...post, id: post.hash }, { merge: true });
  });

  await batch.commit();

  return;
};

const posts = async (
  _,
  { toread = "yes" as const, fetchFromPinboard = false },
  { uid }
) => {
  let storedPosts = await getDbPosts({ uid, toread });

  const pinboardToken = await getPinboardToken(uid);
  const lastPinboardUpdate = await fetchLastUpdate({ pinboardToken });
  const syncPending = await getSyncPending(uid);

  if ((!storedPosts.length || fetchFromPinboard) && syncPending) {
    setLastUpdate({ uid, lastPinboardUpdate });
    const data = await fetchPosts({ pinboardToken });
    await updatePosts({ posts: data, uid });

    storedPosts = await getDbPosts({ uid, toread });
  }

  return storedPosts;
};

export { posts };
