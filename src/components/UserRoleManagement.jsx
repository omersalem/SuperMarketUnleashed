import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { updateUserRole } from "../firebase/firestore";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";
import { SectionLoadingSpinner } from "./LoadingSpinner";
import { handleFirebaseError, logError } from "../utils/errorHandling";

const UserRoleManagement = () => {
  const { currentUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null); // Tracks which user is being updated
  const [pendingChanges, setPendingChanges] = useState({}); // Tracks pending role changes
  const [showAddUserGuide, setShowAddUserGuide] = useState(false);

  useEffect(() => {
    setLoading(true);
    const usersCollectionRef = collection(db, "users");

    // Set up a real-time listener for the users collection
    const unsubscribe = onSnapshot(
      usersCollectionRef,
      (snapshot) => {
        const allUsers = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(allUsers);
        setLoading(false);
      },
      (err) => {
        const handledError = handleFirebaseError(err);
        logError(handledError, { context: "UserRoleManagement - onSnapshot" });
        setError(handledError.message);
        setLoading(false);
      }
    );

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  const handlePendingChange = (userId, newRole) => {
    setPendingChanges((prev) => ({ ...prev, [userId]: newRole }));
  };

  const cancelChange = (userId) => {
    const newPendingChanges = { ...pendingChanges };
    delete newPendingChanges[userId];
    setPendingChanges(newPendingChanges);
  };

  const confirmRoleChange = async (userId) => {
    if (userId === currentUser.uid) {
      alert("Error: You cannot change your own role.");
      return;
    }

    setUpdating(userId);
    const newRole = pendingChanges[userId];
    try {
      await updateUserRole(userId, newRole);
      // Update local state and clear pending change
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
      cancelChange(userId); // Clear the pending change
    } catch (err) {
      const handledError = handleFirebaseError(err);
      logError(handledError, {
        context: "UserRoleManagement - confirmRoleChange",
      });
      alert(`Failed to update role: ${handledError.message}`);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return <SectionLoadingSpinner message="Loading user roles..." />;
  }

  if (error) {
    return <p className="text-red-500">Error loading users: {error}</p>;
  }

  return (
    <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 text-gray-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h2 className="text-2xl font-bold text-white mb-2 sm:mb-0">
          User Role Management
        </h2>
        <button
          onClick={() => setShowAddUserGuide(!showAddUserGuide)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
        >
          {showAddUserGuide ? "Hide Guide" : "➕ Add New User"}
        </button>
      </div>

      {showAddUserGuide && (
        <div className="bg-blue-900/20 border border-blue-700 text-blue-300 p-4 rounded-lg mb-6 text-sm">
          <h4 className="font-bold mb-2">How to Add a New User:</h4>
          <ol className="list-decimal list-inside space-y-2">
            <li>
              Go to your project's{" "}
              <a
                href="https://console.firebase.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline hover:text-blue-600"
              >
                Firebase Console
              </a>
              .
            </li>
            <li>
              Navigate to the **Authentication** section and add a new user with
              their email and a temporary password.
            </li>
            <li>Once created, the new user will appear in the table below.</li>
            <li>You can then assign them the 'Admin' or 'User' role here.</li>
          </ol>
        </div>
      )}

      <div className="overflow-x-auto border-t border-gray-700 pt-4">
        <table className="min-w-full">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                User Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                Current Role
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {users.map((user) => (
              <tr
                key={user.id}
                className={`hover:bg-gray-800/50 ${
                  pendingChanges[user.id] &&
                  pendingChanges[user.id] !== user.role
                    ? "bg-yellow-900/20"
                    : ""
                }`}
              >
                <td className="px-6 py-4 text-sm text-gray-100">
                  {user.email}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === "admin"
                        ? "bg-red-500/20 text-red-300"
                        : "bg-green-500/20 text-green-300"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  {user.id === currentUser.uid ? (
                    <span className="text-xs text-gray-400">
                      Cannot change own role
                    </span>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <select
                        value={pendingChanges[user.id] || user.role}
                        onChange={(e) =>
                          handlePendingChange(user.id, e.target.value)
                        }
                        disabled={updating === user.id}
                        className="px-3 py-1 border border-gray-700 rounded-md text-sm text-gray-100 bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="user">User (Read-Only)</option>
                        <option value="admin">Admin (Full Access)</option>
                      </select>
                      {pendingChanges[user.id] &&
                        pendingChanges[user.id] !== user.role && (
                          <>
                            <button
                              onClick={() => confirmRoleChange(user.id)}
                              disabled={updating === user.id}
                              className="px-3 py-1 text-xs font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-500"
                            >
                              {updating === user.id ? "Saving..." : "Save"}
                            </button>
                            <button
                              onClick={() => cancelChange(user.id)}
                              disabled={updating === user.id}
                              className="px-3 py-1 text-xs font-semibold text-gray-200 bg-gray-700 rounded-md hover:bg-gray-600 disabled:bg-gray-600"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserRoleManagement;
