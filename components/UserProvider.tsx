import React, { useReducer } from "react";
import { db } from "../firebase";
import { USERS_COLLECTION } from "../constants";

type User = {
  uid: string;
  isSignedIn: boolean;
  pinboardToken: string;
};

type UserContext = {
  user: User | null;
  setId(uid: string | null): void;
  setPinboardToken(pinboardToken: string | null): void;
  setSignedIn(): void;
  setSignedOut(): void;
};

export const UserContext = React.createContext<UserContext>({
  user: null,
  setId: (uid: string) => {
    throw new Error("setId() not implemented");
  },
  setPinboardToken: (pinboardToken: string) => {
    throw new Error("setPinboardToken() not implemented");
  },
  setSignedIn: () => {
    throw new Error("setSignedIn() not implemented");
  },
  setSignedOut: () => {
    throw new Error("setSignedOut() not implemented");
  }
});

const userReducer = (state, action) => ({ ...state, ...action });

const UserProvider = ({ children }) => {
  const [user, dispatch] = useReducer(userReducer, {});

  const setSignedIn = () => dispatch({ isSignedIn: true });
  const setSignedOut = () => dispatch({ isSignedIn: false });
  const setId = uid => dispatch({ uid });
  const setPinboardToken = pinboardToken => {
    db.doc(`${USERS_COLLECTION}/${user.uid}`).set(
      { pinboardToken },
      { merge: true }
    );

    dispatch({ pinboardToken });
  };

  return (
    <UserContext.Provider
      value={{ user, setId, setPinboardToken, setSignedIn, setSignedOut }}
    >
      {children}
    </UserContext.Provider>
  );
};

export { UserProvider };
