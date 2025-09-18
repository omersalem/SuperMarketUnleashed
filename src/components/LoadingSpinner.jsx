import React from "react";

/**
 * Loading Spinner Component
 * Provides different sizes and styles of loading spinners
 */
const LoadingSpinner = ({
  size = "medium",
  color = "blue",
  text = "",
  className = "",
  fullScreen = false,
}) => {
  // Size configurations
  const sizeClasses = {
    small: "h-4 w-4",
    medium: "h-8 w-8",
    large: "h-12 w-12",
    xlarge: "h-16 w-16",
  };

  // Color configurations
  const colorClasses = {
    blue: "border-blue-500",
    green: "border-green-500",
    red: "border-red-500",
    yellow: "border-yellow-500",
    purple: "border-purple-500",
    gray: "border-gray-500",
    white: "border-white",
  };

  // Text size based on spinner size
  const textSizeClasses = {
    small: "text-xs",
    medium: "text-sm",
    large: "text-base",
    xlarge: "text-lg",
  };

  const spinnerClass = `
    animate-spin rounded-full border-2 border-t-transparent
    ${sizeClasses[size]} 
    ${colorClasses[color]}
    ${className}
  `.trim();

  const textClass = `
    mt-2 text-gray-600 dark:text-gray-300
    ${textSizeClasses[size]}
  `.trim();

  const content = (
    <div className="flex flex-col items-center justify-center">
      <div className={spinnerClass}></div>
      {text && <p className={textClass}>{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

/**
 * Inline Loading Spinner for buttons and small spaces
 */
export const InlineSpinner = ({
  size = "small",
  color = "white",
  className = "",
}) => {
  const sizeClasses = {
    small: "h-3 w-3",
    medium: "h-4 w-4",
  };

  const colorClasses = {
    white: "border-white",
    blue: "border-blue-500",
    gray: "border-gray-500",
  };

  return (
    <div
      className={`
      animate-spin rounded-full border border-t-transparent
      ${sizeClasses[size]} 
      ${colorClasses[color]}
      ${className}
    `}
    ></div>
  );
};

/**
 * Page Loading Spinner for full page loads
 */
export const PageLoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="large" color="blue" text={message} />
      </div>
    </div>
  );
};

/**
 * Section Loading Spinner for component sections
 */
export const SectionLoadingSpinner = ({
  message = "Loading...",
  className = "",
}) => {
  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <LoadingSpinner size="medium" color="blue" text={message} />
    </div>
  );
};

/**
 * Button Loading State
 */
export const LoadingButton = ({
  loading = false,
  disabled = false,
  children,
  loadingText = "Loading...",
  className = "",
  ...props
}) => {
  return (
    <button
      disabled={loading || disabled}
      className={`
        inline-flex items-center justify-center
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {loading && <InlineSpinner size="small" color="white" className="mr-2" />}
      {loading ? loadingText : children}
    </button>
  );
};

export default LoadingSpinner;
