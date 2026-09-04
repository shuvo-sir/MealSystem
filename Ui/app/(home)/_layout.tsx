import { useAuth } from "@clerk/expo";
import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { COLORS } from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";

export default function HomeRoutesLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: COLORS.background,
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight, // textLight usually looks better for inactive icons
        tabBarStyle: {
          position: "absolute", // 🌟 CRITICAL: This is what makes it float!
          bottom: 36,           // Lifts it off the bottom edge
          marginHorizontal: 20,  // Adds space on the left and right
          height: 56,
          backgroundColor: COLORS.card, // Using your theme's card color
          borderRadius: 20,     // High border radius for a pill shape
          
          // Borders
          borderWidth: 1,
          borderColor: COLORS.border,
          borderTopWidth: 1,    // React Navigation adds a default top border, this overrides it safely

          // Shadows
          elevation: 8,         // Android shadow
          shadowColor: COLORS.shadow, // iOS shadow
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.15,
          shadowRadius: 10,
        },

        // Item & Label styling adjustments to center everything perfectly in the floating pill
        tabBarItemStyle: {
          justifyContent: "center",
          alignItems: "center",
          height: 56,          // Match the height of the tab bar
          paddingTop: 1,       // Push icons slightly down
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          paddingBottom: 8,    // Push text slightly up
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="my_meal"
        options={{
          title: "My Meal",
          tabBarIcon: ({ color }) => (
            <Ionicons name="fast-food" size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="finance"
        options={{
          title: "Finance",
          tabBarIcon: ({ color }) => (
            <Ionicons name="wallet" size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="manager"
        options={{
          title: "Manager",
          tabBarIcon: ({ color }) => (
            <Ionicons name="shield-checkmark" size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}