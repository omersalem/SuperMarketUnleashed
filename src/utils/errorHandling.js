/**
 * Centralized error handling utilities for the Supermarket Management App
 */

// Error types for better categorization
export const ErrorTypes = {
  NETWORK: "NETWORK",
  FIREBASE: "FIREBASE",
  VALIDATION: "VALIDATION",
  AUTHENTICATION: "AUTHENTICATION",
  PERMISSION: "PERMISSION",
  UNKNOWN: "UNKNOWN",
};

// Error severity levels
export const ErrorSeverity = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
};

/**
 * Custom error class for application-specific errors
 */
export class AppError extends Error {
  constructor(
    message,
    type = ErrorTypes.UNKNOWN,
    severity = ErrorSeverity.MEDIUM,
    details = {}
  ) {
    super(message);
    this.name = "AppError";
    this.type = type;
    this.severity = severity;
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

/**
 * Error handler for Firebase operations
 */
export const handleFirebaseError = (error) => {
  console.error("Firebase Error:", error);

  let message = "An unexpected error occurred";
  let type = ErrorTypes.FIREBASE;
  let severity = ErrorSeverity.MEDIUM;

  // Map Firebase error codes to user-friendly messages
  switch (error.code) {
    case "auth/user-not-found":
    case "auth/wrong-password":
      message = "Invalid email or password";
      type = ErrorTypes.AUTHENTICATION;
      break;
    case "auth/user-disabled":
      message = "This account has been disabled";
      type = ErrorTypes.AUTHENTICATION;
      severity = ErrorSeverity.HIGH;
      break;
    case "auth/too-many-requests":
      message = "Too many failed attempts. Please try again later";
      type = ErrorTypes.AUTHENTICATION;
      break;
    case "permission-denied":
      message = "You do not have permission to perform this action";
      type = ErrorTypes.PERMISSION;
      severity = ErrorSeverity.HIGH;
      break;
    case "unavailable":
      message = "Service temporarily unavailable. Please try again";
      type = ErrorTypes.NETWORK;
      severity = ErrorSeverity.HIGH;
      break;
    case "not-found":
      message = "The requested resource was not found";
      type = ErrorTypes.FIREBASE;
      break;
    case "already-exists":
      message = "This resource already exists";
      type = ErrorTypes.VALIDATION;
      break;
    default:
      message = error.message || "An unexpected error occurred";
  }

  return new AppError(message, type, severity, {
    originalError: error,
    code: error.code,
  });
};

/**
 * Error handler for network operations
 */
export const handleNetworkError = (error) => {
  console.error("Network Error:", error);

  let message = "Network error occurred";
  let severity = ErrorSeverity.MEDIUM;

  if (!navigator.onLine) {
    message = "No internet connection. Please check your network";
    severity = ErrorSeverity.HIGH;
  } else if (error.name === "TimeoutError") {
    message = "Request timed out. Please try again";
  } else if (error.status >= 500) {
    message = "Server error. Please try again later";
    severity = ErrorSeverity.HIGH;
  } else if (error.status === 404) {
    message = "Resource not found";
  } else if (error.status === 403) {
    message = "Access denied";
    severity = ErrorSeverity.HIGH;
  }

  return new AppError(message, ErrorTypes.NETWORK, severity, {
    originalError: error,
    status: error.status,
  });
};

/**
 * Error handler for validation errors
 */
export const handleValidationError = (field, value, rule) => {
  let message = `Invalid ${field}`;

  switch (rule) {
    case "required":
      message = `${field} is required`;
      break;
    case "email":
      message = `Please enter a valid email address`;
      break;
    case "minLength":
      message = `${field} must be at least ${value} characters`;
      break;
    case "maxLength":
      message = `${field} must not exceed ${value} characters`;
      break;
    case "numeric":
      message = `${field} must be a valid number`;
      break;
    case "positive":
      message = `${field} must be a positive number`;
      break;
    default:
      message = `Invalid ${field}: ${rule}`;
  }

  return new AppError(message, ErrorTypes.VALIDATION, ErrorSeverity.LOW, {
    field,
    value,
    rule,
  });
};

/**
 * Generic error handler that categorizes unknown errors
 */
export const handleGenericError = (error, context = "") => {
  console.error(`Error in ${context}:`, error);

  // If it's already an AppError, return it
  if (error instanceof AppError) {
    return error;
  }

  // Try to categorize the error
  if (error.code && error.code.startsWith("auth/")) {
    return handleFirebaseError(error);
  }

  if (error.name === "NetworkError" || error.status) {
    return handleNetworkError(error);
  }

  // Default to unknown error
  return new AppError(
    error.message || "An unexpected error occurred",
    ErrorTypes.UNKNOWN,
    ErrorSeverity.MEDIUM,
    {
      originalError: error,
      context,
    }
  );
};

/**
 * Error logging utility (in production, this could send to an error service)
 */
export const logError = (error, additionalInfo = {}) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    error: {
      message: error.message,
      name: error.name,
      stack: error.stack,
      ...(error instanceof AppError && {
        id: error.id,
        type: error.type,
        severity: error.severity,
        details: error.details,
      }),
    },
    userAgent: navigator.userAgent,
    url: window.location.href,
    userId: additionalInfo.userId || "anonymous",
    ...additionalInfo,
  };

  // In development, just log to console
  if (process.env.NODE_ENV === "development") {
    console.group("🚨 Error Log");
    console.error("Error Details:", errorLog);
    console.groupEnd();
  } else {
    // In production, you might send this to an error tracking service
    // Example: sendToErrorService(errorLog);
    console.error("Error occurred:", errorLog);
  }

  return errorLog;
};

/**
 * Async wrapper that handles errors automatically
 */
export const withErrorHandling = (
  asyncFn,
  context = "",
  errorHandler = handleGenericError
) => {
  return async (...args) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      const handledError = errorHandler(error, context);
      logError(handledError);
      throw handledError;
    }
  };
};

/**
 * React hook for error handling in components
 */
export const useErrorHandler = () => {
  const handleError = (error, context = "") => {
    const handledError = handleGenericError(error, context);
    logError(handledError);
    return handledError;
  };

  return { handleError };
};
