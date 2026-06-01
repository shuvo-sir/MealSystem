import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import { Alert } from "react-native";
import { useAuth, useUser } from "@clerk/expo";
import {
  getMealHistory,
  updateMealEntry,
  deleteMealEntry,
  getMyMealGroup,
} from "@/api/meal.api";
import {
  BackendUser,
  MealEntry,
  MealGroup,
} from "../_types/homeScreen.types";
import { getErrorMessage } from "../_utils/homeScreenHelpers";
import {
  getMonthDateRange,
  getDaysInMonth,
  formatMonthYear,
  navigateMonth,
  getCurrentMonthYear,
  getDayFromDate,
} from "../_utils/dateRangeHelpers";

export interface MealHistoryFilter {
  startDate?: string;
  endDate?: string;
  mealType?: "all" | "breakfast" | "lunch" | "dinner";
  userId?: string;
}

export type ViewMode = "group" | "personal";

export const useMealHistory = () => {
  const { user } = useUser();
  const { getToken } = useAuth();

  // Track if initial load has been done
  const hasLoadedRef = useRef(false);

  // Core state
  const [backendUser, setBackendUser] = useState<BackendUser | null>(null);
  const [mealGroup, setMealGroup] = useState<MealGroup | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [entries, setEntries] = useState<MealEntry[]>([]);
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Month navigation state
  const [currentMonth, setCurrentMonth] = useState(() => {
    const { month } = getCurrentMonthYear();
    return month;
  });
  const [currentYear, setCurrentYear] = useState(() => {
    const { year } = getCurrentMonthYear();
    return year;
  });

  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>("group");

  // Filter state
  const [selectedFilter, setSelectedFilter] = useState<MealHistoryFilter>({
    mealType: "all",
  });

  // Memoized values
  const monthYearLabel = useMemo(
    () => formatMonthYear(currentMonth, currentYear),
    [currentMonth, currentYear]
  );

  const daysInCurrentMonth = useMemo(
    () => getDaysInMonth(currentMonth, currentYear),
    [currentMonth, currentYear]
  );

  const dateRange = useMemo(
    () => getMonthDateRange(currentMonth, currentYear),
    [currentMonth, currentYear]
  );

  const loadMealHistory = useCallback(
    async (showInitialLoader = false) => {
      if (!user?.id) return;

      if (showInitialLoader) setIsLoading(true);
      else setRefreshing(true);

      setErrorMessage(null);

      try {
        const token = await getToken();

        // Get user's meal group first
        const dashboard = await getMyMealGroup(token);
        setBackendUser(dashboard.user || null);
        setMealGroup(dashboard.mealGroup || null);
        setMembers(dashboard.members || []);

        console.log("🔍 [useMealHistory] Dashboard loaded:", {
          userId: dashboard.user?._id,
          groupId: dashboard.mealGroup?._id,
          membersCount: dashboard.members?.length || 0,
          dateRange: dateRange,
          viewMode: viewMode,
        });

        if (dashboard.mealGroup?._id) {
          // Build filters with date range and view mode
          const filters: MealHistoryFilter = {
            ...selectedFilter,
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
          };

          // Add userId filter if in personal view
          if (viewMode === "personal" && user?.id) {
            // Map Clerk user ID to backend user ID if needed
            if (dashboard.user?._id) {
              filters.userId = dashboard.user._id;
              console.log("🔍 [useMealHistory] Personal view - filtering by userId:", dashboard.user._id);
            }
          }

          console.log("🔍 [useMealHistory] Calling getMealHistory with filters:", filters);

          // Fetch meal history with filters
          const historyData = await getMealHistory(
            dashboard.mealGroup._id,
            filters,
            token
          );

          console.log("🔍 [useMealHistory] Response received:", {
            entriesCount: historyData.entries?.length || 0,
            firstEntry: historyData.entries?.[0],
            totalPages: historyData.pagination?.pages,
          });

          setEntries(historyData.entries || []);
        } else {
          console.log("⚠️ [useMealHistory] No meal group found");
          setEntries([]);
        }
      } catch (error) {
        console.error("❌ [useMealHistory] Error loading meal history:", error);
        setErrorMessage(getErrorMessage(error));
      } finally {
        setIsLoading(false);
        setRefreshing(false);
      }
    },
    [user?.id, user?.id, getToken, selectedFilter, dateRange, viewMode]
  );

  // Load on mount
  useEffect(() => {
    if (!user?.id || hasLoadedRef.current) return;

    hasLoadedRef.current = true;
    loadMealHistory(true);
  }, [user?.id, loadMealHistory]);

  const handleFilterChange = useCallback(
    async (newFilter: MealHistoryFilter) => {
      setSelectedFilter(newFilter);
      setRefreshing(true);

      try {
        const token = await getToken();

        if (mealGroup?._id) {
          const historyData = await getMealHistory(
            mealGroup._id,
            newFilter,
            token
          );
          setEntries(historyData.entries || []);
        }
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      } finally {
        setRefreshing(false);
      }
    },
    [mealGroup?._id, getToken]
  );

  const handleUpdateEntry = useCallback(
    async (
      entryId: string,
      updates: Partial<MealEntry>,
      onSuccess?: () => void
    ) => {
      if (!entryId) {
        Alert.alert("Error", "Entry ID is missing.");
        return;
      }

      setActionLoading(true);

      try {
        const token = await getToken();
        await updateMealEntry(entryId, updates, token);

        // Reload history
        await loadMealHistory(false);

        Alert.alert("Success", "Meal entry updated.");
        if (onSuccess) onSuccess();
      } catch (error) {
        Alert.alert("Error", getErrorMessage(error));
      } finally {
        setActionLoading(false);
      }
    },
    [getToken, loadMealHistory]
  );

  const handleDeleteEntry = useCallback(
    async (entryId: string, onSuccess?: () => void) => {
      if (!entryId) {
        Alert.alert("Error", "Entry ID is missing.");
        return;
      }

      setActionLoading(true);

      try {
        const token = await getToken();
        await deleteMealEntry(entryId, token);

        // Reload history
        await loadMealHistory(false);

        Alert.alert("Success", "Meal entry deleted.");
        if (onSuccess) onSuccess();
      } catch (error) {
        Alert.alert("Error", getErrorMessage(error));
      } finally {
        setActionLoading(false);
      }
    },
    [getToken, loadMealHistory]
  );

  // Month navigation handlers
  const handleMonthChange = useCallback(
    (delta: number) => {
      const { month, year } = navigateMonth(currentMonth, currentYear, delta);
      setCurrentMonth(month);
      setCurrentYear(year);
      // loadMealHistory will automatically be called due to dependency changes
    },
    [currentMonth, currentYear]
  );

  const goToPreviousMonth = useCallback(() => {
    handleMonthChange(-1);
  }, [handleMonthChange]);

  const goToNextMonth = useCallback(() => {
    handleMonthChange(1);
  }, [handleMonthChange]);

  const resetToCurrentMonth = useCallback(() => {
    const { month, year } = getCurrentMonthYear();
    setCurrentMonth(month);
    setCurrentYear(year);
  }, []);

  // View mode handlers
  const handleViewModeToggle = useCallback(
    (mode: ViewMode) => {
      setViewMode(mode);
      // loadMealHistory will automatically be called due to dependency changes
    },
    []
  );

  return {
    // State
    backendUser,
    mealGroup,
    members,
    entries,
    isLoading,
    refreshing,
    actionLoading,
    errorMessage,
    selectedFilter,

    // Month navigation state
    currentMonth,
    currentYear,
    monthYearLabel,
    daysInCurrentMonth,

    // View mode state
    viewMode,

    // Handlers
    loadMealHistory,
    handleFilterChange,
    handleUpdateEntry,
    handleDeleteEntry,
    handleMonthChange,
    goToPreviousMonth,
    goToNextMonth,
    resetToCurrentMonth,
    handleViewModeToggle,
  };
};
