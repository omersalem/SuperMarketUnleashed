import React, { useState, useEffect } from "react";

const ResponsiveTable = ({
  data = [],
  columns = [],
  className = "",
  mobileCardComponent: MobileCard,
  loading = false,
  emptyMessage = "No data available",
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // More aggressive mobile detection
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-700 rounded mb-4"></div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-700 rounded mb-2"></div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  // Force mobile card layout for better responsive experience
  if (isMobile && MobileCard) {
    return (
      <div className="space-y-3 lg:hidden">
        {data.map((item, index) => (
          <MobileCard key={item.id || index} item={item} index={index} />
        ))}
      </div>
    );
  }

  // Fallback mobile view without custom cards
  if (isMobile && !MobileCard) {
    return (
      <div className="lg:hidden">
        <div className="space-y-4">
          {data.map((item, index) => (
            <div
              key={item.id || index}
              className="bg-gray-700 rounded-lg p-4 border border-gray-600"
            >
              {columns.map((column, colIndex) => (
                <div
                  key={colIndex}
                  className="flex justify-between items-center py-1 border-b border-gray-600 last:border-b-0"
                >
                  <span className="text-sm text-gray-400 font-medium">
                    {column.header}:
                  </span>
                  <span className="text-sm text-white text-right max-w-xs truncate">
                    {column.render
                      ? column.render(item, index)
                      : item[column.key]}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Desktop table layout - only show on large screens
  return (
    <div className={`overflow-x-auto hidden lg:block ${className}`}>
      <table className="min-w-full bg-gray-800">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className={`py-3 px-4 border-b border-gray-700 text-left font-medium text-gray-300 ${
                  column.className || ""
                }`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, rowIndex) => (
            <tr
              key={item.id || rowIndex}
              className="hover:bg-gray-700 transition-colors"
            >
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className={`py-3 px-4 border-b border-gray-700 ${
                    column.cellClassName || ""
                  }`}
                >
                  {column.render
                    ? column.render(item, rowIndex)
                    : item[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Higher-order component for creating mobile card layouts
export const createMobileCard = (CardComponent) => {
  return ({ item, index }) => (
    <div className="bg-gray-700 rounded-lg p-4 shadow-sm border border-gray-600">
      <CardComponent item={item} index={index} />
    </div>
  );
};

// Generic mobile card component
export const GenericMobileCard = createMobileCard(({ item, fields = [] }) => (
  <div className="space-y-2">
    {fields.map((field, index) => (
      <div key={index} className="flex justify-between items-center">
        <span className="text-sm text-gray-400 font-medium">
          {field.label}:
        </span>
        <span className="text-sm text-white">
          {field.render ? field.render(item) : item[field.key]}
        </span>
      </div>
    ))}
  </div>
));

export default ResponsiveTable;
