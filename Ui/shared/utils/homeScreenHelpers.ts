import { MealEntry } from "../types/homeScreen.types";

export interface ErrorInfo {
  type: "rate-limit" | "network" | "auth" | "validation" | "server" | "unknown";
  message: string;
  canRetry: boolean;
  statusCode?: number;
}

/**
 * Categorize and get details about an error
 * Returns structured error information with retry capability
 */
export const getErrorInfo = (error: any): ErrorInfo => {
  const status = error?.response?.status;
  const data = error?.response?.data;
  const message = data?.message || error?.message || "Something went wrong. Please try again.";

  // Rate limit error
  if (status === 429) {
    return {
      type: "rate-limit",
      message: "Too many requests. Please wait a moment and try again.",
      canRetry: true,
      statusCode: 429,
    };
  }

  // Network/connection error
  if (!error?.response) {
    return {
      type: "network",
      message: "Network connection error. Please check your connection and try again.",
      canRetry: true,
    };
  }

  // Auth error
  if (status === 401 || status === 403) {
    return {
      type: "auth",
      message: "Authentication error. Please log in again.",
      canRetry: false,
      statusCode: status,
    };
  }

  // Validation error
  if (status === 400) {
    return {
      type: "validation",
      message: message,
      canRetry: false,
      statusCode: 400,
    };
  }

  // Server error
  if (status && status >= 500) {
    return {
      type: "server",
      message: "Server error. Please try again later.",
      canRetry: true,
      statusCode: status,
    };
  }

  // Unknown error
  return {
    type: "unknown",
    message: message,
    canRetry: true,
  };
};

/**
 * Legacy helper - kept for backward compatibility
 */
export const getErrorMessage = (error: any) =>
  getErrorInfo(error).message;

export const getEntryUserId = (entry: MealEntry) =>
  typeof entry.user === "string" ? entry.user : entry.user?._id;

export const getLocalDateKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  
  return `${year}-${month}-${day}`;
};

export const formatNoteDate = (dateValue: string) => {
  const date = new Date(dateValue);

  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};
