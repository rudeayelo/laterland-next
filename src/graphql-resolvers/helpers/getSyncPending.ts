import fetch from "isomorphic-unfetch";
import differenceInMinutes from "date-fns/differenceInMinutes";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import { db } from "../../firebase-admin";
import { getPinboardToken, pinboardEndpoint } from ".";
import { USERS_COLLECTION } from "../../constants";
import { UID } from "../../typings";

const NOW = new Date();

const canFetchPostsFromPinboard = (
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

const getSyncPending = async (uid: UID): Promise<boolean> => {
  const pinboardToken = await getPinboardToken(uid);
  const userDoc = await db.doc(`${USERS_COLLECTION}/${uid}`).get();
  const lastPinboardUpdate = await fetchLastUpdate({ pinboardToken });
  const lastStoredUpdateDoc = userDoc && userDoc.data().lastUpdate;
  const lastStoredUpdate = new Date(
    parseInt(lastStoredUpdateDoc.seconds, 10) * 1000
  );

  const syncPending = canFetchPostsFromPinboard(
    lastPinboardUpdate,
    lastStoredUpdate
  );

  return syncPending;
};

export { getSyncPending };
