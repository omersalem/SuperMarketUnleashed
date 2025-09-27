import React, { useState, useRef, useEffect, useCallback } from "react";

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
  const containerRef = useRef(null);
  const firstItemRef = useRef(null);

  // Toggle menu on button click
  const toggleMenu = useCallback(() => setIsOpen((v) => !v), []);

  // Close on outside click
  useEffect(() => {
    const onDocClick = (e) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Keyboard support: Esc to close, ArrowDown to focus first item
  const onButtonKeyDown = (e) => {
    if (e.key === "Escape") setIsOpen(false);
    if (e.key === "ArrowDown") {
      setIsOpen(true);
      setTimeout(() => firstItemRef.current?.focus(), 0);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={toggleMenu}
        onKeyDown={onButtonKeyDown}
        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
      >
        <span>Actions</span>
        <span className="text-xs">▼</span>
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Actions"
          className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-xl py-2 z-[1001] border border-gray-700"
        >
          {menuItems.map((item, idx) => (
            <a
              key={item.href}
              href={item.href}
              role="menuitem"
              ref={idx === 0 ? firstItemRef : undefined}
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-150 focus:outline-none focus:bg-gray-700"
              tabIndex={0}
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
