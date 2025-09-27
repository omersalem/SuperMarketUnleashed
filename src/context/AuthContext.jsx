import React, { createContext, useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth, db } from "../firebase/config";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signup = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  useEffect(() => {
    // This is the main authentication state listener
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);

      if (!user) {
        // If no user is logged in, reset role and finish loading
        setUserRole(null);
        setLoading(false);
      }
      // If a user is logged in, the role listener below will handle setting the role and loading state.
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    let unsubscribeRole;

    if (currentUser) {
      // If a user is logged in, set up a REAL-TIME listener for their role.
      const userDocRef = doc(db, "users", currentUser.uid);

      unsubscribeRole = onSnapshot(
        userDocRef,
        async (docSnap) => {
          let finalRole = "user"; // Default to 'user'

          if (docSnap.exists()) {
            // If the user document exists, get their role
            finalRole = docSnap.data().role || "user";
          } else {
            // If the document doesn't exist (e.g., first-time sign-up), create it.
            // The master admin email is the ONLY one that gets 'admin' role on creation.
            const newRole =
              currentUser.email === "omersalem2008@gmail.com"
                ? "admin"
                : "user";
            await setDoc(userDocRef, {
              email: currentUser.email,
              role: newRole,
              createdAt: new Date(),
            });
            finalRole = newRole;
          }

          // Master override: The primary admin can never be demoted.
          if (currentUser.email === "omersalem2008@gmail.com") {
            finalRole = "admin";
          }

          setUserRole(finalRole);
          setLoading(false);
        },
        (error) => {
          console.error("Error listening to user role:", error);
          setLoading(false);
        }
      );
    }

    // Cleanup the role listener when the user changes or logs out
    return () => unsubscribeRole && unsubscribeRole();
  }, [currentUser]);

  const value = { currentUser, userRole, loading, login, signup, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
