import { getSyncPending } from "./helpers";

const syncPending = async (_, __, { uid }): Promise<boolean> =>
  await getSyncPending(uid);

export { syncPending };
