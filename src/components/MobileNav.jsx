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
    { href: "#budget", label: "💰 Budget", color: "violet" },
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
        {navigationItems.slice(0, 7).map(
          (
            item // Show first 7 items including budget
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
                  : item.color === "violet"
                  ? "bg-violet-600 hover:bg-violet-700"
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
          ></span>
          <span
            className={`block w-6 h-0.5 bg-white transition-opacity duration-300 ${
              isOpen ? "opacity-0" : "opacity-100"
            }`}
          ></span>
          <span
            className={`block w-6 h-0.5 bg-white transition-transform duration-300 ${
              isOpen ? "-rotate-45 -translate-y-1.5" : ""
            }`}
          ></span>
        </div>
      </button>

      {/* Mobile navigation menu */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-gray-900 bg-opacity-95 flex flex-col">
          {/* User info and logout */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                  {currentUser?.email?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <p className="text-white font-medium">
                    {currentUser?.email || "Not logged in"}
                  </p>
                  <p className={`text-xs font-medium ${
                    userRole === "admin"
                      ? "bg-red-600 text-white"
                      : "bg-green-600 text-white"
                  }`}>
                    {userRole === "admin" ? "Admin" : "Read-Only"}
                  </p>
                </div>
              </div>
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
                    : item.color === "violet"
                    ? "bg-violet-600 hover:bg-violet-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Logout button */}
          <div className="mt-auto p-4 border-t border-gray-700">
            <button
              onClick={logout}
              className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileNav;
