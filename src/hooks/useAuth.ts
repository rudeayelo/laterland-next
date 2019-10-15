import { useContext, useState } from "react";
import firebase from "../firebase-client";
import { UserContext } from "../components";

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
        console.warn("==> Error signing out the user:", error);
      });
  };

  return { user, signin, signout };
};

export { useAuth };
