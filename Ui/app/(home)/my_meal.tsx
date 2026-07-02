import React, { useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  RefreshControl,
  Image,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useUser } from "@clerk/expo";
import { LoadingScreen } from "@/shared/components/LoadingScreen";
import { styles } from "@/assets/styles/myMeal.styles";
import { COLORS } from "@/constants/colors";
import { useMealHistory } from "./_hooks/useMealHistory";
import { getDayFromDate } from "./_utils/dateRangeHelpers";

interface MemberMealData {
  id: string;
  name: string;
  total: number;
  daily: number[];
}

export default function MyMealScreen() {
  const { user } = useUser();
  const [avatarImageFailed, setAvatarImageFailed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Use the enhanced meal history hook
  const {
    backendUser,
    mealGroup,
    members,
    entries,
    isLoading,
    refreshing,
    errorMessage,
    currentMonth,
    currentYear,
    monthYearLabel,
    daysInCurrentMonth,
    viewMode,
    goToPreviousMonth,
    goToNextMonth,
    resetToCurrentMonth,
    handleViewModeToggle,
    loadMealHistory,
  } = useMealHistory();

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
  const transformMealData = (
    entries: any[],
    groupMembers: any[],
    daysCount: number
  ) => {
    console.log("📊 [transformMealData] Starting:", {
      entriesCount: entries.length,
      membersCount: groupMembers.length,
      daysCount,
    });

    const memberMap = new Map<string, Map<string, number>>();

    const entryUsers = new Map<
      string,
      { _id: string; name: string }
    >();

    entries.forEach((entry) => {
      const userId = typeof entry.user === "string" ? entry.user : entry.user?._id;

      if (!userId) {
        return;
      }

      if (typeof entry.user === "string") {
        entryUsers.set(userId, {
          _id: userId,
          name: "Unknown",
        });
        return;
      }

      entryUsers.set(userId, {
        _id: userId,
        name: entry.user?.name || "Unknown",
      });
    });

    const displayMembers = groupMembers.length
      ? groupMembers
      : Array.from(entryUsers.values());

    const allMembers = new Map<string, { _id: string; name: string }>();

    displayMembers.forEach((member) => {
      if (member?._id) {
        allMembers.set(member._id, {
          _id: member._id,
          name: member.name || "Unknown",
        });
      }
    });

    entryUsers.forEach((member) => {
      if (!allMembers.has(member._id)) {
        allMembers.set(member._id, member);
      }
    });

    // Initialize map with all members and days
    allMembers.forEach((member) => {
      memberMap.set(member._id, new Map());
      for (let i = 1; i <= daysCount; i++) {
        const dayKey = `day${i}`;
        memberMap.get(member._id).set(dayKey, 0);
      }
    });

    console.log("✅ Initialized memberMap");

    // Populate with actual meal data
    let processedCount = 0;
    let skippedCount = 0;

    entries.forEach((entry, idx) => {
      const userId =
        typeof entry.user === "string" ? entry.user : entry.user?._id;
      
      const dayMeals = (entry.breakfast || 0) + (entry.lunch || 0) + (entry.dinner || 0);
      console.log(`  Entry ${idx}: date=${entry.date}, userId=${userId}, meals=${dayMeals}, found=${memberMap.has(userId)}`);

      if (!userId || !memberMap.has(userId)) {
        console.log(`    ❌ Skipped`);
        skippedCount++;
        return;
      }

      const day = getDayFromDate(entry.date);
      if (day && day >= 1 && day <= daysCount) {
        const dayKey = `day${day}`;
        console.log(`    ✅ Set ${dayKey} = ${dayMeals}`);
        memberMap.get(userId)!.set(dayKey, dayMeals);
        processedCount++;
      } else {
        console.log(`    ❌ Skipped: invalid day ${day}`);
        skippedCount++;
      }
    });

    console.log(`✅ Processing done: ${processedCount} added, ${skippedCount} skipped`);

    // Convert to display format
    return Array.from(allMembers.values()).map((member) => {
      const dailyData = memberMap.get(member._id);
      const dailyArray = [];
      let total = 0;

      for (let i = 1; i <= daysCount; i++) {
        const count = dailyData?.get(`day${i}`) || 0;
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

  // Get members to display based on view mode
  const displayMembers = useMemo(() => {
    let membersToShow = members;

    // Personal view: only show logged-in user
    if (viewMode === "personal" && backendUser) {
      const personalMember = members.find((m) => m._id === backendUser._id);
      membersToShow = personalMember ? [personalMember] : [backendUser];
    }

    // Filter by search query
    if (searchQuery.trim()) {
      membersToShow = membersToShow.filter((m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return membersToShow;
  }, [members, viewMode, backendUser, searchQuery]);

  // Transform meal data for display
  const memberMeals = useMemo(() => {
    console.log("🔄 [memberMeals] Computing:", {
      entriesCount: entries.length,
      displayMembersCount: displayMembers.length,
      daysInCurrentMonth,
    });
    const result = transformMealData(entries, displayMembers, daysInCurrentMonth);
    console.log("✅ [memberMeals] Result:", result.map(m => ({ name: m.name, total: m.total })));
    return result;
  }, [entries, displayMembers, daysInCurrentMonth]);

  const daysInMonth = Array.from(
    { length: daysInCurrentMonth },
    (_, i) => i + 1
  );

  // --- UI COMPONENTS ---

  // Table Header Component
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

  // Member Row Component
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
          {/* User Header */}
          <View
            style={{
              alignItems: "center",
              paddingVertical: 16,
              marginBottom: 20,
            }}
          >
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

          {/* Month Navigation */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 20,
              marginBottom: 16,
            }}
          >
            <TouchableOpacity
              onPress={goToPreviousMonth}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                backgroundColor: COLORS.primary,
                borderRadius: 6,
              }}
            >
              <Text
                style={{
                  color: "#FFF",
                  fontWeight: "600",
                  fontSize: 16,
                }}
              >
                ←
              </Text>
            </TouchableOpacity>

            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: COLORS.text,
                }}
              >
                {monthYearLabel}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: COLORS.textLight,
                  marginTop: 2,
                }}
              >
                {viewMode === "personal" ? "My Meals" : "All Members"}
              </Text>
            </View>

            <TouchableOpacity
              onPress={goToNextMonth}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                backgroundColor: COLORS.primary,
                borderRadius: 6,
              }}
            >
              <Text
                style={{
                  color: "#FFF",
                  fontWeight: "600",
                  fontSize: 16,
                }}
              >
                →
              </Text>
            </TouchableOpacity>
          </View>

          {/* View Mode Toggle */}
          <View
            style={{
              flexDirection: "row",
              paddingHorizontal: 20,
              marginBottom: 16,
              gap: 8,
            }}
          >
            <TouchableOpacity
              onPress={() => handleViewModeToggle("personal")}
              style={{
                flex: 1,
                paddingVertical: 10,
                paddingHorizontal: 12,
                backgroundColor:
                  viewMode === "personal" ? COLORS.primary : COLORS.border,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontWeight: "600",
                  color:
                    viewMode === "personal"
                      ? "#FFF"
                      : COLORS.textLight,
                  fontSize: 13,
                }}
              >
                My Meals
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleViewModeToggle("group")}
              style={{
                flex: 1,
                paddingVertical: 10,
                paddingHorizontal: 12,
                backgroundColor:
                  viewMode === "group" ? COLORS.primary : COLORS.border,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontWeight: "600",
                  color:
                    viewMode === "group"
                      ? "#FFF"
                      : COLORS.textLight,
                  fontSize: 13,
                }}
              >
                All Members
              </Text>
            </TouchableOpacity>
          </View>

          {/* Member Search Box */}
          <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
            <TextInput
              placeholder="Search member..."
              placeholderTextColor={COLORS.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{
                borderWidth: 1,
                borderColor: COLORS.border,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 8,
                color: COLORS.text,
                fontSize: 14,
              }}
            />
          </View>

          {/* Member Count Indicator */}
          {searchQuery.trim() && (
            <Text
              style={{
                paddingHorizontal: 20,
                marginBottom: 8,
                color: COLORS.textLight,
                fontSize: 12,
              }}
            >
              Found {displayMembers.length} member{displayMembers.length !== 1 ? "s" : ""}
            </Text>
          )}

          {/* Synchronized Table Section */}
          {memberMeals.length === 0 ? (
            <Text
              style={{
                color: COLORS.textLight,
                textAlign: "center",
                paddingVertical: 20,
              }}
            >
              {searchQuery.trim()
                ? "No members found."
                : "No meal entries found for this month."}
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

