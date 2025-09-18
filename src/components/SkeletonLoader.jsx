import React from "react";

/**
 * Base Skeleton Component
 */
const Skeleton = ({ className = "", width = "w-full", height = "h-4" }) => {
  return (
    <div
      className={`
        bg-gray-300 dark:bg-gray-600 rounded animate-pulse
        ${width} ${height} ${className}
      `}
    />
  );
};

/**
 * Table Row Skeleton for loading table data
 */
export const TableRowSkeleton = ({ columns = 4, className = "" }) => {
  return (
    <tr className={`border-b border-gray-700 ${className}`}>
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="py-2 px-4">
          <Skeleton height="h-4" />
        </td>
      ))}
    </tr>
  );
};

/**
 * Table Skeleton for loading entire tables
 */
export const TableSkeleton = ({
  rows = 5,
  columns = 4,
  headers = [],
  className = "",
}) => {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full bg-gray-800">
        {headers.length > 0 && (
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="py-2 px-4 border-b border-gray-700 text-left"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRowSkeleton key={rowIndex} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Card Skeleton for loading card components
 */
export const CardSkeleton = ({ className = "" }) => {
  return (
    <div className={`bg-gray-800 p-6 rounded-lg shadow-lg ${className}`}>
      <div className="space-y-4">
        <Skeleton height="h-6" width="w-3/4" />
        <Skeleton height="h-4" width="w-full" />
        <Skeleton height="h-4" width="w-5/6" />
        <div className="flex space-x-2 mt-4">
          <Skeleton height="h-8" width="w-20" />
          <Skeleton height="h-8" width="w-20" />
        </div>
      </div>
    </div>
  );
};

/**
 * Dashboard Stats Skeleton
 */
export const StatsSkeleton = ({ count = 4, className = "" }) => {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${count} gap-4 ${className}`}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-gray-800 p-4 rounded-lg">
          <Skeleton height="h-4" width="w-1/2" className="mb-2" />
          <Skeleton height="h-8" width="w-3/4" />
        </div>
      ))}
    </div>
  );
};

/**
 * Form Skeleton for loading forms
 */
export const FormSkeleton = ({ fields = 3, className = "" }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton height="h-4" width="w-1/4" />
          <Skeleton height="h-10" width="w-full" />
        </div>
      ))}
      <div className="flex space-x-2 mt-6">
        <Skeleton height="h-10" width="w-20" />
        <Skeleton height="h-10" width="w-20" />
      </div>
    </div>
  );
};

/**
 * List Item Skeleton
 */
export const ListItemSkeleton = ({ withAvatar = false, className = "" }) => {
  return (
    <div className={`flex items-center space-x-3 p-3 ${className}`}>
      {withAvatar && (
        <Skeleton width="w-10" height="h-10" className="rounded-full" />
      )}
      <div className="flex-1 space-y-2">
        <Skeleton height="h-4" width="w-3/4" />
        <Skeleton height="h-3" width="w-1/2" />
      </div>
    </div>
  );
};

/**
 * Content Loading Skeleton with customizable layout
 */
export const ContentSkeleton = ({
  lines = 3,
  title = true,
  paragraph = true,
  className = "",
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {title && <Skeleton height="h-6" width="w-1/2" />}
      {paragraph && (
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, index) => (
            <Skeleton
              key={index}
              height="h-4"
              width={index === lines - 1 ? "w-3/4" : "w-full"}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Navigation Skeleton
 */
export const NavigationSkeleton = ({ items = 6, className = "" }) => {
  return (
    <nav className={`space-y-2 ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <Skeleton key={index} height="h-8" width="w-full" className="rounded" />
      ))}
    </nav>
  );
};

export default Skeleton;
