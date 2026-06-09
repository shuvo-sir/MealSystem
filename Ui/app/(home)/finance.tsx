import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "@clerk/expo";
import { useAuth } from "@clerk/expo";
import { LoadingScreen } from "@/shared/components/LoadingScreen";
import { useFinanceHistory, FinanceFilter, Transaction } from "./_hooks/useFinanceHistory";
import { getMyMealGroup } from "@/api/meal.api";
import { styles } from "@/assets/styles/home.styles";
import { COLORS } from "@/constants/colors";


export default function FinanceScreen() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [avatarImageFailed, setAvatarImageFailed] = useState(false);
  const [entries, setEntries] = useState<any[]>([]);
  const hasLoadedEntriesRef = useRef(false);

  // Finance history hook
  const {
    backendUser,
    mealGroup,
    deposits,
    expenses,
    isLoading,
    refreshing,
    actionLoading,
    errorMessage,
    isManager,
    loadTransactionHistory,
    handleAddDeposit,
    handleAddExpense,
  } = useFinanceHistory();

  // UI State
  const [activeTab, setActiveTab] = useState<"summary" | "deposits" | "expenses">("summary");
  const [depositModalVisible, setDepositModalVisible] = useState(false);
  const [expenseModalVisible, setExpenseModalVisible] = useState(false);

  // Deposit form
  const [depositAmount, setDepositAmount] = useState("");
  const [depositNote, setDepositNote] = useState("");

  // Expense form
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseNote, setExpenseNote] = useState("");

  const userName = useMemo(
    () =>
      [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
      user?.username ||
      user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ||
      "User",
    [user?.emailAddresses, user?.firstName, user?.lastName, user?.username]
  );

  const userEmail = useMemo(
    () =>
      user?.primaryEmailAddress?.emailAddress ||
      user?.emailAddresses?.[0]?.emailAddress ||
      "",
    [user?.emailAddresses, user?.primaryEmailAddress]
  );

  const totalDeposits = useMemo(
    () => deposits.reduce((sum, d) => sum + d.amount, 0),
    [deposits]
  );

  const totalExpenses = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );

  // Load meal entries for individual metrics
  useEffect(() => {
    if (!user?.id || !backendUser?._id || hasLoadedEntriesRef.current) return;

    const loadEntries = async () => {
      try {
        const token = await getToken();
        const dashboard = await getMyMealGroup(token);
        setEntries(dashboard.entries || []);
        hasLoadedEntriesRef.current = true;
      } catch (error) {
        console.log("Error loading entries:", error);
      }
    };

    loadEntries();
  }, [user?.id, backendUser?._id, getToken]);

 
  // Calculate total expenses for individual user for the current month
  const userExpensesThisMonth = useMemo(() => {
    if (!backendUser?._id) return 0;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    return expenses
      .filter((e) => {
        const expenseUserId = e.user?._id || e.user;
        const [expenseYear, expenseMonth] = e.date.split("-").map(Number);
        return (
          expenseUserId === backendUser._id &&
          expenseYear === currentYear &&
          expenseMonth === currentMonth
        );
      })
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses, backendUser?._id]);



// Calculate total meals for the current month
 const userMealsThisMonth = useMemo(() => {
  if (!backendUser?._id) return 0;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  let total = 0;

  for (const entry of entries) {
    const [entryYear, entryMonth] = entry.date.split("-").map(Number);

    if (
      entryYear === year &&
      entryMonth === month &&
      (entry.user?._id === backendUser._id || entry.user === backendUser._id)
    ) {
      total += entry.totalMeals;
    }
  }

  return total;
}, [entries, backendUser?._id]);


// Calculate meal cost for the current month
  const mealCostThisMonth = useMemo(() => {
    if (!mealGroup?.mealRate) return 0;
    return userMealsThisMonth * mealGroup.mealRate;
  }, [userMealsThisMonth, mealGroup?.mealRate]);


 const userDeposits = useMemo(() => {
  if (!backendUser?._id) return 0;

  return deposits
    .filter(
      (d) =>
        d.user?._id === backendUser._id ||
        d.user === backendUser._id
    )
    .reduce((sum, d) => sum + d.amount, 0);
}, [deposits, backendUser?._id]);

const userBalance = useMemo(() => {
  const balance = userDeposits - mealCostThisMonth;

  return {
    amount: Math.abs(balance),
    isDue: balance < 0,
    label: balance < 0 ? "Amount Due" : "Available Balance",
    balance,
  };
}, [userDeposits, mealCostThisMonth]);

  const closeDepositModal = () => {
    setDepositModalVisible(false);
    setDepositAmount("");
    setDepositNote("");
  };

  const closeExpenseModal = () => {
    setExpenseModalVisible(false);
    setExpenseTitle("");
    setExpenseAmount("");
    setExpenseNote("");
  };

  const handleSaveDeposit = async () => {
    const amount = parseFloat(depositAmount);

    if (!amount || amount <= 0) {
      Alert.alert("Invalid amount", "Please enter a valid amount.");
      return;
    }

    await handleAddDeposit(amount, depositNote, closeDepositModal);
  };

  const handleSaveExpense = async () => {
    const amount = parseFloat(expenseAmount);

    if (!expenseTitle.trim()) {
      Alert.alert("Missing title", "Please enter an expense title.");
      return;
    }

    if (!amount || amount <= 0) {
      Alert.alert("Invalid amount", "Please enter a valid amount.");
      return;
    }

    await handleAddExpense(expenseTitle.trim(), amount, expenseNote, closeExpenseModal);
  };

  const formatCurrency = (amount: number) => {
    return `BDT ${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!mealGroup) {
    return (
      <SafeAreaView style={styles.container}>
        {/* <View style={styles.content}>
          <View style={{ alignItems: "center", paddingVertical: 16, marginBottom: 20 }}>
            {user?.imageUrl && !avatarImageFailed ? (
              <Image
                source={{ uri: user.imageUrl }}
                style={{ width: 60, height: 60, borderRadius: 30 }}
                onError={() => setAvatarImageFailed(true)}
              />
            ) : (
              <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: 24, fontWeight: "bold", color: "#FFF" }}>
                  {user?.firstName?.[0] || "U"}
                </Text>
              </View>
            )}
            <Text style={{ fontSize: 18, fontWeight: "600", color: COLORS.text, marginTop: 12 }}>{userName}</Text>
            <Text style={{ fontSize: 14, color: COLORS.textLight }}>{userEmail}</Text>
          </View>
        </View> */}

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadTransactionHistory(false)}
              tintColor={COLORS.primary}
            />
          }
        >
          <Text style={{ color: COLORS.textLight, textAlign: "center", fontSize: 15 }}>
            Create or join a meal group from Home.
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadTransactionHistory(false)}
            tintColor={COLORS.primary}
          />
        }
      >
        <View style={styles.content}>
          {/* Header */}
          {/* <View style={{ alignItems: "center", paddingVertical: 16, marginBottom: 20 }}>
            {user?.imageUrl && !avatarImageFailed ? (
              <Image
                source={{ uri: user.imageUrl }}
                style={{ width: 60, height: 60, borderRadius: 30 }}
                onError={() => setAvatarImageFailed(true)}
              />
            ) : (
              <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: 24, fontWeight: "bold", color: "#FFF" }}>
                  {user?.firstName?.[0] || "U"}
                </Text>
              </View>
            )}
            <Text style={{ fontSize: 18, fontWeight: "600", color: COLORS.text, marginTop: 12 }}>{userName}</Text>
            <Text style={{ fontSize: 14, color: COLORS.textLight }}>{userEmail}</Text>
          </View> */}

          {/* Error Message */}
          {errorMessage && (
            <Text
              style={{
                color: COLORS.expense,
                marginBottom: 12,
                fontWeight: "600",
                paddingHorizontal: 20,
              }}
            >
              {errorMessage}
            </Text>
          )}

          {/* Tab Navigation */}
          <View
            style={{
              flexDirection: "row",
              paddingHorizontal: 20,
              marginBottom: 16,
              gap: 8,
            }}
          >
            {["summary", "deposits", "expenses"].map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab as "summary" | "deposits" | "expenses")}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 8,
                  alignItems: "center",
                  backgroundColor:
                    activeTab === tab ? COLORS.primary : COLORS.border,
                }}
              >
                <Text
                  style={{
                    color: activeTab === tab ? "#FFF" : COLORS.textLight,
                    fontWeight: "600",
                    textTransform: "capitalize",
                  }}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Summary Tab */}
          {activeTab === "summary" && (
              <View style={{ paddingHorizontal: 10}}>
                {backendUser && mealGroup && (
                  <View
                    style={{
                      backgroundColor: COLORS.card,
                      borderRadius: 16,
                      padding: 20,
                      marginBottom: 12,
                      borderLeftWidth: 5,
                      borderLeftColor: COLORS.primary,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 3 },
                      shadowOpacity: 0.1,
                      shadowRadius: 6,
                      elevation: 4,
                    }}
                  >
                    {/* Top Labels */}
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <View style={{ gap: 4 }}>
                        <Text style={{ color: COLORS.textLight, fontSize: 12 }}>Your Deposits</Text>
                        <Text style={{ fontSize: 16, fontWeight: "700", color: COLORS.primary }}>
                          {formatCurrency(userDeposits)}
                        </Text>
                      </View>


                      <View
                        style={{
                          height: 32,
                          width: 1,
                          backgroundColor: COLORS.border || "#E0E0E0",
                        }}
                      />
                      
                      <View style={{ gap: 4 }}>
                        <Text style={{ color: COLORS.textLight, fontSize: 12 }}>
                        {userBalance.label}
                      </Text>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "700",
                          color:
                            userBalance.balance >= 0
                              ? COLORS.income // green
                              : COLORS.expense, // red
                        }}
                      >
                        {formatCurrency(Math.abs(userBalance.amount))}
                      </Text>
                      </View>
                    </View>


                    {/* Status Badge */}
                    <View
                      style={{
                        marginTop: 10,
                        alignSelf: "flex-start",
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 20,
                        backgroundColor:
                          userBalance.balance >= 0 ? "#dcfce7" : "#fee2e2",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "600",
                          color:
                            userBalance.balance >= 0 ? COLORS.income : COLORS.expense,
                        }}
                      >
                        {userBalance.balance >= 0 ? "Credit" : "Due"}
                      </Text>
                    </View>
                  </View>
              )}

              {/* Quick Stats */}
              <View
                style={{
                  marginTop: 16,
                  backgroundColor: COLORS.background,
                  borderRadius: 8,
                  padding: 16,
                  gap: 12,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    paddingBottom: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: COLORS.border,
                  }}
                >
                  <Text style={{ color: COLORS.textLight }}>Total Deposits</Text>
                  <Text style={{ fontWeight: "600", color: COLORS.primary }}>
                    {formatCurrency(totalDeposits)}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    paddingBottom: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: COLORS.border,
                  }}
                >
                  <Text style={{ color: COLORS.textLight }}>Total Expenses</Text>
                  <Text style={{ fontWeight: "600", color: COLORS.expense }}>
                    {formatCurrency(totalExpenses)}
                  </Text>
                </View>

                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ color: COLORS.textLight }}>Net Balance</Text>
                  <Text
                    style={{
                      fontWeight: "600",
                      color: totalDeposits - totalExpenses >= 0 ? COLORS.primary : COLORS.expense,
                    }}
                  >
                    {formatCurrency(totalDeposits - totalExpenses)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Deposits Tab */}
          {activeTab === "deposits" && (
            <View style={{ paddingHorizontal: 20 , paddingBottom: 100}}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
                <Text style={{ fontSize: 18, fontWeight: "600", color: COLORS.text, marginBottom: 0 }}>Deposits</Text>
                <TouchableOpacity
                  onPress={() => setDepositModalVisible(true)}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    backgroundColor: COLORS.primary,
                    borderRadius: 6,
                  }}
                >
                  <Text style={{ color: "#FFF", fontSize: 12, fontWeight: "600" }}>
                    Add Deposit
                  </Text>
                </TouchableOpacity>
              </View>

              {deposits.length === 0 ? (
                <Text style={{ color: COLORS.textLight, textAlign: "center", paddingVertical: 20 }}>
                  No deposits yet.
                </Text>
              ) : (
                <FlatList
                  data={deposits}
                  keyExtractor={(item) => item._id}
                  scrollEnabled={false}
                  renderItem={({ item }) => (
                    <View
                      style={{
                        backgroundColor: COLORS.card,
                        borderRadius: 12,
                        padding: 12,
                        marginBottom: 10,
                        borderLeftWidth: 4,
                        borderLeftColor: COLORS.primary,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.1,
                        shadowRadius: 2,
                        elevation: 2,
                      }}
                    >
                      <View style={{ flex: 1}}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between"}}>
                          <Text style={{ fontWeight: "600", color: COLORS.text }}>
                            {formatCurrency(item.amount)}
                          </Text>
                          {item.user && (
                          <Text style={{ fontSize: 12, color: COLORS.textLight, marginTop: 2 }}>
                            BY: {typeof item.user === "string" ? item.user : item.user.name}
                          </Text>
                          )}
                          <Text style={{ fontSize: 12, color: COLORS.textLight, marginTop: 4 }}>
                            {formatDate(item.date)}
                          </Text>
                        </View>
                        <View style={{ flexDirection: "row", justifyContent: "space-between"}}>

                          {item.note && (
                            <Text style={{ fontSize: 11, color: COLORS.textLight, marginTop: 4 }}>
                              Note: {item.note}
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>
                  )}
                />
              )}
            </View>
          )}

          {/* Expenses Tab */}
          {activeTab === "expenses" && (
            <View style={{ paddingHorizontal: 20 , paddingBottom: 100}}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
                <Text style={{ fontSize: 18, fontWeight: "600", color: COLORS.text, marginBottom: 0 }}>Expenses</Text>
                {isManager && (
                  <TouchableOpacity
                    onPress={() => setExpenseModalVisible(true)}
                    style={{
                      paddingVertical: 6,
                      paddingHorizontal: 12,
                      backgroundColor: COLORS.expense,
                      borderRadius: 6,
                    }}
                  >
                    <Text style={{ color: "#FFF", fontSize: 12, fontWeight: "600" }}>
                      Add Expense
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {!isManager && (
                <Text style={{ color: COLORS.textLight, fontSize: 12, marginBottom: 12 }}>
                  Only managers can add expenses.
                </Text>
              )}

              {expenses.length === 0 ? (
                <Text style={{ color: COLORS.textLight, textAlign: "center", paddingVertical: 20 }}>
                  No expenses yet.
                </Text>
              ) : (
                <FlatList
                  data={expenses}
                  keyExtractor={(item) => item._id}
                  scrollEnabled={false}
                  renderItem={({ item }) => (
                    <View
                      style={{
                        backgroundColor: COLORS.card,
                        borderRadius: 12,
                        padding: 12,
                        marginBottom: 10,
                        borderLeftWidth: 4,
                        borderLeftColor: COLORS.primary,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.1,
                        shadowRadius: 2,
                        elevation: 2,
                      }}
                    >
                      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontWeight: "600", color: COLORS.text }}>
                            {item.title}
                          </Text>
                          <Text style={{ fontSize: 12, color: COLORS.expense, marginTop: 4, fontWeight: "600" }}>
                            {formatCurrency(item.amount)}
                          </Text>
                          <Text style={{ fontSize: 12, color: COLORS.textLight, marginTop: 4 }}>
                            {formatDate(item.date)}
                          </Text>
                          {item.user && (
                            <Text style={{ fontSize: 12, color: COLORS.textLight, marginTop: 2 }}>
                              By: {typeof item.user === "string" ? item.user : item.user.name}
                            </Text>
                          )}
                          {item.note && (
                            <Text style={{ fontSize: 11, color: COLORS.textLight, marginTop: 4 }}>
                              Note: {item.note}
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>
                  )}
                />
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Deposit Modal */}
      <Modal
        visible={depositModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeDepositModal}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: COLORS.background,
              borderRadius: 12,
              padding: 20,
              width: "85%",
            }}
          >
            <Text style={{ fontWeight: "700", fontSize: 16, marginBottom: 16, textAlign: "center" }}>
              Add Deposit
            </Text>

            <View style={{ marginBottom: 12 }}>
              <Text style={{ color: COLORS.textLight, fontSize: 12, marginBottom: 4 }}>
                Amount (BDT)
              </Text>
              <TextInput
                style={{ borderColor: COLORS.border, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: COLORS.text }}
                placeholder="0"
                value={depositAmount}
                onChangeText={setDepositAmount}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={{ marginBottom: 12 }}>
              <Text style={{ color: COLORS.textLight, fontSize: 12, marginBottom: 4 }}>
                Note
              </Text>
              <TextInput
                style={{ borderColor: COLORS.border, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: COLORS.text }}
                placeholder="Add a note..."
                value={depositNote}
                onChangeText={setDepositNote}
                multiline
              />
            </View>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                onPress={closeDepositModal}
                disabled={actionLoading}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  backgroundColor: COLORS.border,
                  borderRadius: 8,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveDeposit}
                disabled={actionLoading}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  backgroundColor: COLORS.primary,
                  borderRadius: 8,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#FFF", fontWeight: "600" }}>
                  {actionLoading ? "Saving..." : "Add"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Expense Modal */}
      <Modal
        visible={expenseModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeExpenseModal}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: COLORS.background,
              borderRadius: 12,
              padding: 20,
              width: "85%",
            }}
          >
            <Text style={{ fontWeight: "700", fontSize: 16, marginBottom: 16, textAlign: "center" }}>
              Add Expense
            </Text>

            <View style={{ marginBottom: 12 }}>
              <Text style={{ color: COLORS.textLight, fontSize: 12, marginBottom: 4 }}>
                Title
              </Text>
              <TextInput
                style={{ borderColor: COLORS.border, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: COLORS.text }}
                placeholder="e.g., Rice, Oil, Vegetables"
                value={expenseTitle}
                onChangeText={setExpenseTitle}
              />
            </View>

            <View style={{ marginBottom: 12 }}>
              <Text style={{ color: COLORS.textLight, fontSize: 12, marginBottom: 4 }}>
                Amount
              </Text>
              <TextInput
                style={{ borderColor: COLORS.border, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: COLORS.text }}
                placeholder="1000"
                value={expenseAmount}
                onChangeText={setExpenseAmount}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: COLORS.textLight, fontSize: 12, marginBottom: 4 }}>
                Note (Optional)
              </Text>
              <TextInput
                style={{ borderColor: COLORS.border, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: COLORS.text }}
                placeholder="Add a note..."
                value={expenseNote}
                onChangeText={setExpenseNote}
                multiline
              />
            </View>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                onPress={closeExpenseModal}
                disabled={actionLoading}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  backgroundColor: COLORS.border,
                  borderRadius: 8,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveExpense}
                disabled={actionLoading}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  backgroundColor: COLORS.expense,
                  borderRadius: 8,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#FFF", fontWeight: "600" }}>
                  {actionLoading ? "Saving..." : "Add"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
