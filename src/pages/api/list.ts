import fetch from "isomorphic-unfetch";
import differenceInMinutes from "date-fns/differenceInMinutes";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import firebase, { db } from "../../firebase-admin";
import { getPinboardToken, pinboardEndpoint } from "../../helpers";
import { USERS_COLLECTION, POSTS_COLLECTION } from "../../constants";
import { Post, PublicPost, UID } from "../../typings";

const NOW = new Date();

const shouldFetchPostsFromPinboard = (
  lastPinboardUpdate: Date,
  lastStoredUpdate: Date
): boolean => {
  const dateDiffInMinutes = differenceInMinutes(NOW, lastStoredUpdate);

  console.log(
    `--> Last Pinboard update happened ${formatDistanceToNow(
      lastPinboardUpdate
    )} ago`
  );

  // Firebase is up to date if stored update and Pinboard update times are the same
  if (lastPinboardUpdate.getTime() === lastStoredUpdate.getTime()) return false;

  return dateDiffInMinutes >= 5;
};

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

const fetchLastUpdate = async ({ token }: { token: string }): Promise<Date> => {
  const res = await fetch(pinboardEndpoint("posts/update", token));
  const lastUpdate = await res.json();

  const updateDateTime = new Date(lastUpdate.update_time);

  return updateDateTime;
};

const fetchPosts = async ({ token }: { token: string }): Promise<Post[]> => {
  console.log("--> Fetch Pinboard");
  const res = await fetch(pinboardEndpoint("posts/all", token));
  const allPosts = await res.json();
  const unreadPosts = allPosts.reduce((acc: Post[], current) => {
    if (current.toread === "yes") {
      return [...acc, { ...current, source: "Pinboard" }];
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

  // TODO: trycatch, handle error
  const postsQuery = await db
    .collection(`${USERS_COLLECTION}/${uid}/${POSTS_COLLECTION}`)
    .where("toread", "==", toread)
    .orderBy("time", "asc")
    .get();

  return postsQuery.docs.map(post => {
    const postData = post.data();

    return {
      id: post.id,
      href: postData.href,
      description: postData.description,
      tags: postData.tags,
      time: postData.time,
      extended: postData.extended
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
    batch.set(postsDoc, post);
  });

  await batch.commit();

  return;
};

export default async (req, res) => {
  res.setHeader("Content-Type", "application/json");

  const { userToken, toread } = JSON.parse(req.body);

  const { uid } = await firebase.auth().verifyIdToken(userToken);

  const userDoc = await db.doc(`${USERS_COLLECTION}/${uid}`).get();
  const pinboardToken = await getPinboardToken({ uid });
  const lastPinboardUpdate = await fetchLastUpdate({ token: pinboardToken });
  const lastStoredUpdateDoc = userDoc && userDoc.data().lastUpdate;
  const lastStoredUpdate = new Date(
    parseInt(lastStoredUpdateDoc.seconds, 10) * 1000
  );

  if (shouldFetchPostsFromPinboard(lastPinboardUpdate, lastStoredUpdate)) {
    setLastUpdate({ uid, lastPinboardUpdate });
    const data = await fetchPosts({ token: pinboardToken });
    await updatePosts({ posts: data, uid });
  }

  const posts = await getDbPosts({ uid, toread });

  console.log("--> Return posts from Firebase");
  res.status(200).end(JSON.stringify(posts));
};
