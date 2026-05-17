import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
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
import { useAuth, useUser } from "@clerk/expo";
import { BalanceCard } from "@/components/BalanceCard";
import { COLORS } from "@/constants/colors";
import { addGroupNote, getGroupNotes } from "@/api/note.api";
import {
  addMealEntry,
  createMealGroup,
  getMyMealGroup,
  joinMeal,
} from "@/api/meal.api";
import { createUser } from "@/api/user.api";
import { styles } from "../../assets/styles/home.styles";

type BackendUser = {
  _id: string;
  name: string;
  email: string;
  role: "member" | "manager";
  mealGroup?: string | null;
  balance: number;
  totalMeals: number;
};

type MealGroup = {
  _id: string;
  groupName: string;
  inviteCode: string;
  totalExpense: number;
  totalDeposit: number;
  totalMeals: number;
  mealRate: number;
};

type MealEntry = {
  _id: string;
  user: string | Pick<BackendUser, "_id" | "name" | "email">;
  date: string;
  breakfast: number;
  lunch: number;
  dinner: number;
  totalMeals: number;
  note?: string;
};

type GroupNote = {
  _id: string;
  message: string;
  user?: Pick<BackendUser, "name">;
  createdAt: string;
};

type GroupAction = "create" | "join" | null;

const meals = [
  { id: 1, name: "Morning", icon: "sunny" },
  { id: 2, name: "Lunch", icon: "restaurant" },
  { id: 3, name: "Dinner", icon: "moon" },
];

const getLocalDateKey = () => {
  const now = new Date();
  const local = new Date(
    now.getTime() - now.getTimezoneOffset() * 60000
  );

  return local.toISOString().slice(0, 10);
};

const getErrorMessage = (error: any) =>
  error?.response?.data?.message ||
  error?.message ||
  "Something went wrong. Please try again.";

const getEntryUserId = (entry: MealEntry) =>
  typeof entry.user === "string" ? entry.user : entry.user?._id;

export default function HomeScreen() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [backendUser, setBackendUser] =
    useState<BackendUser | null>(null);
  const [mealGroup, setMealGroup] =
    useState<MealGroup | null>(null);
  const [members, setMembers] = useState<BackendUser[]>([]);
  const [entries, setEntries] = useState<MealEntry[]>([]);
  const [notesList, setNotesList] = useState<GroupNote[]>([]);
  const [selectedMeals, setSelectedMeals] = useState<number[]>([]);
  const [noteMessage, setNoteMessage] = useState("");
  const [groupAction, setGroupAction] =
    useState<GroupAction>(null);
  const [groupName, setGroupName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    null
  );
  const [avatarImageFailed, setAvatarImageFailed] = useState(false);

  const userName = useMemo(
    () =>
      [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
      user?.username ||
      user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ||
      "User",
    [
      user?.emailAddresses,
      user?.firstName,
      user?.lastName,
      user?.username,
    ]
  );

  const userEmail = useMemo(
    () =>
      user?.primaryEmailAddress?.emailAddress ||
      user?.emailAddresses?.[0]?.emailAddress ||
      "",
    [user?.emailAddresses, user?.primaryEmailAddress]
  );

  const todayKey = useMemo(() => getLocalDateKey(), []);

  const todayEntry = useMemo(
    () =>
      entries.find(
        (entry) =>
          entry.date === todayKey &&
          getEntryUserId(entry) === backendUser?._id
      ),
    [backendUser?._id, entries, todayKey]
  );

  const applyDashboard = useCallback((data: any) => {
    setBackendUser(data.user || null);
    setMealGroup(data.mealGroup || null);
    setMembers(data.members || []);
    setEntries(data.entries || []);
  }, []);

  const syncBackendUser = useCallback(async () => {
    if (!user?.id || !userEmail) {
      return;
    }

    await createUser({
      clerkId: user.id,
      name: userName,
      email: userEmail,
    });
  }, [user?.id, userEmail, userName]);



const loadDashboard = useCallback(async (showInitialLoader = false) => {
  if (!user?.id) return;

  if (showInitialLoader) setIsLoading(true);
  else setRefreshing(true);

  setErrorMessage(null);

  try {
    // 🔥 MOVE USER SYNC HERE (no separate function)
    if (user?.id && userEmail) {
      await createUser({
        clerkId: user.id,
        name: userName,
        email: userEmail,
      });
    }

    const token = await getToken();
    const dashboard = await getMyMealGroup(token);

    applyDashboard(dashboard);

    if (dashboard.mealGroup?._id) {
      const noteData = await getGroupNotes(dashboard.mealGroup._id, token);
      setNotesList(noteData.notes || []);
    } else {
      setNotesList([]);
    }
  } catch (error) {
    setErrorMessage(getErrorMessage(error));
  } finally {
    setIsLoading(false);
    setRefreshing(false);
  }
}, [user?.id, userEmail, userName, getToken, applyDashboard]);

  useEffect(() => {
    if (!user?.id) return;
    loadDashboard(true);
}, [user?.id, loadDashboard]);

  useEffect(() => {
    if (!todayEntry) {
      setSelectedMeals([]);
      return;
    }

    const savedMeals = [
      todayEntry.breakfast ? 1 : null,
      todayEntry.lunch ? 2 : null,
      todayEntry.dinner ? 3 : null,
    ].filter((mealId): mealId is number => Boolean(mealId));

    setSelectedMeals(savedMeals);
  }, [todayEntry]);

  const selectedMealNames = meals
    .filter((meal) => selectedMeals.includes(meal.id))
    .map((meal) => meal.name)
    .join(", ");

  const handleGroupSubmit = async () => {
    if (!groupAction) {
      return;
    }

    if (groupAction === "create" && !groupName.trim()) {
      Alert.alert("Missing group name", "Please enter a group name.");
      return;
    }

    if (groupAction === "join" && !inviteCode.trim()) {
      Alert.alert("Missing invite code", "Please enter an invite code.");
      return;
    }

    setActionLoading(true);

    try {
      const token = await getToken();
      const response =
        groupAction === "create"
          ? await createMealGroup(
              { groupName: groupName.trim() },
              token
            )
          : await joinMeal(
              { inviteCode: inviteCode.trim().toUpperCase() },
              token
            );

      applyDashboard(response);
      setGroupName("");
      setInviteCode("");
      setGroupAction(null);
      await loadDashboard(false);
      Alert.alert(
        "Success",
        groupAction === "create"
          ? "Meal group created."
          : "Meal group joined."
      );
    } catch (error) {
      Alert.alert("Error", getErrorMessage(error));
    } finally {
      setActionLoading(false);
    }
  };

  const handleMealSelect = (mealId: number) => {
    if (todayEntry) {
      return;
    }

    setSelectedMeals((current) =>
      current.includes(mealId)
        ? current.filter((id) => id !== mealId)
        : [...current, mealId]
    );
  };

  const handleSaveMealEntry = async () => {
    if (!backendUser || !mealGroup) {
      Alert.alert("Join a group", "Create or join a meal group first.");
      return;
    }

    if (selectedMeals.length === 0) {
      Alert.alert("Select meal", "Please select at least one meal.");
      return;
    }

    if (todayEntry) {
      Alert.alert("Already added", "Your meals are saved for today.");
      return;
    }

    setActionLoading(true);

    try {
      const token = await getToken();
      await addMealEntry(
        {
          userId: backendUser._id,
          date: todayKey,
          breakfast: selectedMeals.includes(1) ? 1 : 0,
          lunch: selectedMeals.includes(2) ? 1 : 0,
          dinner: selectedMeals.includes(3) ? 1 : 0,
        },
        token
      );

      await loadDashboard(false);
      Alert.alert("Success", "Meal entry added.");
    } catch (error) {
      Alert.alert("Error", getErrorMessage(error));
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!backendUser || !mealGroup) {
      Alert.alert("Join a group", "Create or join a meal group first.");
      return;
    }

    if (!noteMessage.trim()) {
      Alert.alert("Empty note", "Please enter a note.");
      return;
    }

    setActionLoading(true);

    try {
      const token = await getToken();
      await addGroupNote(
        {
          userId: backendUser._id,
          message: noteMessage.trim(),
        },
        token
      );

      setNoteMessage("");
      const noteData = await getGroupNotes(mealGroup._id, token);
      setNotesList(noteData.notes || []);
    } catch (error) {
      Alert.alert("Error", getErrorMessage(error));
    } finally {
      setActionLoading(false);
    }
  };

  const formatNoteDate = (dateValue: string) => {
    const date = new Date(dateValue);

    return `${date.toLocaleDateString()} ${date.toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    )}`;
  };

  const renderGroupSetup = () => (
    <View style={styles.setupCard}>
      <Text style={styles.setupTitle}>Meal Group</Text>
      <Text style={styles.setupSubtitle}>No meal group yet</Text>

      <View style={styles.setupActionRow}>
        <TouchableOpacity
          style={[
            styles.setupActionButton,
            groupAction === "create" && styles.setupActionButtonActive,
          ]}
          onPress={() => setGroupAction("create")}
        >
          <Ionicons
            name="add-circle"
            size={22}
            color={
              groupAction === "create" ? COLORS.white : COLORS.primary
            }
          />
          <Text
            style={[
              styles.setupActionText,
              groupAction === "create" && styles.setupActionTextActive,
            ]}
          >
            Create Meal
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.setupActionButton,
            groupAction === "join" && styles.setupActionButtonActive,
          ]}
          onPress={() => setGroupAction("join")}
        >
          <Ionicons
            name="enter"
            size={22}
            color={groupAction === "join" ? COLORS.white : COLORS.primary}
          />
          <Text
            style={[
              styles.setupActionText,
              groupAction === "join" && styles.setupActionTextActive,
            ]}
          >
            Join Meal
          </Text>
        </TouchableOpacity>
      </View>

      {groupAction && (
        <View style={styles.setupForm}>
          <TextInput
            style={styles.setupInput}
            placeholder={
              groupAction === "create" ? "Group name" : "Invite code"
            }
            placeholderTextColor={COLORS.textLight}
            autoCapitalize={
              groupAction === "join" ? "characters" : "words"
            }
            value={groupAction === "create" ? groupName : inviteCode}
            onChangeText={
              groupAction === "create" ? setGroupName : setInviteCode
            }
            editable={!actionLoading}
          />

          <TouchableOpacity
            style={[
              styles.primaryActionButton,
              actionLoading && styles.primaryActionButtonDisabled,
            ]}
            onPress={handleGroupSubmit}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Ionicons
                name={groupAction === "create" ? "checkmark" : "enter"}
                size={18}
                color={COLORS.white}
              />
            )}
            <Text style={styles.primaryActionButtonText}>
              {groupAction === "create" ? "Create Group" : "Join Group"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
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
            refreshing={refreshing}
            onRefresh={() => loadDashboard(false)}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* HEADER ALWAYS SHOWS */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.welcomeText}>Welcome</Text>
            <Text style={styles.usernameText}>{userName}</Text>
          </View>
        </View>

        {/* ERROR */}
        {errorMessage && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* 🟢 IMPORTANT CHANGE HERE */}
        {!mealGroup ? (
          renderGroupSetup()
        ) : (
          <>
            {/* YOUR FULL DASHBOARD (UNCHANGED) */}
            <View style={styles.groupCard}>
              <Text style={styles.groupName}>{mealGroup.groupName}</Text>
            </View>

            <BalanceCard
              summary={{
                balance: backendUser?.balance || 0,
                mealRate: mealGroup.mealRate || 0,
                totalExpenses: mealGroup.totalExpense || 0,
              }}
            />

            {/* REST OF YOUR UI REMAINS SAME */}
            {/* meals, notes, etc */}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>
);
}
