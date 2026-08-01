/**
 * Date range utilities for meal history filtering by month
 */

export interface DateRange {
  startDate: string;
  endDate: string;
}

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

export const getDaysInMonth = (month: number, year: number): number => {
  return new Date(year, month, 0).getDate();
};

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

export const getCurrentMonthYear = (): { month: number; year: number } => {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
};

export const getDayFromDate = (dateString: string): number | null => {
  if (!dateString) return null;

  const dateOnlyPart = dateString.substring(0, 10);
  const dayMatch = dateOnlyPart.match(/-(\d{2})$/);
  if (dayMatch) {
    const day = parseInt(dayMatch[1], 10);
    return day >= 1 && day <= 31 ? day : null;
  }
  return null;
};
