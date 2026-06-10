import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@clerk/expo";
import { BalanceCard } from "@/components/BalanceCard";
import { COLORS } from "@/constants/colors";
import { styles } from "../../../assets/styles/home.styles";
import { BackendUser, MealEntry, MealGroup, GroupNote } from "../_types/homeScreen.types";
import { formatNoteDate } from "../_utils/homeScreenHelpers";

interface DashboardScreenProps {
  backendUser: BackendUser | null;
  mealGroup: MealGroup | null;
  members: BackendUser[];
  entries: MealEntry[];
  notesList: GroupNote[];
  selectedMeals: number[];
  noteMessage: string;
  todayEntry: MealEntry | undefined;
  isActionLoading: boolean;
  refreshing: boolean;
  isRetrying: boolean;
  errorMessage: string | null;
  onMealSelect: (mealId: number) => void;
  onSaveMealEntry: () => void;
  onNoteMessageChange: (message: string) => void;
  onAddNote: () => void;
  onDeleteNote: (noteId: string) => void;
  onRefresh: () => void;
  onRetry: () => void;
  avatarImageFailed: boolean;
  onAvatarImageFailed: (failed: boolean) => void;
  userName: string;
}

const meals = [
  { id: 1, name: "Morning", icon: "sunny" },
  { id: 2, name: "Lunch", icon: "restaurant" },
  { id: 3, name: "Dinner", icon: "moon" },
];

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  backendUser,
  mealGroup,
  members,
  entries,
  notesList,
  selectedMeals,
  noteMessage,
  todayEntry,
  isActionLoading,
  refreshing,
  isRetrying,
  errorMessage,
  onMealSelect,
  onSaveMealEntry,
  onNoteMessageChange,
  onAddNote,
  onDeleteNote,
  onRefresh,
  onRetry,
  avatarImageFailed,
  onAvatarImageFailed,
  userName,
}) => {
  const { user } = useUser();

  const selectedMealNames = useMemo(
    () =>
      meals
        .filter((meal) => selectedMeals.includes(meal.id))
        .map((meal) => meal.name)
        .join(", "),
    [selectedMeals]
  );

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing || isRetrying}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
              enabled={!isRetrying}
            />
          }
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {user?.imageUrl && !avatarImageFailed ? (
                <Image
                  source={{ uri: user.imageUrl }}
                  style={[styles.headerLogo, { borderRadius: 50 }]}
                  onError={() => onAvatarImageFailed(true)}
                />
              ) : (
                <Image
                  source={require("../../../assets/images/icon.png")}
                  style={styles.headerLogo}
                />
              )}
              <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeText}>Welcome</Text>
                <Text style={styles.usernameText}>{userName}</Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => alert("Add Money")}
              >
                <Ionicons name="add-circle" size={24} color="#fff" />
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Error Card */}
          {errorMessage && (
            <View style={styles.errorCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
              {isRetrying ? (
                <View style={{ marginLeft: 12, justifyContent: "center" }}>
                  <ActivityIndicator size="small" color={COLORS.expense || "#ff6b6b"} />
                </View>
              ) : (
                <TouchableOpacity onPress={onRetry} style={{ marginLeft: 12 }}>
                  <Ionicons name="refresh" size={20} color={COLORS.expense || "#ff6b6b"} />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Group Card */}
          {mealGroup && (
            <View style={styles.groupCard}>
              <Text style={styles.groupName}>{mealGroup.groupName}</Text>
            </View>
          )}

          {/* Balance Card */}
          {mealGroup && (
            <>
              <BalanceCard
                groupName={mealGroup.groupName}
                summary={{
                  balance: backendUser?.balance || 0,
                  mealRate: mealGroup.mealRate || 0,
                  totalExpenses: mealGroup.totalExpense || 0,
                  totalDeposit: mealGroup.totalDeposit || 0,
                }}
              />

              {/* Quick Stats Section - Total Balance & Deposits */}
              <View
                style={{
                  marginTop: 16,
                  backgroundColor: COLORS.card,
                  borderRadius: 12,
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
                  <Text style={{ color: COLORS.textLight, fontSize: 14 }}>Total Balance</Text>
                  <Text style={{ fontWeight: "600", color: COLORS.primary, fontSize: 14 }}>
                    BDT {(backendUser?.balance || 0).toFixed(2)}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ color: COLORS.textLight, fontSize: 14 }}>Total Deposits</Text>
                  <Text style={{ fontWeight: "600", color: COLORS.income, fontSize: 14 }}>
                    BDT {(mealGroup?.totalDeposit || 0).toFixed(2)}
                  </Text>
                </View>
              </View>
            </>
          )}

          {/* Meal Selection Section */}
          <Text style={styles.mealSectionTitle}>Add Your Meal</Text>
          <View style={styles.mealCardsContainer}>
            {meals.map((meal) => {
              const isSelected = selectedMeals.includes(meal.id);
              return (
                <TouchableOpacity
                  key={meal.id}
                  style={[
                    styles.mealCard,
                    isSelected && styles.mealCardSelected,
                  ]}
                  onPress={() => onMealSelect(meal.id)}
                >
                  <Ionicons
                    name={meal.icon as any}
                    size={32}
                    color={isSelected ? "#fff" : "#FF8C42"}
                    style={styles.mealCardIcon}
                  />
                  <Text
                    style={[
                      styles.mealCardText,
                      isSelected && styles.mealCardTextSelected,
                    ]}
                  >
                    {meal.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Selected Meals Display */}
          {/* {selectedMeals.length > 0 && (
            <View style={styles.selectedMealsContainer}>
              <Text style={styles.selectedMealsText}>
                Selected: {selectedMealNames}
              </Text>
            </View>
          )} */}

          {/* Save Meal Button */}
          {selectedMeals.length > 0 && !todayEntry && (
            <TouchableOpacity
              style={[
                styles.primaryActionButton,
                isActionLoading && styles.primaryActionButtonDisabled,
              ]}
              onPress={onSaveMealEntry}
              disabled={isActionLoading}
            >
              {isActionLoading ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Ionicons name="checkmark" size={18} color={COLORS.white} />
              )}
              <Text style={styles.primaryActionButtonText}>Save Meal</Text>
            </TouchableOpacity>
          )}

          {/* Group Notes Section */}
          <Text style={styles.mealSectionTitle}>Group Notes</Text>
          <View style={styles.noteInputContainer}>
            <TextInput
              style={styles.noteInput}
              placeholder="e.g. Need Eggs, Onions 🧅🍳"
              placeholderTextColor={COLORS.textLight}
              multiline={true}
              numberOfLines={4}
              value={noteMessage}
              onChangeText={onNoteMessageChange}
            />
            <View style={styles.noteButtonsContainer}>
              <TouchableOpacity
                style={[
                  styles.noteSaveButton,
                  isActionLoading && styles.primaryActionButtonDisabled,
                ]}
                onPress={onAddNote}
                disabled={isActionLoading}
              >
                <Text style={styles.noteSaveButtonText}>Add Note</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Notes List Section */}
          <View style={styles.notesListContainer}>
            {notesList.length > 0 ? (
              <>
                <Text style={styles.notesListTitle}>
                  Group Notes ({notesList.length})
                </Text>
                {notesList.map((note) => (
                  <View key={note._id} style={styles.noteItem}>
                    <View style={styles.noteItemHeader}>
                      <View style={styles.noteItemContent}>
                        <Text style={styles.noteItemText}>
                          {note.message}
                        </Text>
                        <Text style={styles.noteItemTimestamp}>
                          {note.user?.name || "Anonymous"} •{" "}
                          {formatNoteDate(note.createdAt)}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.noteDeleteButton}
                        onPress={() => onDeleteNote(note._id)}
                      >
                        <Ionicons
                          name="trash"
                          size={18}
                          color="#FF6B6B"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </>
            ) : (
              <Text style={styles.emptyNotesText}>
                No notes yet. Add one to get started! 📝
              </Text>
            )}
          </View>

          {/* Members Section */}
          {members.length > 0 && (
            <View style={styles.notesListContainer}>
              <Text style={styles.notesListTitle}>
                Members ({members.length})
              </Text>
              {members.map((member) => (
                <View key={member._id} style={styles.noteItem}>
                  <View style={styles.noteItemContent}>
                    <Text style={styles.noteItemText}>{member.name}</Text>
                    <Text style={styles.noteItemTimestamp}>
                      {member.email} •{" "}
                      {member.role === "manager"
                        ? "👨‍💼 Manager"
                        : "👤 Member"}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
