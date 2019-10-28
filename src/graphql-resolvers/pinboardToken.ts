import { getPinboardToken } from "./helpers";

const pinboardToken = async (_, __, { uid }): Promise<string> =>
  await getPinboardToken(uid);

export { pinboardToken };
