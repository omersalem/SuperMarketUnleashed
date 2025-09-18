import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const MobileNav = ({ userRole = "admin" }) => {
  const { logout, currentUser } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // Show mobile nav for tablets too
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const navigationItems = [
    { href: "#reports", label: "📊 Reports", color: "blue" },
    { href: "#customers", label: "👥 Customers", color: "green" },
    { href: "#vendors", label: "🏪 Vendors", color: "purple" },
    { href: "#categories", label: "📂 Categories", color: "yellow" },
    { href: "#products", label: "📦 Products", color: "red" },
    { href: "#sales", label: "💰 Sales", color: "indigo" },
    { href: "#payments", label: "💳 Payments", color: "pink" },
    { href: "#purchases", label: "🛒 Purchases", color: "teal" },
    { href: "#vendor-payments", label: "💸 Vendor Payments", color: "orange" },
    { href: "#invoices", label: "📄 Invoices", color: "cyan" },
    { href: "#checks", label: "📋 Checks", color: "lime" },
    { href: "#workers", label: "👷 Workers", color: "amber" },
    { href: "#inventory", label: "📊 Inventory", color: "emerald" },
  ];

  const handleNavClick = (href) => {
    setIsOpen(false);
    // Smooth scroll to section
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (!isMobile) {
    // Desktop navigation - only for large screens
    return (
      <div className="hidden xl:flex flex-wrap gap-2 max-w-2xl overflow-x-auto">
        {navigationItems.slice(0, 6).map(
          (
            item // Show only first 6 items
          ) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(item.href);
              }}
              className={`px-3 py-1 rounded text-sm transition-colors whitespace-nowrap ${
                item.color === "blue"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : item.color === "green"
                  ? "bg-green-600 hover:bg-green-700"
                  : item.color === "purple"
                  ? "bg-purple-600 hover:bg-purple-700"
                  : item.color === "yellow"
                  ? "bg-yellow-600 hover:bg-yellow-700"
                  : item.color === "red"
                  ? "bg-red-600 hover:bg-red-700"
                  : item.color === "indigo"
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : item.color === "pink"
                  ? "bg-pink-600 hover:bg-pink-700"
                  : item.color === "teal"
                  ? "bg-teal-600 hover:bg-teal-700"
                  : item.color === "orange"
                  ? "bg-orange-600 hover:bg-orange-700"
                  : item.color === "cyan"
                  ? "bg-cyan-600 hover:bg-cyan-700"
                  : item.color === "lime"
                  ? "bg-lime-600 hover:bg-lime-700"
                  : item.color === "amber"
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {item.label}
            </a>
          )
        )}
      </div>
    );
  }

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden p-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-shrink-0"
        aria-label="Toggle navigation menu"
      >
        <div className="w-6 h-6 flex flex-col justify-center space-y-1">
          <span
            className={`block w-6 h-0.5 bg-white transition-transform duration-300 ${
              isOpen ? "rotate-45 translate-y-1.5" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-white transition-opacity duration-300 ${
              isOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-white transition-transform duration-300 ${
              isOpen ? "-rotate-45 -translate-y-1.5" : ""
            }`}
          />
        </div>
      </button>

      {/* Mobile navigation overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Background overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsOpen(false)}
          />

          {/* Navigation menu */}
          <div className="fixed top-0 right-0 w-72 sm:w-80 h-full bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out overflow-y-auto">
            <div className="p-4">
              {/* Close button */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-white">Navigation</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Close navigation menu"
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* User info */}
              <div className="mb-4 p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between text-sm text-gray-300">
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-400">👤</span>
                    <span className="truncate">{currentUser?.email}</span>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      userRole === "admin"
                        ? "bg-red-600 text-white"
                        : "bg-green-600 text-white"
                    }`}
                  >
                    {userRole === "admin" ? "Admin" : "Read-Only"}
                  </span>
                </div>
              </div>

              {/* Navigation items */}
              <nav className="space-y-2">
                {navigationItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(item.href);
                    }}
                    className={`block px-4 py-3 rounded-lg text-white transition-colors duration-200 text-sm font-medium ${
                      item.color === "blue"
                        ? "bg-blue-600 hover:bg-blue-700"
                        : item.color === "green"
                        ? "bg-green-600 hover:bg-green-700"
                        : item.color === "purple"
                        ? "bg-purple-600 hover:bg-purple-700"
                        : item.color === "yellow"
                        ? "bg-yellow-600 hover:bg-yellow-700"
                        : item.color === "red"
                        ? "bg-red-600 hover:bg-red-700"
                        : item.color === "indigo"
                        ? "bg-indigo-600 hover:bg-indigo-700"
                        : item.color === "pink"
                        ? "bg-pink-600 hover:bg-pink-700"
                        : item.color === "teal"
                        ? "bg-teal-600 hover:bg-teal-700"
                        : item.color === "orange"
                        ? "bg-orange-600 hover:bg-orange-700"
                        : item.color === "cyan"
                        ? "bg-cyan-600 hover:bg-cyan-700"
                        : item.color === "lime"
                        ? "bg-lime-600 hover:bg-lime-700"
                        : item.color === "amber"
                        ? "bg-amber-600 hover:bg-amber-700"
                        : "bg-emerald-600 hover:bg-emerald-700"
                    }`}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>

              {/* Logout button */}
              <div className="mt-6 pt-4 border-t border-gray-600">
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg transition-colors duration-200 text-sm font-medium flex items-center justify-center space-x-2"
                >
                  <span>🚪</span>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileNav;
