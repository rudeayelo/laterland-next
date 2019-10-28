import {getUserDoc} from './getUserDoc'

const getPinboardToken = async (uid) => {
  const userDoc = await getUserDoc(uid);

  return userDoc?.data().pinboardToken;
}

export { getPinboardToken }