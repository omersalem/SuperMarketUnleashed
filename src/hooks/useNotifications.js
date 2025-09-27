import { useMemo, useState } from "react";

export const useNotifications = (products = [], checks = []) => {
  const [readNotifications, setReadNotifications] = useState([]);

  const notifications = useMemo(() => {
    const generated = [];

    // 1. Low stock notifications
    (products || []).forEach((product) => {
      if (product.quantity > 0 && product.quantity <= 10) {
        generated.push({
          id: `low-stock-${product.id}`,
          type: "warning",
          title: "Low Stock Alert",
          message: `${product.name} is running low (${product.quantity} left).`,
          timestamp: new Date(),
        });
      }
    });

    // 2. Pending checks notifications
    (checks || []).forEach((check) => {
      if (check.status === "pending") {
        generated.push({
          id: `pending-check-${check.id}`,
          type: "info",
          title: "Pending Check",
          message: `Check #${check.checkNumber} for ${check.payee} is pending.`,
          timestamp: new Date(check.date),
        });
      }
    });

    // Sort by timestamp, newest first
    return generated.sort((a, b) => b.timestamp - a.timestamp);
  }, [products, checks]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !readNotifications.includes(n.id)).length,
    [notifications, readNotifications]
  );

  return { notifications, unreadCount, setReadNotifications };
};
