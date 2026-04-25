import React from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  SafeAreaView,
  Alert,
} from "react-native";
import { useClerk, useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../../assets/styles/home.styles";
import { COLORS } from "@/constants/colors";

export default function SettingsScreen() {
  const { signOut } = useClerk();
  const { user } = useUser();
  const router = useRouter();

  const handleSignOut = async () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", onPress: () => {}, style: "cancel" },
        {
          text: "Sign Out",
          onPress: async () => {
            try {
              await signOut();
              router.replace("/(auth)/sign-in");
            } catch (error) {
              console.error("Sign-out error:", error);
              Alert.alert("Error", "Failed to sign out. Please try again.");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const settingsItems = [
    {
      icon: "person-circle",
      title: "Profile",
      subtitle: "View and edit your profile",
      onPress: () => alert("Profile page - coming soon"),
    },
    {
      icon: "key",
      title: "Change Password",
      subtitle: "Update your password",
      onPress: () => alert("Change password - coming soon"),
    },
    {
      icon: "notifications",
      title: "Notifications",
      subtitle: "Manage notification preferences",
      onPress: () => alert("Notifications - coming soon"),
    },
    {
      icon: "help-circle",
      title: "Help & Support",
      subtitle: "Get help or contact support",
      onPress: () => alert("Help & Support - coming soon"),
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { paddingHorizontal: 0 }]}>
      <ScrollView>
        <View style={styles.content}>
          {/* Header */}
          <View
            style={[
              styles.header,
              {
                paddingHorizontal: 20,
                marginBottom: 32,
                borderBottomWidth: 1,
                borderBottomColor: COLORS.border,
                paddingBottom: 16,
                paddingTop: 25,
              },
            ]}
          >
            <Text style={styles.usernameText}>Settings</Text>
            <Text
              style={[
                styles.welcomeText,
                { marginTop: 8, fontSize: 14, color: COLORS.textLight },
              ]}
            >
              {user?.emailAddresses?.[0]?.emailAddress}
            </Text>
          </View>

          {/* Settings Items */}
          <View>
            {settingsItems.map((item, index) => (
              <Pressable
                key={index}
                onPress={item.onPress}
                style={({ pressed }) => [
                  {
                    paddingHorizontal: 20,
                    paddingVertical: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: COLORS.border,
                    opacity: pressed ? 0.7 : 1,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  },
                ]}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <Ionicons name={item.icon as any} size={24} color={COLORS.primary} />
                  <View>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: COLORS.text,
                      }}
                    >
                      {item.title}
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        color: COLORS.textLight,
                        marginTop: 4,
                      }}
                    >
                      {item.subtitle}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
              </Pressable>
            ))}
          </View>

          {/* Divider */}
          <View
            style={{
              height: 1,
              backgroundColor: COLORS.border,
              marginVertical: 24,
              marginHorizontal: 20,
            }}
          />

          {/* Sign Out Button */}
          <View style={{ paddingHorizontal: 20, gap: 12 }}>
            <Pressable
              style={({ pressed }) => [
                styles.addButton,
                {
                  backgroundColor: COLORS.expense,
                  marginHorizontal: 0,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              onPress={handleSignOut}
            >
              <Ionicons name="log-out" size={20} color={COLORS.white} />
              <Text style={styles.addButtonText}>Sign Out</Text>
            </Pressable>

            {/* App Version */}
            <View
              style={{
                alignItems: "center",
                paddingVertical: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: COLORS.textLight,
                  marginBottom: 4,
                }}
              >
                MealApp v1.0.0
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  color: COLORS.textLight,
                  opacity: 0.6,
                }}
              >
                © 2026 All rights reserved
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
