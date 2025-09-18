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

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        try {
          setCurrentUser(user);
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

  const login = async (email, password, role) => {
    try {
      const user = await signIn(email, password);
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
