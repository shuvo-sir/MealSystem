import React, { useMemo, useState, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  RefreshControl,
  Image,
} from "react-native";
import { useUser } from "@clerk/expo";
import { useAuth } from "@clerk/expo";
import { LoadingScreen } from "@/shared/components/LoadingScreen";
import { styles } from "@/assets/styles/myMeal.styles";
import { COLORS } from "@/constants/colors";
import { getMealHistory, getMyMealGroup } from "@/api/meal.api";

interface MemberMealData {
  id: string;
  name: string;
  total: number;
  daily: number[];
}

export default function MyMealScreen() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [avatarImageFailed, setAvatarImageFailed] = useState(false);
  const hasLoadedRef = useRef(false);

  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [memberMeals, setMemberMeals] = useState<MemberMealData[]>([]);
  const [mealGroup, setMealGroup] = useState(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Get the number of days in the current month
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  const daysInCurrentMonth = useMemo(
    () => getDaysInMonth(currentMonth, currentYear),
    [currentMonth, currentYear]
  );

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

  // Transform raw entries into member-wise daily breakdown
  const transformMealData = (entries: any[], groupMembers: any[], daysCount: number) => {
    const memberMap = new Map<string, Map<string, number>>();

    // Initialize map with all members and days
    groupMembers.forEach((member) => {
      memberMap.set(member._id, new Map());
      for (let i = 1; i <= daysCount; i++) {
        const dayKey = `day${i}`;
        memberMap.get(member._id).set(dayKey, 0);
      }
    });

    // Populate with actual meal data
    entries.forEach((entry) => {
      const userId = typeof entry.user === "string" ? entry.user : entry.user?._id;
      if (!userId || !memberMap.has(userId)) return;

      // Extract day from date (assuming format YYYY-MM-DD)
      const dayMatch = entry.date?.match(/-(\d{2})$/);
      if (dayMatch) {
        const day = parseInt(dayMatch[1], 10);
        if (day >= 1 && day <= daysCount) {
          const dayKey = `day${day}`;
          const dayMeals =
            (entry.breakfast || 0) + (entry.lunch || 0) + (entry.dinner || 0);
          memberMap.get(userId).set(dayKey, dayMeals);
        }
      }
    });

    // Convert to display format
    return groupMembers.map((member) => {
      const dailyData = memberMap.get(member._id);
      const dailyArray = [];
      let total = 0;

      for (let i = 1; i <= daysCount; i++) {
        const count = dailyData.get(`day${i}`) || 0;
        dailyArray.push(count);
        total += count;
      }

      return {
        id: member._id,
        name: member.name,
        total,
        daily: dailyArray,
      };
    });
  };

  const loadMealHistory = async (showInitialLoader = false) => {
    if (!user?.id) return;

    if (showInitialLoader) setIsLoading(true);
    else setRefreshing(true);

    setErrorMessage(null);

    try {
      const token = await getToken();

      // Get user's meal group and members
      const dashboard = await getMyMealGroup(token);
      setMealGroup(dashboard.mealGroup || null);
      setMembers(dashboard.members || []);

      if (dashboard.mealGroup?._id) {
        // Fetch all meal entries for the group (no userId filter = all members)
        const historyData = await getMealHistory(
          dashboard.mealGroup._id,
          {}, // empty filters = all entries
          token
        );

        // Transform data for table display
        const transformed = transformMealData(
          historyData.entries || [],
          dashboard.members || [],
          daysInCurrentMonth
        );
        setMemberMeals(transformed);
      } else {
        setMemberMeals([]);
      }
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || error.message || "Failed to load meal history"
      );
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!user?.id || hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    loadMealHistory(true);
  }, [user?.id]);

  const daysInMonth = Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1);

  // Format the month and year display
  const monthYearString = useMemo(() => {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return `${monthNames[currentMonth - 1]} ${currentYear}`;
  }, [currentMonth, currentYear]);

  // --- UI COMPONENTS ---

  const TableHeader = () => (
    <View
      style={[
        styles.tableRow,
        { borderBottomWidth: 2, borderBottomColor: COLORS.border },
      ]}
    >
      {/* Fixed Width Headers */}
      <Text style={[styles.NameCell, { width: 80 }]}>Name</Text>
      <Text style={[styles.totalCell, { width: 50, textAlign: "center" }]}>
        Total
      </Text>

      {/* Day Labels */}
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

  const renderMemberRow = ({ item }: { item: MemberMealData }) => (
    <View style={styles.tableRow}>
      {/* Name Column */}
      <Text style={[styles.NameCell, { width: 80 }]}>{item.name}</Text>

      {/* Total Column */}
      <Text style={[styles.totalCell, { width: 50, textAlign: "center" }]}>
        {item.total}
      </Text>

      {/* Daily Meal Counts */}
      {item.daily?.map((count, index) => (
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
    return <LoadingScreen />;
  }

  if (!mealGroup) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
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
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
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
          <View style={{ alignItems: "center", paddingVertical: 16, marginBottom: 20 }}>
            {user?.imageUrl && !avatarImageFailed ? (
              <Image
                source={{ uri: user.imageUrl }}
                style={{ width: 60, height: 60, borderRadius: 30 }}
                onError={() => setAvatarImageFailed(true)}
              />
            ) : (
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: COLORS.primary,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
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
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: COLORS.text,
                marginTop: 12,
              }}
            >
              {userName}
            </Text>
            <Text style={{ fontSize: 14, color: COLORS.textLight }}>
              {userEmail}
            </Text>
          </View>

          {/* Error Message */}
          {errorMessage && (
            <Text
              style={{
                color: COLORS.expense,
                marginBottom: 12,
                fontWeight: "600",
                paddingHorizontal: 20,
                textAlign: "center",
              }}
            >
              {errorMessage}
            </Text>
          )}

          <Text style={styles.totalMealDetailsTitle}>Meal History - {monthYearString}</Text>

          {/* Synchronized Table Section */}
          {memberMeals.length === 0 ? (
            <Text
              style={{
                color: COLORS.textLight,
                textAlign: "center",
                paddingVertical: 20,
              }}
            >
              No meal entries found.
            </Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View>
                <FlatList
                  data={memberMeals}
                  keyExtractor={(item) => item.id}
                  ListHeaderComponent={TableHeader}
                  renderItem={renderMemberRow}
                  contentContainerStyle={{ paddingHorizontal: 20 }}
                  scrollEnabled={false} // Disable vertical scroll (parent handles it)
                />
              </View>
            </ScrollView>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
