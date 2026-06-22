import { useAuth } from "@clerk/expo";
import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, View, Dimensions, useWindowDimensions } from "react-native";
import { COLORS } from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";

export default function HomeRoutesLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Responsive tab bar calculations
  const tabBarHeight = Math.round(screenHeight * 0.08); // ~8% of screen height
  const tabBarBottom = Math.round(screenHeight * 0.035); // ~3.5% from bottom
  const tabBarMarginHorizontal = Math.round(screenWidth * 0.05); // ~5% of screen width
  const tabBarBorderRadius = Math.round(screenHeight * 0.025); // ~2.5% of screen height
  const tabBarIconSize = Math.round(24 * (screenWidth / 375)); // Scale based on 375px baseline (iPhone 8)

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
        tabBarInactiveTintColor: COLORS.border,

        // FIX: Responsive tab bar styling for production builds
        tabBarStyle: {
          position: "absolute",
          bottom: tabBarBottom,
          marginHorizontal: tabBarMarginHorizontal,
          height: tabBarHeight,
          borderRadius: tabBarBorderRadius,
          backgroundColor: COLORS.white,
          elevation: 8,
          borderTopWidth: 0,
          paddingBottom: Math.round(tabBarHeight * 0.15),
          // shadow the tab bar for better visibility
          shadowColor: COLORS.primary,
          shadowOffset: {
            width: 0,
            height: 3,
          },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          overflow: 'hidden', // Prevent icon overflow
        },

        tabBarLabelStyle: {
          fontSize: Math.round(10 * (screenWidth / 375)),
          fontWeight: "500",
          marginTop: Math.round(3 * (screenWidth / 375)),
        },
        tabBarItemStyle: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: Math.round(4 * (screenWidth / 375)),
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={tabBarIconSize} color={color} />
          ),
        }}
      />

       <Tabs.Screen
        name="my_meal"
        options={{
          title: "My Meal",
          tabBarIcon: ({ color }) => (
            <Ionicons name="fast-food" size={tabBarIconSize} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="finance"
        options={{
          title: "Finance",
          tabBarIcon: ({ color }) => (
            <Ionicons name="wallet" size={tabBarIconSize} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings" size={tabBarIconSize} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}