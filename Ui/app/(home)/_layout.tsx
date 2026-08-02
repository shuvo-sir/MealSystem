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
        tabBarInactiveTintColor: COLORS.border,
        tabBarStyle: {
          height: 64,
          backgroundColor: COLORS.white,
          elevation: 8,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          paddingTop: 6,
          paddingBottom: 6,
          shadowColor: COLORS.primary,
          shadowOffset: {
            width: 0,
            height: 3,
          },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
          marginTop: 2,
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 4,
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