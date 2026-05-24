import { useCallback, useEffect, useState, useRef } from "react";
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
} from "../types/homeScreen.types";
import { getErrorMessage } from "../utils/homeScreenHelpers";

export interface MealHistoryFilter {
  startDate?: string;
  endDate?: string;
  mealType?: "all" | "breakfast" | "lunch" | "dinner";
  userId?: string;
}

export const useMealHistory = () => {
  const { user } = useUser();
  const { getToken } = useAuth();

  // Track if initial load has been done
  const hasLoadedRef = useRef(false);

  const [backendUser, setBackendUser] = useState<BackendUser | null>(null);
  const [mealGroup, setMealGroup] = useState<MealGroup | null>(null);
  const [entries, setEntries] = useState<MealEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [selectedFilter, setSelectedFilter] = useState<MealHistoryFilter>({
    mealType: "all",
  });

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

        if (dashboard.mealGroup?._id) {
          // Fetch meal history with filters
          const historyData = await getMealHistory(
            dashboard.mealGroup._id,
            selectedFilter,
            token
          );
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
    [user?.id, getToken, selectedFilter]
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

  return {
    // State
    backendUser,
    mealGroup,
    entries,
    isLoading,
    refreshing,
    actionLoading,
    errorMessage,
    selectedFilter,

    // Handlers
    loadMealHistory,
    handleFilterChange,
    handleUpdateEntry,
    handleDeleteEntry,
  };
};
