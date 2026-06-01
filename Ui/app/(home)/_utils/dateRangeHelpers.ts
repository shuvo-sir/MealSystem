/**
 * Date range utilities for meal history filtering by month
 */

export interface DateRange {
  startDate: string;
  endDate: string;
}

/**
 * Get the first and last day of a given month as ISO date strings (YYYY-MM-DD)
 * @param month - Month number (1-12)
 * @param year - Year (e.g., 2026)
 * @returns Object with startDate and endDate in YYYY-MM-DD format
 */
export const getMonthDateRange = (month: number, year: number): DateRange => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  };
};

/**
 * Get the number of days in a given month
 * @param month - Month number (1-12)
 * @param year - Year (e.g., 2026)
 * @returns Number of days in the month
 */
export const getDaysInMonth = (month: number, year: number): number => {
  return new Date(year, month, 0).getDate();
};

/**
 * Format month and year for display (e.g., "June 2026")
 * @param month - Month number (1-12)
 * @param year - Year (e.g., 2026)
 * @returns Formatted string like "June 2026"
 */
export const formatMonthYear = (month: number, year: number): string => {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${monthNames[month - 1]} ${year}`;
};

/**
 * Move to the next or previous month
 * @param currentMonth - Current month (1-12)
 * @param currentYear - Current year
 * @param delta - Amount to move (-1 for prev month, +1 for next month)
 * @returns New month and year
 */
export const navigateMonth = (
  currentMonth: number,
  currentYear: number,
  delta: number
): { month: number; year: number } => {
  let newMonth = currentMonth + delta;
  let newYear = currentYear;

  if (newMonth > 12) {
    newMonth = 1;
    newYear += 1;
  } else if (newMonth < 1) {
    newMonth = 12;
    newYear -= 1;
  }

  return { month: newMonth, year: newYear };
};

/**
 * Get current month and year
 * @returns Object with current month (1-12) and year
 */
export const getCurrentMonthYear = (): { month: number; year: number } => {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
};

/**
 * Extract day from ISO date string (YYYY-MM-DD or ISO datetime format)
 * @param dateString - Date in YYYY-MM-DD format or ISO datetime format (e.g., "2026-06-01T00:00:00.000Z")
 * @returns Day number (1-31) or null if invalid
 */
export const getDayFromDate = (dateString: string): number | null => {
  if (!dateString) return null;
  
  // Extract first 10 characters to get YYYY-MM-DD portion
  // Handles both "2026-06-01" and "2026-06-01T00:00:00.000Z"
  const dateOnlyPart = dateString.substring(0, 10);
  
  // Extract day from YYYY-MM-DD format
  const dayMatch = dateOnlyPart.match(/-(\d{2})$/);
  if (dayMatch) {
    const day = parseInt(dayMatch[1], 10);
    return day >= 1 && day <= 31 ? day : null;
  }
  return null;
};
