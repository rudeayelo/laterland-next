import { getUserDoc } from "./helpers";

const checkpoint = async (_, __, {uid}): Promise<string> => {
  console.log("==> Getting checkpoint");
  const userDoc = await getUserDoc(uid);

  return userDoc?.data().checkpoint;
};

export { checkpoint };
