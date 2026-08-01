import React, { useMemo, useState } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoadingScreen } from "@/shared/components/LoadingScreen";
import { useFinanceHistory } from "../../shared/hooks/useFinanceHistory";
import { styles } from "@/assets/styles/home.styles";
import { COLORS } from "@/constants/colors";


export default function FinanceScreen() {
  // Finance history hook
  const {
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
    isManager,
    monthYearLabel,
    goToPreviousMonth,
    goToNextMonth,
    resetToCurrentMonth,
    loadTransactionHistory,
    handleAddDeposit,
    handleAddExpense,
    handleAddFinanceAdjustment,
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

  // Credit / Due form
  const [adjustmentModalVisible, setAdjustmentModalVisible] = useState(false);
  const [selectedAdjustmentUserId, setSelectedAdjustmentUserId] = useState("");
  const [adjustmentType, setAdjustmentType] = useState<"credit" | "due">("credit");
  const [adjustmentAmount, setAdjustmentAmount] = useState("");
  const [adjustmentNote, setAdjustmentNote] = useState("");

// Calculate total meals for the selected month
 const userMealsThisMonth = useMemo(() => {
  if (!backendUser?._id) return 0;

  let total = 0;

  for (const entry of entries) {
    if (entry.user?._id === backendUser._id || entry.user === backendUser._id) {
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

  const userAdjustmentThisMonth = useMemo(() => {
    if (!backendUser?._id) return 0;

    return adjustments
      .filter((adjustment) => (adjustment.user?._id || adjustment.user) === backendUser._id)
      .reduce((sum, adjustment) => {
        const signed = adjustment.adjustmentType === "due" ? -adjustment.amount : adjustment.amount;
        return sum + signed;
      }, 0);
  }, [adjustments, backendUser?._id]);

const userBalance = useMemo(() => {
  const balance = userAdjustmentThisMonth + userDeposits - mealCostThisMonth;

  return {
    amount: Math.abs(balance),
    isDue: balance < 0,
    label: balance < 0 ? "Amount Due" : "Available Balance",
    balance,
  };
}, [userAdjustmentThisMonth, userDeposits, mealCostThisMonth]);

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

  const closeAdjustmentModal = () => {
    setAdjustmentModalVisible(false);
    setSelectedAdjustmentUserId("");
    setAdjustmentType("credit");
    setAdjustmentAmount("");
    setAdjustmentNote("");
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

  const handleSaveAdjustment = async () => {
    const amount = parseFloat(adjustmentAmount);

    if (!selectedAdjustmentUserId) {
      Alert.alert("Missing member", "Please select a member.");
      return;
    }

    if (!amount || amount <= 0) {
      Alert.alert("Invalid amount", "Please enter a valid amount.");
      return;
    }

    await handleAddFinanceAdjustment(
      selectedAdjustmentUserId,
      adjustmentType,
      amount,
      adjustmentNote,
      closeAdjustmentModal
    );
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

  const memberSummaries = useMemo(() => {
  if (!backendUser?._id) return [];
  if (!isManager) return [];

  const mealRate = mealGroup?.mealRate || 0;

  const mealMap = new Map<string, number>();
  const depositMap = new Map<string, number>();
  const adjustmentMap = new Map<string, number>();
  const userInfoMap = new Map<string, any>();

  for (const member of members) {
    if (!member?._id) continue;
    userInfoMap.set(member._id, member);
    mealMap.set(member._id, 0);
    depositMap.set(member._id, 0);
    adjustmentMap.set(member._id, 0);
  }

  for (const entry of entries) {
    const userId = entry.user?._id || entry.user;
    if (!userId) continue;

    mealMap.set(
      userId,
      (mealMap.get(userId) || 0) + (entry.totalMeals || 0)
    );

    if (!userInfoMap.has(userId)) {
      userInfoMap.set(userId, entry.user);
    }
  }

  for (const dep of deposits) {
    const userId = dep.user?._id || dep.user;
    if (!userId) continue;

    depositMap.set(
      userId,
      (depositMap.get(userId) || 0) + (dep.amount || 0)
    );

    if (!userInfoMap.has(userId)) {
      userInfoMap.set(userId, dep.user);
    }
  }

  for (const adjustment of adjustments) {
    const userId = adjustment.user?._id || adjustment.user;
    if (!userId) continue;

    const signedAmount = adjustment.adjustmentType === "due"
      ? -(adjustment.amount || 0)
      : (adjustment.amount || 0);

    adjustmentMap.set(
      userId,
      (adjustmentMap.get(userId) || 0) + signedAmount
    );

    if (!userInfoMap.has(userId)) {
      userInfoMap.set(userId, adjustment.user);
    }
  }

  const allUserIds = new Set([
    ...members.map((member) => member._id),
    ...mealMap.keys(),
    ...depositMap.keys(),
    ...adjustmentMap.keys(),
  ]);

  return Array.from(allUserIds).map((userId) => {
    const totalMeals = mealMap.get(userId) || 0;
    const totalDeposits = depositMap.get(userId) || 0;
    const totalAdjustment = adjustmentMap.get(userId) || 0;

    const mealCost = totalMeals * mealRate;
    const balance = totalAdjustment + totalDeposits - mealCost;

    const user = userInfoMap.get(userId);

    return {
      userId,
      name:
        user?.name ||
        user?.fullName ||
        user?.email ||
        "Unknown User",
      totalMeals,
      totalDeposits,
      totalAdjustment,
      mealCost,
      balance,
    };
  }).sort((a, b) => a.name.localeCompare(b.name));
}, [isManager, entries, deposits, adjustments, mealGroup?.mealRate, backendUser?._id, members]);

  const handleMonthChange = (delta: number) => {
    if (delta < 0) goToPreviousMonth();
    else if (delta > 0) goToNextMonth();
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
              <View style={{ paddingHorizontal: 8, paddingBottom: 100 }}>
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
                        <Text style={{ color: COLORS.textLight, fontSize: 12 }}>{userBalance.label}</Text>
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
              {isManager && (
                <View style={{ marginTop: 20, paddingHorizontal: 8 }}>

                {/* Month Navigation and credit and due management */}
                  <View style={{ marginBottom: 14, gap: 10 }}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <TouchableOpacity onPress={() => handleMonthChange(-1)} style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: COLORS.border }}>
                          <Text style={{ color: COLORS.text, fontWeight: "700" }}>{"<"}</Text>
                        </TouchableOpacity>

                        <Text style={{ fontSize: 16, fontWeight: "700", color: COLORS.text }}>{monthYearLabel}</Text>

                        <TouchableOpacity onPress={() => handleMonthChange(1)} style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: COLORS.border }}>
                          <Text style={{ color: COLORS.text, fontWeight: "700" }}>{">"}</Text>
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity onPress={resetToCurrentMonth} style={{ alignSelf: "center", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, backgroundColor: COLORS.primary }}>
                        <Text style={{ color: "#FFF", fontSize: 12, fontWeight: "700" }}>Reset to Current Month</Text>
                      </TouchableOpacity>

                        {isManager && (
                          <TouchableOpacity
                            onPress={() => setAdjustmentModalVisible(true)}
                            style={{ alignSelf: "center", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, backgroundColor: COLORS.expense }}
                          >
                            <Text style={{ color: "#FFF", fontSize: 12, fontWeight: "700" }}>Add Credit / Due</Text>
                          </TouchableOpacity>
                        )}
                    </View>
                  
                  {/* TITLE */}
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      marginBottom: 10,
                      color: COLORS.text,
                    }}
                  >
                    All Members Overview....
                  </Text>

                  {/* HEADER */}
                  <View
                    style={{
                      flexDirection: "row",
                      paddingVertical: 10,
                      borderBottomWidth: 2,
                      borderBottomColor: COLORS.border,
                      backgroundColor: COLORS.background,

                    }}
                  >
                    <Text
                      style={{
                        flex: 0.9,
                        fontSize: 12,
                        fontWeight: "700",
                        color: COLORS.textLight,
                        textAlign: "center",
                      }}
                    >
                      Name
                    </Text>

                    <Text
                      style={{
                        flex: 1.3,
                        fontSize: 12,
                        fontWeight: "700",
                        color: COLORS.textLight,
                        textAlign: "center",
                      }}
                    >
                      Deposits
                    </Text>

                    <Text
                      style={{
                        flex: 1.7,
                        fontSize: 12,
                        fontWeight: "700",
                        color: COLORS.textLight,
                        textAlign: "center",
                      }}
                    >
                      Adjustment
                    </Text>

                    <Text
                      style={{
                        flex: 0.9,
                        fontSize: 12,
                        fontWeight: "700",
                        color: COLORS.textLight,
                        textAlign: "center",
                      }}
                    >
                      Meals
                    </Text>

                    <Text
                      style={{
                        flex: 0.9,
                        fontSize: 12,
                        fontWeight: "700",
                        color: COLORS.textLight,
                        textAlign: "center",
                      }}
                    >
                      Cost
                    </Text>

                    <Text
                      style={{
                        flex: 1,
                        fontSize: 12,
                        fontWeight: "700",
                        color: COLORS.textLight,
                        textAlign: "center",
                      }}
                    >
                      Balance
                    </Text>
                  </View>

                  {/* ROWS */}
                  {memberSummaries.map((member) => (
                    <View
                      key={member.userId}
                      style={{
                        flexDirection: "row",
                        paddingVertical: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: COLORS.border,
                        alignItems: "center",
                        gap: 2
                      }}
                    >
                      {/* NAME */}
                      <Text
                        style={{
                          flex: 0.9,
                          fontSize: 13,
                          color: COLORS.text,
                          textAlign: "center",
                        }}
                      >
                        {member.name}
                      </Text>

                      {/* DEPOSITS */}
                      <Text
                        style={{
                          flex: 1.3,
                          fontSize: 13,
                          color: COLORS.primary,
                          textAlign: "center",
                          fontWeight: "600",
                        }}
                      >
                        {member.totalDeposits.toFixed(0)}
                      </Text>

                      {/* ADJUSTMENT */}
                      <Text
                        style={{
                          flex: 1.6,
                          fontSize: 13,
                          color: member.totalAdjustment >= 0 ? COLORS.income : COLORS.expense,
                          textAlign: "center",
                          fontWeight: "600",
                        }}
                      >
                        {member.totalAdjustment.toFixed(0)}
                      </Text>

                      {/* MEALS */}
                      <Text
                        style={{
                          flex: 0.9,
                          fontSize: 13,
                          color: COLORS.text,
                          textAlign: "center",
                        }}
                      >
                        {member.totalMeals}
                      </Text>

                      {/* COST */}
                      <Text
                        style={{
                          flex: 0.9,
                          fontSize: 13,
                          color: COLORS.text,
                          textAlign: "center",
                        }}
                      >
                        {member.mealCost.toFixed(0)}
                      </Text>

                      {/* BALANCE */}
                      <Text
                        style={{
                          flex: 1,
                          fontSize: 13,
                          fontWeight: "700",
                          textAlign: "center",
                          color:
                            member.balance >= 0
                              ? COLORS.income
                              : COLORS.expense,
                        }}
                      >
                        {member.balance.toFixed(0)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Quick Stats */}
              {/* <View
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
              </View> */}
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

      {/* Add Credit / Due Modal */}
      <Modal
        visible={adjustmentModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeAdjustmentModal}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 }}>
          <View style={{ backgroundColor: COLORS.card, borderRadius: 16, padding: 16, maxHeight: "80%" }}>
            <Text style={{ fontSize: 18, fontWeight: "700", color: COLORS.text, marginBottom: 12 }}>
              Add Credit / Due
            </Text>

            <Text style={{ fontSize: 12, color: COLORS.textLight, marginBottom: 8 }}>Select member</Text>
            <ScrollView style={{ maxHeight: 150, marginBottom: 12 }}>
              {members.map((member) => (
                <TouchableOpacity
                  key={member._id}
                  onPress={() => setSelectedAdjustmentUserId(member._id)}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    marginBottom: 8,
                    backgroundColor: selectedAdjustmentUserId === member._id ? COLORS.primary : COLORS.background,
                  }}
                >
                  <Text style={{ color: selectedAdjustmentUserId === member._id ? "#FFF" : COLORS.text, fontWeight: "600" }}>
                    {member.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
              <TouchableOpacity
                onPress={() => setAdjustmentType("credit")}
                style={{ flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: "center", backgroundColor: adjustmentType === "credit" ? COLORS.income : COLORS.border }}
              >
                <Text style={{ color: adjustmentType === "credit" ? "#FFF" : COLORS.textLight, fontWeight: "700" }}>Credit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setAdjustmentType("due")}
                style={{ flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: "center", backgroundColor: adjustmentType === "due" ? COLORS.expense : COLORS.border }}
              >
                <Text style={{ color: adjustmentType === "due" ? "#FFF" : COLORS.textLight, fontWeight: "700" }}>Due</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              value={adjustmentAmount}
              onChangeText={setAdjustmentAmount}
              placeholder="Amount"
              keyboardType="numeric"
              style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 12, marginBottom: 12, color: COLORS.text }}
            />

            <TextInput
              value={adjustmentNote}
              onChangeText={setAdjustmentNote}
              placeholder="Note (optional)"
              style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 12, marginBottom: 12, color: COLORS.text }}
            />

            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                onPress={closeAdjustmentModal}
                style={{ flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: COLORS.border, alignItems: "center" }}
              >
                <Text style={{ color: COLORS.text, fontWeight: "700" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveAdjustment}
                style={{ flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: COLORS.expense, alignItems: "center" }}
              >
                <Text style={{ color: "#FFF", fontWeight: "700" }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
