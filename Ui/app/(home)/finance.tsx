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
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "@clerk/expo";
import { LoadingScreen } from "@/shared/components/LoadingScreen";
import { useFinanceHistory, FinanceFilter, Transaction } from "./_hooks/useFinanceHistory";
import { styles } from "@/assets/styles/home.styles";
import { COLORS } from "@/constants/colors";
import { BalanceCard } from "@/components/BalanceCard";

export default function FinanceScreen() {
  const { user } = useUser();
  const [avatarImageFailed, setAvatarImageFailed] = useState(false);

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
            <View style={{ paddingHorizontal: 20 }}>
              {backendUser && mealGroup && (
                <BalanceCard
                  summary={{
                    balance: backendUser.balance,
                    mealRate: mealGroup.mealRate,
                    totalExpenses: totalExpenses,
                  }}
                />
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
            <View style={{ paddingHorizontal: 20 }}>
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
                        backgroundColor: COLORS.background,
                        borderRadius: 8,
                        padding: 12,
                        marginBottom: 10,
                        borderLeftWidth: 4,
                        borderLeftColor: COLORS.primary,
                      }}
                    >
                      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontWeight: "600", color: COLORS.text }}>
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

          {/* Expenses Tab */}
          {activeTab === "expenses" && (
            <View style={{ paddingHorizontal: 20 }}>
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
                        backgroundColor: COLORS.background,
                        borderRadius: 8,
                        padding: 12,
                        marginBottom: 10,
                        borderLeftWidth: 4,
                        borderLeftColor: COLORS.expense,
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
            <Text style={{ fontWeight: "700", fontSize: 16, marginBottom: 16 }}>
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
            <Text style={{ fontWeight: "700", fontSize: 16, marginBottom: 16 }}>
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
