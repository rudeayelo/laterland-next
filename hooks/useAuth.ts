import { useContext, useEffect, useRef, useState } from "react";
import firebase from "../firebase";
import { UserContext } from "../components";

const useAuth = () => {
  const { user, setId, setSignedIn, setSignedOut } = useContext(UserContext);
  const userLoggedIn = useRef(null);

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
        setId(null);
      })
      .catch(error => {
        console.warn("==> Error signing out the user:", error);
      });
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

  return { user, signin, signout };
};

export { useAuth };
