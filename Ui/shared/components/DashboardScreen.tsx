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
import { styles } from "@/assets/styles/home.styles";
import { BackendUser, MealEntry, MealGroup, GroupNote } from "../types/homeScreen.types";
import { formatNoteDate } from "../utils/homeScreenHelpers";

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
  errorMessage: string | null;
  onMealSelect: (mealId: number) => void;
  onSaveMealEntry: () => void;
  onNoteMessageChange: (message: string) => void;
  onAddNote: () => void;
  onDeleteNote: (noteId: string) => void;
  onRefresh: () => void;
  avatarImageFailed: boolean;
  onAvatarImageFailed: (failed: boolean) => void;
  userName: string;
}

const meals = [
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
  errorMessage,
  onMealSelect,
  onSaveMealEntry,
  onNoteMessageChange,
  onAddNote,
  onDeleteNote,
  onRefresh,
  avatarImageFailed,
  onAvatarImageFailed,
  userName,
}) => {
  const { user } = useUser();
  const [expandedCookingPeople, setExpandedCookingPeople] = React.useState(true);
  const [mealPreferences, setMealPreferences] = React.useState<{ lunch: boolean; dinner: boolean }>({
    lunch: true,
    dinner: true,
  });

  const toggleMealPreference = (mealType: 'lunch' | 'dinner') => {
    setMealPreferences((current) => ({
      ...current,
      [mealType]: !current[mealType],
    }));
  };

  const availableMeals = meals.filter((meal) => {
    if (meal.id === 2) return mealPreferences.lunch; // Lunch
    if (meal.id === 3) return mealPreferences.dinner; // Dinner
    return true;
  });

  const selectedMealNames = useMemo(
    () =>
      meals
        .filter((meal) => selectedMeals.includes(meal.id))
        .map((meal) => meal.name)
        .join(", "),
    [selectedMeals]
  );

  // Calculate how many people need each meal (based on today's entries)
  const getMealCount = useMemo(() => {
    return (mealId: number) => {
      const mealKey = mealId === 2 ? "lunch" : "dinner";
      return entries.filter((entry) => {
        const mealValue = entry[mealKey as keyof MealEntry];
        return mealValue && (mealValue as number) > 0;
      }).length || 0;
    };
  }, [entries]);

  // Get list of people cooking for a specific meal
  const getMealPeople = useMemo(() => {
    return (mealId: number) => {
      const mealKey = mealId === 2 ? "lunch" : "dinner";
      const cookingEntries = entries.filter((entry) => {
        const mealValue = entry[mealKey as keyof MealEntry];
        return mealValue && (mealValue as number) > 0;
      });

      return cookingEntries
        .map((entry) => {
          const member = members.find((m) => m._id === entry.userId);
          return member?.firstName || "Unknown";
        })
        .filter(Boolean);
    };
  }, [entries, members]);

  const toggleCookingPeople = () => {
    setExpandedCookingPeople(!expandedCookingPeople);
  };

  // Get all people cooking today
  const getAllCookingPeople = useMemo(() => {
    const cookingEntries = entries.filter((entry) => {
      const lunch = entry.lunch && (entry.lunch as number) > 0;
      const dinner = entry.dinner && (entry.dinner as number) > 0;
      return lunch || dinner;
    });

    return cookingEntries
      .map((entry) => {
        const member = members.find((m) => m._id === entry.userId);
        return member?.firstName || "Unknown";
      })
      .filter(Boolean);
  }, [entries, members]);

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
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
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
                  source={require("@/assets/images/icon.png")}
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
              <Text style={styles.errorText}>{errorMessage}</Text>
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
            <BalanceCard
              summary={{
                balance: mealGroup.totalDeposit || 0,
                mealRate: mealGroup.mealRate || 0,
                totalExpenses: mealGroup.totalExpense || 0,
                totalDeposit: mealGroup.totalDeposit || 0,
              }}
            />
          )}

          {/* Meal Preferences Section */}
          <Text style={styles.mealSectionTitle}>Meal Preferences</Text>
          <View
            style={{
              backgroundColor: COLORS.card,
              borderRadius: 12,
              padding: 12,
              marginHorizontal: 12,
              marginBottom: 16,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {/* Lunch Toggle */}
            <View style={{ flex: 1, alignItems: 'center' }}>
              <TouchableOpacity
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 8,
                  backgroundColor: mealPreferences.lunch ? COLORS.primary : COLORS.border,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
                onPress={() => toggleMealPreference('lunch')}
              >
                <Ionicons
                  name="restaurant"
                  size={28}
                  color={mealPreferences.lunch ? '#fff' : COLORS.textLight}
                />
              </TouchableOpacity>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: mealPreferences.lunch ? COLORS.text : COLORS.textLight,
                }}
              >
                {mealPreferences.lunch ? 'Lunch ON' : 'Lunch OFF'}
              </Text>
            </View>

            {/* Divider */}
            <View
              style={{
                width: 1,
                height: 80,
                backgroundColor: COLORS.border,
              }}
            />

            {/* Dinner Toggle */}
            <View style={{ flex: 1, alignItems: 'center' }}>
              <TouchableOpacity
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 8,
                  backgroundColor: mealPreferences.dinner ? COLORS.primary : COLORS.border,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
                onPress={() => toggleMealPreference('dinner')}
              >
                <Ionicons
                  name="moon"
                  size={28}
                  color={mealPreferences.dinner ? '#fff' : COLORS.textLight}
                />
              </TouchableOpacity>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: mealPreferences.dinner ? COLORS.text : COLORS.textLight,
                }}
              >
                {mealPreferences.dinner ? 'Dinner ON' : 'Dinner OFF'}
              </Text>
            </View>
          </View>

          {/* Meal Selection Section - Only show if at least one meal is ON */}
          {availableMeals.length > 0 && (
            <>
              <Text style={styles.mealSectionTitle}>Add Your Meal</Text>
              <View style={styles.mealCardsContainer}>
                {availableMeals.map((meal) => {
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
            </>
          )}
          




          {/* Cooking People Section */}
          <TouchableOpacity
            style={{
              backgroundColor: COLORS.border,
              borderRadius: 12,
              padding: 12,
              marginHorizontal: 12,
              marginBottom: 16,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
            onPress={toggleCookingPeople}
          >
            <View style={{ flex: 1 }}>
              <Text style={{
                fontWeight: '700',
                fontSize: 14,
                color: COLORS.text,
                marginBottom: 4,
              }}>
                👨‍🍳 People Cooking Today
              </Text>
              {!expandedCookingPeople && (
                <Text style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: COLORS.textLight,
                }}>
                  {getAllCookingPeople.length} people
                </Text>
              )}
            </View>
            <Ionicons
              name={expandedCookingPeople ? "chevron-up" : "chevron-down"}
              size={20}
              color={COLORS.primary}
            />
          </TouchableOpacity>

          {/* Cooking People Details */}
          {expandedCookingPeople && (
            <View style={{
              backgroundColor: COLORS.border,
              borderRadius: 12,
              padding: 12,
              marginHorizontal: 12,
              marginBottom: 16,
            }}>
              {getAllCookingPeople.length > 0 ? (
                <>
                  {getAllCookingPeople.map((name, index) => (
                    <View
                      key={index}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 8,
                        borderBottomWidth: index < getAllCookingPeople.length - 1 ? 1 : 0,
                        borderBottomColor: COLORS.lightBorder || '#e0e0e0',
                      }}
                    >
                      <View style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: COLORS.primary,
                        marginRight: 8,
                      }} />
                      <Text style={{
                        fontSize: 14,
                        color: COLORS.text,
                        fontWeight: '500',
                      }}>
                        {name}
                      </Text>
                    </View>
                  ))}
                </>
              ) : (
                <Text style={{
                  fontSize: 12,
                  color: COLORS.textLight,
                  fontStyle: 'italic',
                  textAlign: 'center',
                  paddingVertical: 8,
                }}>
                  No one cooking today
                </Text>
              )}
            </View>
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
