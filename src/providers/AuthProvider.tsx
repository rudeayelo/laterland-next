import React, { useContext, useEffect, useReducer, useRef } from "react";
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

const AuthProvider = ({ children }) => {
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
        console.warn("--> Error getting the userToken from Firebase:", error);
      });
  };

  useEffect(() => {
    firebase.auth().onAuthStateChanged(fbUser => {
      if (fbUser && !userLoggedIn.current) {
        setUserSignedIn();
      }
    });

    firebase
      .auth()
      .getRedirectResult()
      .then(({ user: fbUser }) => {
        if (fbUser && !userLoggedIn.current) {
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

const useAuth = () => {
  const { user, setSignedOut } = useContext(UserContext);

  const authProvider = new firebase.auth.GoogleAuthProvider();

  const signin = () => {
    firebase.auth().signInWithRedirect(authProvider);
  };

  const signout = () => {
    firebase
      .auth()
      .signOut()
      .then(function() {
        setSignedOut();
      })
      .catch(error => {
        console.warn("--> Error signing out the user:", error);
      });
  };

  return { user, signin, signout };
};

export { AuthProvider, useAuth };
