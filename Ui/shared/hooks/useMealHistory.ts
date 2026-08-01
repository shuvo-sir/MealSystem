import { useCallback, useState, useRef, useMemo } from "react";
import { Alert } from "react-native";
import { useAuth, useUser } from "@clerk/expo";
import { useFocusEffect } from "@react-navigation/native";
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
} from "@/shared/types/homeScreen.types";
import { getErrorMessage } from "@/shared/utils/homeScreenHelpers";
import {
  getMonthDateRange,
  getDaysInMonth,
  formatMonthYear,
  navigateMonth,
  getCurrentMonthYear,
} from "@/shared/utils/dateRangeHelpers";

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
  const hasLoadedRef = useRef(false);

  const [backendUser, setBackendUser] = useState<BackendUser | null>(null);
  const [mealGroup, setMealGroup] = useState<MealGroup | null>(null);
  const [members, setMembers] = useState<BackendUser[]>([]);
  const [entries, setEntries] = useState<MealEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const { month } = getCurrentMonthYear();
    return month;
  });
  const [currentYear, setCurrentYear] = useState(() => {
    const { year } = getCurrentMonthYear();
    return year;
  });
  const [viewMode, setViewMode] = useState<ViewMode>("group");
  const [selectedFilter, setSelectedFilter] = useState<MealHistoryFilter>({ mealType: "all" });

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
        const dashboard = await getMyMealGroup(token);
        setBackendUser(dashboard.user || null);
        setMealGroup(dashboard.mealGroup || null);
        setMembers(dashboard.members || []);

        if (dashboard.mealGroup?._id) {
          const filters: MealHistoryFilter = {
            ...selectedFilter,
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
          };

          if (viewMode === "personal" && dashboard.user?._id) {
            filters.userId = dashboard.user._id;
          }

          const historyData = await getMealHistory(dashboard.mealGroup._id, filters, token);
          setEntries(historyData.entries || []);
        } else {
          setEntries([]);
        }
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      } finally {
        setIsLoading(false);
        setRefreshing(false);
      }
    },
    [user?.id, getToken, selectedFilter, dateRange, viewMode]
  );

  useFocusEffect(
    useCallback(() => {
      if (!user?.id || hasLoadedRef.current) return;

      hasLoadedRef.current = true;
      loadMealHistory(true);
    }, [user?.id, loadMealHistory])
  );

  const handleFilterChange = useCallback(
    async (newFilter: MealHistoryFilter) => {
      setSelectedFilter(newFilter);
      setRefreshing(true);

      try {
        const token = await getToken();

        if (mealGroup?._id) {
          const historyData = await getMealHistory(mealGroup._id, newFilter, token);
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
    async (entryId: string, updates: Partial<MealEntry>, onSuccess?: () => void) => {
      if (!entryId) {
        Alert.alert("Error", "Entry ID is missing.");
        return;
      }

      setActionLoading(true);

      try {
        const token = await getToken();
        await updateMealEntry(entryId, updates, token);
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

  const handleMonthChange = useCallback(
    (delta: number) => {
      const { month, year } = navigateMonth(currentMonth, currentYear, delta);
      setCurrentMonth(month);
      setCurrentYear(year);
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

  const handleViewModeToggle = useCallback((mode: ViewMode) => {
    setViewMode(mode);
  }, []);

  return {
    backendUser,
    mealGroup,
    members,
    entries,
    isLoading,
    refreshing,
    actionLoading,
    errorMessage,
    selectedFilter,
    currentMonth,
    currentYear,
    monthYearLabel,
    daysInCurrentMonth,
    viewMode,
    loadMealHistory,
    handleFilterChange,
    handleUpdateEntry,
    handleDeleteEntry,
    goToPreviousMonth,
    goToNextMonth,
    resetToCurrentMonth,
    handleViewModeToggle,
  };
};