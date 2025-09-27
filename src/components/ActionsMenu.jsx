import React, { useState } from "react";

const menuItems = [
  { href: "#overview", label: "📊 Overview" },
  { href: "#reports", label: "📄 Reports" },
  { href: "#customers", label: "👥 Customers" },
  { href: "#vendors", label: "🏪 Vendors" },
  { href: "#categories", label: "📂 Categories" },
  { href: "#products", label: "📦 Products" },
  { href: "#sales", label: "💰 Sales" },
  { href: "#payments", label: "💳 Payments" },
  { href: "#purchases", label: "🛒 Purchases" },
  { href: "#vendor-payments", label: "💸 Vendor Payments" },
  { href: "#user-roles", label: "👤 User Roles" },
  { href: "#invoices", label: "🧾 Invoices" },
  { href: "#checks", label: "🏦 Checks" },
  { href: "#workers", label: "👷 Workers" },
  { href: "#inventory", label: "📊 Inventory" },
  { href: "#budget", label: "💰 Budget" },
  { href: "#backup", label: "💾 Backup" },
];

const ActionsMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative" onMouseLeave={() => setIsOpen(false)}>
      <button
        onMouseEnter={() => setIsOpen(true)}
        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
      >
        <span>Actions</span>
        <span className="text-xs">▼</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl py-2 z-50 border border-gray-700">
          {menuItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActionsMenu;
