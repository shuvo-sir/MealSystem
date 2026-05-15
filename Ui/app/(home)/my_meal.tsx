import { View, Text, Image, FlatList, ScrollView } from 'react-native'
import { styles } from '@/assets/styles/myMeal.styles.js'
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from '@clerk/expo';
import { useState } from 'react';
import { COLORS } from '@/constants/colors';
import { MEAL_USERS } from '@/constants/meals';

const MyMeal = () => {
  const { user } = useUser();
  const userName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.username || 'User';
  const [avatarImageFailed, setAvatarImageFailed] = useState(false);
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);


  

  // --- UI COMPONENTS ---

  const TableHeader = () => (
    <View style={styles.tableRow}>
      {/* Fixed Width Headers */}
      <Text style={styles.NameCell}>Name</Text>
      <Text style={styles.totalCell}>Meal</Text>
      
      {/* Day Labels */}
      {daysInMonth.map((day) => (
        <View key={day} style={[styles.dayBox, { backgroundColor: 'transparent' }]}>
          <Text style={{ fontSize: 10, fontWeight: 'bold', textAlign: 'center', color: COLORS.textLight }}>
            Day {day}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderMemberRow = ({ item }: { item?: any }) => (
    <View style={styles.tableRow}>
      {/* Name Column */}
      <Text style={styles.NameCell}>{item.name}</Text>
      
      {/* Total Column */}
      <Text style={styles.totalCell}>{item.meal}</Text>
      
      {/* Daily Meal Counts */}
      {item.daily?.map((count: any, index: number) => (
        <View key={index} style={styles.dayBox}>
          <Text style={{ textAlign: 'center', fontWeight: 'bold', color: COLORS.text }}>
            {count}
          </Text>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* 1. Top Section (Profile & Balance) - Stays Fixed */}
      <View style={styles.content}>
        <View style={styles.mealHeader}>
          {user?.imageUrl && !avatarImageFailed ? (
            <Image source={{ uri: user.imageUrl }} style={styles.avatarImage} onError={() => setAvatarImageFailed(true)} />
          ) : (
            <View style={styles.avatarImageFailed}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#FFF' }}>{user?.firstName?.[0] || 'U'}</Text>
            </View>
          )}
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.email}>{user?.emailAddresses?.[0]?.emailAddress}</Text>
        </View>

        <View style={styles.balanceCard}>
          <View style={styles.balanceInnerBorder}>
            <View style={styles.balanceComponent}>
              <View style={styles.balanceGroup}>
                <Text style={styles.balanceTitle}>Meal</Text>
                <Text style={styles.balanceAmount}>12</Text>
              </View>
              <View style={styles.balanceGroup}>
                <Text style={styles.balanceTitle}>Balance</Text>
                <Text style={styles.balanceAmount}>৳1000.00</Text>
              </View>
              <View style={styles.balanceGroup}>
                <Text style={styles.balanceTitle}>Due</Text>
                <Text style={styles.balanceDueAmount}>-৳1000.00</Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.totalMealDetailsTitle}>Individual Sheet</Text>
      </View>

      {/* 2. The Synchronized Table Section */}
      {/* We wrap the entire FlatList in ONE Horizontal ScrollView */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <FlatList
            data={MEAL_USERS}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={TableHeader}
            renderItem={renderMemberRow}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            scrollEnabled={true} // Vertical scrolling
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default MyMeal;