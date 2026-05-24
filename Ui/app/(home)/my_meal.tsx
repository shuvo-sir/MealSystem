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
import { useMealHistory, MealHistoryFilter } from "./_hooks/useMealHistory";
import { styles } from "@/assets/styles/home.styles";
import { COLORS } from "@/constants/colors";
import { MealEntry } from "./_types/homeScreen.types";
import { BalanceCard } from "@/components/BalanceCard";

export default function MyMealScreen() {
  const { user } = useUser();
  const [avatarImageFailed, setAvatarImageFailed] = useState(false);

  // Meal history hook
  const {
    backendUser,
    mealGroup,
    entries,
    isLoading,
    refreshing,
    actionLoading,
    errorMessage,
    selectedFilter,
    loadMealHistory,
    handleFilterChange,
    handleUpdateEntry,
    handleDeleteEntry,
  } = useMealHistory();

  // Filter UI state
  const [startDateInput, setStartDateInput] = useState("");
  const [endDateInput, setEndDateInput] = useState("");
  const [mealTypeFilter, setMealTypeFilter] = useState<"all" | "breakfast" | "lunch" | "dinner">("all");

  // Edit modal state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<MealEntry | null>(null);
  const [editBreakfast, setEditBreakfast] = useState("");
  const [editLunch, setEditLunch] = useState("");
  const [editDinner, setEditDinner] = useState("");

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

  const handleApplyFilters = async () => {
    const newFilter: MealHistoryFilter = {
      mealType: mealTypeFilter,
    };

    if (startDateInput.trim()) {
      newFilter.startDate = startDateInput;
    }
    if (endDateInput.trim()) {
      newFilter.endDate = endDateInput;
    }

    await handleFilterChange(newFilter);
  };

  const openEditModal = (entry: MealEntry) => {
    setSelectedEntry(entry);
    setEditBreakfast(String(entry.breakfast || 0));
    setEditLunch(String(entry.lunch || 0));
    setEditDinner(String(entry.dinner || 0));
    setEditModalVisible(true);
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    setSelectedEntry(null);
    setEditBreakfast("");
    setEditLunch("");
    setEditDinner("");
  };

  const handleSaveEdit = async () => {
    if (!selectedEntry) return;

    const breakfast = parseFloat(editBreakfast) || 0;
    const lunch = parseFloat(editLunch) || 0;
    const dinner = parseFloat(editDinner) || 0;

    if (breakfast < 0 || lunch < 0 || dinner < 0) {
      Alert.alert("Invalid input", "Meal values must be non-negative.");
      return;
    }

    await handleUpdateEntry(
      selectedEntry._id,
      {
        breakfast,
        lunch,
        dinner,
      },
      closeEditModal
    );
  };

  const handleConfirmDelete = (entryId: string) => {
    Alert.alert("Delete entry", "Are you sure you want to delete this meal entry?", [
      { text: "Cancel", onPress: () => {}, style: "cancel" },
      {
        text: "Delete",
        onPress: () => handleDeleteEntry(entryId),
        style: "destructive",
      },
    ]);
  };

  const totalMeals = useMemo(
    () => entries.reduce((sum, entry) => sum + (entry.totalMeals || 0), 0),
    [entries]
  );

  const mealCost = (totalMeals || 0) * (mealGroup?.mealRate || 0);
  const balanceAfterMeals = (backendUser?.balance || 0) - mealCost;

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
              onRefresh={() => loadMealHistory(false)}
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
            onRefresh={() => loadMealHistory(false)}
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
          </View>

          {/* Balance Card */}
          {backendUser && mealGroup && (
            <BalanceCard
              summary={{
                balance: backendUser.balance,
                mealRate: mealGroup.mealRate,
                totalExpenses: mealCost,
              }}
            />
          )}

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

          {/* Filters Section */}
          <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: "600", color: COLORS.text, marginTop: 10, marginBottom: 10 }}>Filters</Text>

            {/* Date Range */}
            <View style={{ marginBottom: 12 }}>
              <Text style={{ color: COLORS.textLight, fontSize: 12, marginBottom: 4 }}>
                Start Date (YYYY-MM-DD)
              </Text>
              <TextInput
                style={{ borderColor: COLORS.border, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: COLORS.text }}
                placeholder="2024-01-01"
                value={startDateInput}
                onChangeText={setStartDateInput}
              />
            </View>

            <View style={{ marginBottom: 12 }}>
              <Text style={{ color: COLORS.textLight, fontSize: 12, marginBottom: 4 }}>
                End Date (YYYY-MM-DD)
              </Text>
              <TextInput
                style={{ borderColor: COLORS.border, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: COLORS.text }}
                placeholder="2024-12-31"
                value={endDateInput}
                onChangeText={setEndDateInput}
              />
            </View>

            {/* Meal Type Toggle */}
            <View style={{ marginBottom: 12 }}>
              <Text style={{ color: COLORS.textLight, fontSize: 12, marginBottom: 8 }}>
                Meal Type
              </Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {["all", "breakfast", "lunch", "dinner"].map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() =>
                      setMealTypeFilter(type as "all" | "breakfast" | "lunch" | "dinner")
                    }
                    style={{
                      paddingVertical: 6,
                      paddingHorizontal: 12,
                      borderRadius: 20,
                      backgroundColor:
                        mealTypeFilter === type ? COLORS.primary : COLORS.border,
                    }}
                  >
                    <Text
                      style={{
                        color:
                          mealTypeFilter === type ? "#FFF" : COLORS.textLight,
                        fontSize: 12,
                        fontWeight: "600",
                        textTransform: "capitalize",
                      }}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Apply Button */}
            <TouchableOpacity
              onPress={handleApplyFilters}
              style={{
                backgroundColor: COLORS.primary,
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#FFF", fontWeight: "600" }}>Apply Filters</Text>
            </TouchableOpacity>
          </View>

          {/* Meals List */}
          <View style={{ paddingHorizontal: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: "600", color: COLORS.text, marginBottom: 10 }}>Meal History</Text>

            {entries.length === 0 ? (
              <Text style={{ color: COLORS.textLight, textAlign: "center", paddingVertical: 20 }}>
                No meal entries found.
              </Text>
            ) : (
              <FlatList
                data={entries}
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
                      <View>
                        <Text style={{ fontWeight: "600", color: COLORS.text }}>
                          {item.date}
                        </Text>
                        <Text style={{ fontSize: 12, color: COLORS.textLight, marginTop: 4 }}>
                          B: {item.breakfast} | L: {item.lunch} | D: {item.dinner}
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            color: COLORS.primary,
                            marginTop: 4,
                            fontWeight: "600",
                          }}
                        >
                          Total: {item.totalMeals} meal{item.totalMeals !== 1 ? "s" : ""}
                        </Text>
                        {item.note && (
                          <Text style={{ fontSize: 11, color: COLORS.textLight, marginTop: 4 }}>
                            Note: {item.note}
                          </Text>
                        )}
                      </View>

                      {/* Edit & Delete Buttons */}
                      <View style={{ gap: 8 }}>
                        <TouchableOpacity
                          onPress={() => openEditModal(item)}
                          disabled={actionLoading}
                          style={{
                            paddingVertical: 6,
                            paddingHorizontal: 12,
                            backgroundColor: COLORS.primary,
                            borderRadius: 6,
                          }}
                        >
                          <Text style={{ color: "#FFF", fontSize: 12, fontWeight: "600" }}>
                            Edit
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => handleConfirmDelete(item._id)}
                          disabled={actionLoading}
                          style={{
                            paddingVertical: 6,
                            paddingHorizontal: 12,
                            backgroundColor: COLORS.expense,
                            borderRadius: 6,
                          }}
                        >
                          <Text style={{ color: "#FFF", fontSize: 12, fontWeight: "600" }}>
                            Delete
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}
              />
            )}
          </View>
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeEditModal}
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
              Edit Meal Entry - {selectedEntry?.date}
            </Text>

            <View style={{ marginBottom: 12 }}>
              <Text style={{ color: COLORS.textLight, fontSize: 12, marginBottom: 4 }}>
                Breakfast
              </Text>
              <TextInput
                style={{ borderColor: COLORS.border, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: COLORS.text }}
                placeholder="0"
                value={editBreakfast}
                onChangeText={setEditBreakfast}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={{ marginBottom: 12 }}>
              <Text style={{ color: COLORS.textLight, fontSize: 12, marginBottom: 4 }}>
                Lunch
              </Text>
              <TextInput
                style={{ borderColor: COLORS.border, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: COLORS.text }}
                placeholder="0"
                value={editLunch}
                onChangeText={setEditLunch}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: COLORS.textLight, fontSize: 12, marginBottom: 4 }}>
                Dinner
              </Text>
              <TextInput
                style={{ borderColor: COLORS.border, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: COLORS.text }}
                placeholder="0"
                value={editDinner}
                onChangeText={setEditDinner}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                onPress={closeEditModal}
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
                onPress={handleSaveEdit}
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
                  {actionLoading ? "Saving..." : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
