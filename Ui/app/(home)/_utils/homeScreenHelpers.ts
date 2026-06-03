import { MealEntry } from "../_types/homeScreen.types";

export const getErrorMessage = (error: any) =>
  error?.response?.data?.message ||
  error?.message ||
  "Something went wrong. Please try again.";

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

  // Format: "MM/DD/YYYY and current time in 12-hour format with AM/PM"
  
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};
