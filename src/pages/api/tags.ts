import fetch from "isomorphic-unfetch";
import {
  getPinboardToken,
  pinboardEndpoint,
  verifyUserIdToken
} from "../../helpers";

export default async (req, res) => {
  const { userToken } = JSON.parse(req.body);

  const uid = await verifyUserIdToken(userToken);

  const pinboardToken = await getPinboardToken({ uid });

  const pinboardTags = await fetch(pinboardEndpoint("tags/get", pinboardToken));

  const tags = await pinboardTags.json();

  res.setHeader("Content-Type", "application/json");
  res.status(200).end(JSON.stringify(tags));
};
