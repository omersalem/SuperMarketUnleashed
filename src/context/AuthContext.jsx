import React, { createContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { handleFirebaseError, logError } from "../utils/errorHandling";
import LoadingSpinner from "../components/LoadingSpinner";
import { signIn, signOut } from "../firebase/auth";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to determine user role based on email
  const determineUserRole = (userEmail) => {
    // List of admin emails - add more emails here to grant admin access
    const adminEmails = [
      "omersalem2008@gmail.com",
      // "another-admin@example.com",  // Uncomment and add more admin emails as needed
      // "third-admin@example.com",
    ];

    if (adminEmails.includes(userEmail)) {
      return "admin";
    }
    return "user"; // All other users get readonly access
  };

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        try {
          setCurrentUser(user);
          if (user) {
            // Automatically determine role based on email
            const role = determineUserRole(user.email);
            setUserRole(role);
          } else {
            setUserRole(null);
          }
          setError(null); // Clear any previous errors
          setLoading(false);
        } catch (err) {
          const handledError = handleFirebaseError(err);
          logError(handledError, {
            context: "AuthContext - onAuthStateChanged",
          });
          setError(handledError.message);
          setLoading(false);
        }
      },
      (authError) => {
        // Handle authentication errors
        const handledError = handleFirebaseError(authError);
        logError(handledError, {
          context: "AuthContext - authentication error",
        });
        setError(handledError.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      const user = await signIn(email, password);
      // Automatically determine role based on email
      const role = determineUserRole(email);
      setCurrentUser(user);
      setUserRole(role);
      setError(null);
      return { user, role };
    } catch (err) {
      const handledError = handleFirebaseError(err);
      logError(handledError, {
        context: "AuthContext - login",
      });
      setError(handledError.message);
      throw handledError;
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setCurrentUser(null);
      setUserRole(null);
      setError(null);
    } catch (err) {
      const handledError = handleFirebaseError(err);
      logError(handledError, {
        context: "AuthContext - logout",
      });
      setError(handledError.message);
    }
  };

  const value = {
    currentUser,
    userRole,
    loading,
    error,
    login,
    logout,
    clearError: () => setError(null),
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner
              size="large"
              color="blue"
              text="Initializing application..."
            />
            <div className="mt-4 text-sm text-gray-400">
              Setting up authentication and loading your data
            </div>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
