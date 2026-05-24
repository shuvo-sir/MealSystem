import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { Alert } from "react-native";
import { useAuth, useUser } from "@clerk/expo";
import { getMyMealGroup } from "@/api/meal.api";
import {
  getTransactions,
  addDeposit,
  addExpense,
} from "@/api/finance.api";
import {
  BackendUser,
  MealGroup,
} from "../types/homeScreen.types";
import { getErrorMessage } from "../utils/homeScreenHelpers";

export interface Transaction {
  _id: string;
  type: "deposit" | "expense";
  amount: number;
  date: string;
  user?: any;
  note?: string;
  title?: string;
}

export interface FinanceFilter {
  startDate?: string;
  endDate?: string;
  addedBy?: string;
}

export const useFinanceHistory = () => {
  const { user } = useUser();
  const { getToken } = useAuth();

  // Track if initial load has been done
  const hasLoadedRef = useRef(false);

  const [backendUser, setBackendUser] = useState<BackendUser | null>(null);
  const [mealGroup, setMealGroup] = useState<MealGroup | null>(null);
  const [deposits, setDeposits] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [selectedFilter, setSelectedFilter] = useState<FinanceFilter>({});

  const isManager = useMemo(
    () => backendUser?.role === "manager",
    [backendUser?.role]
  );

  const loadTransactionHistory = useCallback(
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
          // Fetch transactions
          const transactionsData = await getTransactions(
            dashboard.mealGroup._id,
            selectedFilter,
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
        } else {
          setDeposits([]);
          setExpenses([]);
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
    loadTransactionHistory(true);
  }, [user?.id, loadTransactionHistory]);

  const handleFilterChange = useCallback(
    async (newFilter: FinanceFilter) => {
      setSelectedFilter(newFilter);
      setRefreshing(true);

      try {
        const token = await getToken();

        if (mealGroup?._id) {
          const transactionsData = await getTransactions(
            mealGroup._id,
            newFilter,
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
    [mealGroup?._id, getToken]
  );

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
            userId: backendUser._id,
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
        Alert.alert(
          "Permission denied",
          "Only managers can add expenses."
        );
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
            userId: backendUser._id,
            title: title.trim(),
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

  return {
    // State
    backendUser,
    mealGroup,
    deposits,
    expenses,
    isLoading,
    refreshing,
    actionLoading,
    errorMessage,
    selectedFilter,
    isManager,

    // Handlers
    loadTransactionHistory,
    handleFilterChange,
    handleAddDeposit,
    handleAddExpense,
  };
};
