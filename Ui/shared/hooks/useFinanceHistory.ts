import { useCallback, useMemo, useState, useRef } from "react";
import { Alert } from "react-native";
import { useAuth, useUser } from "@clerk/expo";
import { useFocusEffect } from "@react-navigation/native";
import { getMealHistory, getMyMealGroup } from "@/api/meal.api";
import {
  getTransactions,
  addDeposit,
  addExpense,
  addFinanceAdjustment,
} from "@/api/finance.api";
import { BackendUser, MealGroup } from "@/shared/types/homeScreen.types";
import { getErrorMessage } from "@/shared/utils/homeScreenHelpers";
import {
  getMonthDateRange,
  getCurrentMonthYear,
  formatMonthYear,
  navigateMonth,
} from "@/shared/utils/dateRangeHelpers";

export interface Transaction {
  _id: string;
  type: "deposit" | "expense" | "adjustment";
  amount: number;
  date: string;
  user?: any;
  note?: string;
  title?: string;
  adjustmentType?: "credit" | "due";
  monthKey?: string;
  addedBy?: any;
}

export interface FinanceFilter {
  startDate?: string;
  endDate?: string;
  addedBy?: string;
}

export const useFinanceHistory = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const hasLoadedRef = useRef(false);

  const [backendUser, setBackendUser] = useState<BackendUser | null>(null);
  const [mealGroup, setMealGroup] = useState<MealGroup | null>(null);
  const [members, setMembers] = useState<BackendUser[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [deposits, setDeposits] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [adjustments, setAdjustments] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<FinanceFilter>({});
  const [currentMonth, setCurrentMonth] = useState(() => getCurrentMonthYear().month);
  const [currentYear, setCurrentYear] = useState(() => getCurrentMonthYear().year);

  const monthYearLabel = useMemo(
    () => formatMonthYear(currentMonth, currentYear),
    [currentMonth, currentYear]
  );

  const monthKey = useMemo(
    () => `${currentYear}-${String(currentMonth).padStart(2, "0")}`,
    [currentMonth, currentYear]
  );

  const isManager = useMemo(
    () => backendUser?.role === "manager" || backendUser?.role === "owner",
    [backendUser?.role]
  );

  const loadTransactionHistory = useCallback(
    async (
      showInitialLoader = false,
      targetMonth?: { month: number; year: number }
    ) => {
      if (!user?.id) return;

      const month = targetMonth?.month ?? currentMonth;
      const year = targetMonth?.year ?? currentYear;
      const range = getMonthDateRange(month, year);
      const selectedMonthKey = `${year}-${String(month).padStart(2, "0")}`;

      if (showInitialLoader) setIsLoading(true);
      else setRefreshing(true);

      setErrorMessage(null);

      try {
        const token = await getToken();

        const dashboard = await getMyMealGroup(token);
        setBackendUser(dashboard.user || null);
        setMealGroup(dashboard.mealGroup || null);
        setMembers(dashboard.members || dashboard.mealGroup?.members || []);

        if (dashboard.mealGroup?._id) {
          const mealHistoryData = await getMealHistory(
            dashboard.mealGroup._id,
            {
              startDate: range.startDate,
              endDate: range.endDate,
            },
            token
          );

          setEntries(mealHistoryData.entries || []);

          const transactionsData = await getTransactions(
            dashboard.mealGroup._id,
            {
              startDate: range.startDate,
              endDate: range.endDate,
            },
            token
          );

          const allTransactions = transactionsData.transactions || [];
          const depositsOnly = allTransactions.filter(
            (t: Transaction) => t.type === "deposit"
          );
          const expensesOnly = allTransactions.filter(
            (t: Transaction) => t.type === "expense"
          );
          const adjustmentsOnly = allTransactions.filter(
            (t: Transaction) => t.type === "adjustment" && t.monthKey === selectedMonthKey
          );

          setDeposits(depositsOnly);
          setExpenses(expensesOnly);
          setAdjustments(adjustmentsOnly);
        } else {
          setDeposits([]);
          setExpenses([]);
          setAdjustments([]);
          setEntries([]);
        }
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      } finally {
        setIsLoading(false);
        setRefreshing(false);
      }
    },
    [user?.id, getToken, currentMonth, currentYear]
  );

  useFocusEffect(
    useCallback(() => {
      if (!user?.id || hasLoadedRef.current) return;

      hasLoadedRef.current = true;
      loadTransactionHistory(true);
    }, [user?.id, loadTransactionHistory])
  );

  const handleFilterChange = useCallback(
    async (newFilter: FinanceFilter) => {
      setSelectedFilter(newFilter);
      setRefreshing(true);

      try {
        const token = await getToken();

        if (mealGroup?._id) {
          const range = getMonthDateRange(currentMonth, currentYear);
          const transactionsData = await getTransactions(
            mealGroup._id,
            {
              ...newFilter,
              startDate: range.startDate,
              endDate: range.endDate,
            },
            token
          );

          const allTransactions = transactionsData.transactions || [];
          const depositsOnly = allTransactions.filter(
            (t: Transaction) => t.type === "deposit"
          );
          const expensesOnly = allTransactions.filter(
            (t: Transaction) => t.type === "expense"
          );

          setDeposits(depositsOnly);
          setExpenses(expensesOnly);
        }
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      } finally {
        setRefreshing(false);
      }
    },
    [mealGroup?._id, getToken, currentMonth, currentYear]
  );

  const handleMonthChange = useCallback(
    (delta: number) => {
      const { month, year } = navigateMonth(currentMonth, currentYear, delta);
      setCurrentMonth(month);
      setCurrentYear(year);
      hasLoadedRef.current = false;
      loadTransactionHistory(true, { month, year });
    },
    [currentMonth, currentYear, loadTransactionHistory]
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
    hasLoadedRef.current = false;
    loadTransactionHistory(true, { month, year });
  }, [loadTransactionHistory]);

  const handleAddDeposit = useCallback(
    async (amount: number, note: string = "", onSuccess?: () => void) => {
      if (!backendUser || !mealGroup) {
        Alert.alert("Join a group", "Create or join a meal group first.");
        return;
      }

      if (!amount || amount <= 0) {
        Alert.alert("Invalid amount", "Please enter a valid amount.");
        return;
      }

      setActionLoading(true);

      try {
        const token = await getToken();
        await addDeposit(
          {
            amount,
            note: note || undefined,
          },
          token
        );

        await loadTransactionHistory(false);
        Alert.alert("Success", "Deposit added.");
        if (onSuccess) onSuccess();
      } catch (error) {
        Alert.alert("Error", getErrorMessage(error));
      } finally {
        setActionLoading(false);
      }
    },
    [backendUser, mealGroup, getToken, loadTransactionHistory]
  );

  const handleAddExpense = useCallback(
    async (
      title: string,
      amount: number,
      note: string = "",
      onSuccess?: () => void
    ) => {
      if (!backendUser || !mealGroup) {
        Alert.alert("Join a group", "Create or join a meal group first.");
        return;
      }

      if (!isManager) {
        Alert.alert("Permission denied", "Only managers can add expenses.");
        return;
      }

      if (!title.trim()) {
        Alert.alert("Missing title", "Please enter an expense title.");
        return;
      }

      if (!amount || amount <= 0) {
        Alert.alert("Invalid amount", "Please enter a valid amount.");
        return;
      }

      setActionLoading(true);

      try {
        const token = await getToken();
        await addExpense(
          {
            title,
            amount,
            note: note || undefined,
          },
          token
        );

        await loadTransactionHistory(false);
        Alert.alert("Success", "Expense added.");
        if (onSuccess) onSuccess();
      } catch (error) {
        Alert.alert("Error", getErrorMessage(error));
      } finally {
        setActionLoading(false);
      }
    },
    [backendUser, mealGroup, isManager, getToken, loadTransactionHistory]
  );

  const handleAddFinanceAdjustment = useCallback(
    async (
      targetUserId: string,
      type: "credit" | "due",
      amount: number,
      note: string = "",
      onSuccess?: () => void
    ) => {
      if (!backendUser || !mealGroup) {
        Alert.alert("Join a group", "Create or join a meal group first.");
        return;
      }

      if (!isManager) {
        Alert.alert("Permission denied", "Only managers can add credit or due.");
        return;
      }

      if (!targetUserId) {
        Alert.alert("Missing member", "Please select a member.");
        return;
      }

      if (!amount || amount <= 0) {
        Alert.alert("Invalid amount", "Please enter a valid amount.");
        return;
      }

      setActionLoading(true);

      try {
        const token = await getToken();
        await addFinanceAdjustment(
          {
            userId: targetUserId,
            monthKey,
            type,
            amount,
            note: note || undefined,
          },
          token
        );

        await loadTransactionHistory(false, { month: currentMonth, year: currentYear });
        Alert.alert("Success", `${type === "credit" ? "Credit" : "Due"} added.`);
        if (onSuccess) onSuccess();
      } catch (error) {
        Alert.alert("Error", getErrorMessage(error));
      } finally {
        setActionLoading(false);
      }
    },
    [backendUser, mealGroup, isManager, getToken, loadTransactionHistory, monthKey, currentMonth, currentYear]
  );

  return {
    backendUser,
    mealGroup,
    members,
    entries,
    deposits,
    expenses,
    adjustments,
    isLoading,
    refreshing,
    actionLoading,
    errorMessage,
    selectedFilter,
    isManager,
    currentMonth,
    currentYear,
    monthYearLabel,
    goToPreviousMonth,
    goToNextMonth,
    resetToCurrentMonth,
    loadTransactionHistory,
    handleFilterChange,
    handleAddDeposit,
    handleAddExpense,
    handleAddFinanceAdjustment,
  };
};