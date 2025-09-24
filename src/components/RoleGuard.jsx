import React from "react";

// RoleGuard component to conditionally render elements based on user role
const RoleGuard = ({
  userRole,
  allowedRoles = ["admin"],
  children,
  fallback = null,
  hideOnDenial = true,
}) => {
  const hasPermission = allowedRoles.includes(userRole);
  if (!hasPermission) {
    return hideOnDenial ? fallback : null;
  }
  return children;
};

// Component to show role-based messages
export const RoleMessage = ({ userRole }) => {
  if (userRole === "user") {
    return (
      <div className="bg-blue-600/20 backdrop-blur-md border border-blue-500/30 rounded-xl p-4 mb-6">
        <div className="flex items-center space-x-2">
          <span className="text-blue-400">ℹ️</span>
          <span className="text-blue-300">
            You have read-only access. You can view all data but cannot make changes.
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export default RoleGuard;
