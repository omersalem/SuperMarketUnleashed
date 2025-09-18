import React from "react";

const MobileWrapper = ({ children, title, className = "" }) => {
  return (
    <div
      className={`bg-gray-800 p-3 sm:p-6 rounded-lg shadow-lg mt-4 sm:mt-8 max-w-full overflow-hidden ${className}`}
    >
      {title && (
        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white">
          {title}
        </h2>
      )}
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
};

export default MobileWrapper;
