import React, { useReducer, useEffect, useRef } from "react";
import firebase, { db } from "../firebase-client";
import { USERS_COLLECTION } from "../constants";

type User = {
  userToken: string;
  isSignedIn: boolean;
  pinboardToken: string;
  isLoading: boolean;
};

type UserContext = {
  user: User | null;
  setPinboardToken(pinboardToken: string | null): void;
  setSignedIn(userToken: string): void;
  setSignedOut(): void;
};

export const UserContext = React.createContext<UserContext>({
  user: null,
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

  const setSignedIn = (userToken: string) =>
    dispatch({ userToken, isSignedIn: true, isLoading: false });

  const setSignedOut = () =>
    dispatch({ userToken: null, isSignedIn: false, isLoading: false });

  const setPinboardToken = pinboardToken => {
    db.doc(`${USERS_COLLECTION}/${user.userToken}`).set(
      { pinboardToken },
      { merge: true }
    );

    dispatch({ pinboardToken });
  };

  const setUserSignedIn = () => {
    firebase
      .auth()
      .currentUser.getIdToken(true)
      .then(idToken => {
        setSignedIn(idToken);
        userLoggedIn.current = true;
      })
      .catch(error => {
        console.warn("==> Error getting the userToken from Firebase:", error);
      });
  };

  useEffect(() => {
    firebase.auth().onAuthStateChanged(fbUser => {
      if (fbUser && !userLoggedIn.current) {
        console.log("==> Setting userToken through onAuthStateChanged");
        setUserSignedIn();
      }
    });

    firebase
      .auth()
      .getRedirectResult()
      .then(({ user: fbUser }) => {
        if (fbUser && !userLoggedIn.current) {
          console.log("==> Setting userToken through getRedirectResult");
          setUserSignedIn();
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
        setPinboardToken,
        setSignedIn,
        setSignedOut
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export { UserProvider };
