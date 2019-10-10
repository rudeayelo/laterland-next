import React, { useReducer, useEffect, useRef, useState } from "react";
import firebase, { db } from "../firebase";
import { USERS_COLLECTION } from "../constants";

type User = {
  uid: string;
  isSignedIn: boolean;
  pinboardToken: string;
};

type UserContext = {
  user: User | null;
  userLoading: boolean;
  setId(uid: string | null): void;
  setPinboardToken(pinboardToken: string | null): void;
  setSignedIn(): void;
  setSignedOut(): void;
};

export const UserContext = React.createContext<UserContext>({
  user: null,
  userLoading: true,
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
  const userLoggedIn = useRef(null);
  const [userLoading, setUserLoading] = useState(true);

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

  const setUserSignedIn = (uid: string) => {
    setId(uid);
    setSignedIn();
    userLoggedIn.current = true;
  };

  useEffect(() => {
    firebase.auth().onAuthStateChanged(fbUser => {
      if (fbUser && !userLoggedIn.current) {
        console.log("==> Setting uid through onAuthStateChanged");
        setUserSignedIn(fbUser.uid);
        setUserLoading(false);
        return;
      }
    });

    firebase
      .auth()
      .getRedirectResult()
      .then(({ user: fbUser }) => {
        if (fbUser) {
          console.log("==> Setting uid through getRedirectResult");
          setUserSignedIn(fbUser.uid);
          setUserLoading(false);
          return;
        }
      })
      .catch(({ code, email, message }) => {
        console.warn(
          `==> Error ${code} signing in the user "${email}":`,
          message
        );
      });
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        setId,
        setPinboardToken,
        setSignedIn,
        setSignedOut,
        userLoading
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export { UserProvider };
