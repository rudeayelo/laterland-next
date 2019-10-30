import { getUserDoc } from "./helpers";

const checkpoint = async (_, __, {uid}): Promise<string> => {
  const userDoc = await getUserDoc(uid);

  return userDoc?.data().checkpoint;
};

export { checkpoint };
