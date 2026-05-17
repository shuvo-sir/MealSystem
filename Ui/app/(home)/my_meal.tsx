import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth, useUser } from "@clerk/expo";
import { styles } from "@/assets/styles/myMeal.styles.js";
import { COLORS } from "@/constants/colors";
import { getMyMealGroup } from "@/api/meal.api";
import { createUser } from "@/api/user.api";

type BackendUser = {
  _id: string;
  name: string;
  email: string;
  role: "member" | "manager";
  balance: number;
  totalMeals: number;
};

type MealGroup = {
  _id: string;
  groupName: string;
  inviteCode: string;
  mealRate: number;
  totalExpense: number;
  totalMeals: number;
};

type MealEntry = {
  _id: string;
  user: string | Pick<BackendUser, "_id" | "name" | "email">;
  date: string;
  totalMeals: number;
};

type MemberRow = {
  id: string;
  name: string;
  meal: number;
  daily: number[];
};

const getErrorMessage = (error: any) =>
  error?.response?.data?.message ||
  error?.message ||
  "Something went wrong.";

const getEntryUserId = (entry: MealEntry) =>
  typeof entry.user === "string" ? entry.user : entry.user?._id;

const getDateKey = (
  year: number,
  monthIndex: number,
  day: number
) =>
  `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(
    day
  ).padStart(2, "0")}`;

const MyMeal = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [avatarImageFailed, setAvatarImageFailed] = useState(false);
  const [backendUser, setBackendUser] =
    useState<BackendUser | null>(null);
  const [mealGroup, setMealGroup] =
    useState<MealGroup | null>(null);
  const [members, setMembers] = useState<BackendUser[]>([]);
  const [entries, setEntries] = useState<MealEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    null
  );

  const today = useMemo(() => new Date(), []);
  const year = today.getFullYear();
  const monthIndex = today.getMonth();
  const daysInMonth = useMemo(
    () =>
      Array.from(
        { length: new Date(year, monthIndex + 1, 0).getDate() },
        (_, index) => index + 1
      ),
    [monthIndex, year]
  );
  const monthLabel = today.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

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

  const loadMealDetails = useCallback(
    async (initialLoad = false) => {
      if (!user?.id) {
        return;
      }

      if (initialLoad) {
        setIsLoading(true);
      } else {
        setRefreshing(true);
      }

      setErrorMessage(null);

      try {
        if (userEmail) {
          await createUser({
            clerkId: user.id,
            name: userName,
            email: userEmail,
          });
        }

        const token = await getToken();
        const data = await getMyMealGroup(token);

        setBackendUser(data.user || null);
        setMealGroup(data.mealGroup || null);
        setMembers(data.members || []);
        setEntries(data.entries || []);
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      } finally {
        setIsLoading(false);
        setRefreshing(false);
      }
    },
    [getToken, user?.id, userEmail, userName]
  );

  useEffect(() => {
    loadMealDetails(true);
  }, [loadMealDetails]);

  const rows = useMemo<MemberRow[]>(
    () =>
      members.map((member) => {
        const daily = daysInMonth.map((day) => {
          const dateKey = getDateKey(year, monthIndex, day);
          const entry = entries.find(
            (mealEntry) =>
              getEntryUserId(mealEntry) === member._id &&
              mealEntry.date === dateKey
          );

          return entry?.totalMeals || 0;
        });

        return {
          id: member._id,
          name: member.name,
          meal: daily.reduce((sum, count) => sum + count, 0),
          daily,
        };
      }),
    [daysInMonth, entries, members, monthIndex, year]
  );

  const mealCost =
    (backendUser?.totalMeals || 0) * (mealGroup?.mealRate || 0);
  const balanceAfterMeals = (backendUser?.balance || 0) - mealCost;

  const TableHeader = () => (
    <View style={styles.tableRow}>
      <Text style={styles.NameCell}>Name</Text>
      <Text style={styles.totalCell}>Meal</Text>

      {daysInMonth.map((day) => (
        <View
          key={day}
          style={[styles.dayBox, { backgroundColor: "transparent" }]}
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight: "bold",
              textAlign: "center",
              color: COLORS.textLight,
            }}
          >
            Day {day}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderMemberRow = ({ item }: { item: MemberRow }) => (
    <View style={styles.tableRow}>
      <Text style={styles.NameCell}>{item.name}</Text>
      <Text style={styles.totalCell}>{item.meal}</Text>

      {item.daily.map((count, index) => (
        <View key={index} style={styles.dayBox}>
          <Text
            style={{
              textAlign: "center",
              fontWeight: "bold",
              color: COLORS.text,
            }}
          >
            {count}
          </Text>
        </View>
      ))}
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView
        style={styles.container}
        edges={["top", "left", "right"]}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "left", "right"]}
    >
      <View style={styles.content}>
        <View style={styles.mealHeader}>
          {user?.imageUrl && !avatarImageFailed ? (
            <Image
              source={{ uri: user.imageUrl }}
              style={styles.avatarImage}
              onError={() => setAvatarImageFailed(true)}
            />
          ) : (
            <View style={styles.avatarImageFailed}>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "bold",
                  color: "#FFF",
                }}
              >
                {user?.firstName?.[0] || "U"}
              </Text>
            </View>
          )}
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.email}>{userEmail}</Text>
        </View>

        <View style={styles.balanceCard}>
          <View style={styles.balanceInnerBorder}>
            <View style={styles.balanceComponent}>
              <View style={styles.balanceGroup}>
                <Text style={styles.balanceTitle}>Meal</Text>
                <Text style={styles.balanceAmount}>
                  {backendUser?.totalMeals || 0}
                </Text>
              </View>
              <View style={styles.balanceGroup}>
                <Text style={styles.balanceTitle}>Balance</Text>
                <Text style={styles.balanceAmount}>
                  BDT {(backendUser?.balance || 0).toFixed(2)}
                </Text>
              </View>
              <View style={styles.balanceGroup}>
                <Text style={styles.balanceTitle}>Due</Text>
                <Text style={styles.balanceDueAmount}>
                  BDT {balanceAfterMeals.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.totalMealDetailsTitle}>
          {mealGroup ? `${mealGroup.groupName} - ${monthLabel}` : "Meal Details"}
        </Text>

        {errorMessage && (
          <Text
            style={{
              color: COLORS.expense,
              marginBottom: 12,
              fontWeight: "600",
            }}
          >
            {errorMessage}
          </Text>
        )}
      </View>

      {!mealGroup ? (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 20,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadMealDetails(false)}
              tintColor={COLORS.primary}
            />
          }
        >
          <Text
            style={{
              color: COLORS.textLight,
              textAlign: "center",
              fontSize: 15,
            }}
          >
            Create or join a meal group from Home.
          </Text>
        </ScrollView>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <FlatList
              data={rows}
              keyExtractor={(item) => item.id}
              ListHeaderComponent={TableHeader}
              renderItem={renderMemberRow}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => loadMealDetails(false)}
                  tintColor={COLORS.primary}
                />
              }
              ListEmptyComponent={
                <Text
                  style={{
                    color: COLORS.textLight,
                    textAlign: "center",
                    paddingVertical: 24,
                  }}
                >
                  No members yet.
                </Text>
              }
            />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default MyMeal;
