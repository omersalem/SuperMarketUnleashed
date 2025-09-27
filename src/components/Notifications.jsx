import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";

const NotificationItem = ({ notification }) => {
  const icons = {
    warning: "⚠️",
    info: "ℹ️",
    success: "✅",
  };

  return (
    <div className="flex items-start p-3 hover:bg-gray-700 transition-colors duration-200 border-b border-gray-700 last:border-b-0">
      <div className="text-lg mr-3">{icons[notification.type] || "🔔"}</div>
      <div>
        <p className="text-sm font-semibold text-gray-200">
          {notification.title}
        </p>
        <p className="text-xs text-gray-400">{notification.message}</p>
        <p className="text-xs text-gray-500 mt-1">
          {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
        </p>
      </div>
    </div>
  );
};

const Notifications = ({
  notifications,
  unreadCount,
  setReadNotifications,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Mark all as read when opening
      setReadNotifications(notifications.map((n) => n.id));
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
        title="Notifications"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-white text-xs items-center justify-center">
              {unreadCount}
            </span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50 animate-fade-in-up">
          <div className="p-3 flex justify-between items-center border-b border-gray-700">
            <h4 className="font-bold text-white">Notifications</h4>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              &times;
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <NotificationItem key={n.id} notification={n} />
              ))
            ) : (
              <p className="text-center text-gray-500 p-6 text-sm">
                You have no new notifications.
              </p>
            )}
          </div>
          {notifications.length > 0 && (
            <div className="p-2 text-center border-t border-gray-700">
              <span className="text-xs text-gray-500">
                End of notifications
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;
