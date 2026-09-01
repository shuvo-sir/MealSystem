import React, { useState } from "react";
import { View, ScrollView, Pressable, Text, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useClerk, useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/colors";
import { styles } from "@/assets/styles/home.styles";

// Hooks
import { useSettingsModals } from "@/shared/hooks/useSettingsModals";

// Components
import { SettingsHeader } from "@/shared/components/settings/SettingsHeader";
import { SettingsMenu, SettingsMenuItem } from "@/shared/components/settings/SettingsMenu";

// Modals
import { ProfileEditModal } from "@/shared/components/settings/modals/ProfileEditModal";
import { PasswordChangeModal } from "@/shared/components/settings/modals/PasswordChangeModal";
import { NotificationsModal } from "@/shared/components/settings/modals/NotificationsModal";
import { HelpSupportModal } from "@/shared/components/settings/modals/HelpSupportModal";
import {
  saveNotificationPreferences,
  NotificationPreferences,
} from "@/utils/storageService";

export default function SettingsScreen() {
  const { signOut } = useClerk();
  const { user } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Custom hooks
  const { modals, openModal, closeModal } = useSettingsModals();
  // Handlers
  const handleChangeProfilePicture = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "We need permission to access your photo library.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        setIsLoading(true);
        const imageAsset = result.assets[0];

        try {
          await user?.setProfileImage({
            file: {
              uri: imageAsset.uri,
              name: `profile-${Date.now()}.jpg`,
              type: imageAsset.mimeType || "image/jpeg",
            } as any,
          });

          Alert.alert("Success", "Profile picture updated successfully!");
          await user?.reload();
        } catch (uploadError: any) {
          const msg = uploadError?.errors?.[0]?.message || "Failed to upload image.";
          Alert.alert("Upload Failed", msg);
        }
      }
    } catch {
      Alert.alert("Error", "Failed to select profile picture.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (firstName: string, lastName: string) => {
    setIsLoading(true);
    try {
      await user?.update({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      closeModal("profileModal");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (currentPassword: string, newPassword: string) => {
    setIsLoading(true);
    try {
      await user?.updatePassword({
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
      });
      Alert.alert("Success", "Password updated successfully!");
      closeModal("passwordModal");
    } catch (error: any) {
      const errorMsg = error?.errors?.[0]?.message || "Failed to update password.";
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", onPress: () => {}, style: "cancel" },
      {
        text: "Sign Out",
        onPress: async () => {
          try {
            await signOut();
            router.replace("/(auth)/sign-in");
          } catch {
            Alert.alert("Error", "Failed to sign out.");
          }
        },
        style: "destructive",
      },
    ]);
  };

  // Build settings menu items
  const settingsItems: SettingsMenuItem[] = [
    {
      icon: "person-circle",
      title: "Profile",
      subtitle: "View and edit your profile",
      onPress: () => openModal("profileModal"),
    },
    {
      icon: "key",
      title: "Change Password",
      subtitle: "Update your password",
      onPress: () => openModal("passwordModal"),
    },
    {
      icon: "notifications",
      title: "Notifications",
      subtitle: "Manage notification preferences",
      onPress: () => openModal("notificationsModal"),
    },
    {
      icon: "help-circle",
      title: "Help & Support",
      subtitle: "Get help or contact support",
      onPress: () => openModal("helpModal"),
    },
  ];

  return (
    <SafeAreaView edges={["top"]} style={[styles.container, { paddingHorizontal: 0 }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={true}
        scrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
      >
        <View style={[styles.content, { flex: 1 }]}>
          {/* Header */}
          <SettingsHeader
            onProfilePress={() => openModal("profileModal")}
            onChangeProfilePicture={handleChangeProfilePicture}
            isLoadingProfilePic={isLoading}
          />

          {/* Settings Menu */}
          <SettingsMenu items={settingsItems} />

          {/* Divider */}
          <View
            style={{
              height: 1,
              backgroundColor: COLORS.border,
              marginVertical: 24,
              marginHorizontal: 20,
            }}
          />

          {/* Sign Out & Footer */}
          <View style={{ paddingHorizontal: 20, gap: 12, marginTop: 'auto' }}>
            <Pressable
              style={({ pressed }) => [
                styles.addButton,
                {
                  backgroundColor: COLORS.primary,
                  marginHorizontal: 0,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              onPress={handleSignOut}
            >
              <Ionicons name="log-out" size={20} color={COLORS.white} />
              <Text style={styles.addButtonText}>Sign Out</Text>
            </Pressable>

            <View style={{ alignItems: "center", paddingVertical: 16 }}>
              <Text style={{ fontSize: 12, color: COLORS.textLight, marginBottom: 4 }}>
                MealApp v1.0.0
              </Text>
              <Text style={{ fontSize: 11, color: COLORS.textLight, opacity: 0.6 }}>
                © 2026 All rights reserved
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modals */}
      <ProfileEditModal
        visible={modals.profileModal}
        onClose={() => closeModal("profileModal")}
        onSave={handleUpdateProfile}
        onChangeProfilePicture={handleChangeProfilePicture}
        isLoading={isLoading}
      />

      <PasswordChangeModal
        visible={modals.passwordModal}
        onClose={() => closeModal("passwordModal")}
        onSave={handleChangePassword}
        isLoading={isLoading}
      />

      <NotificationsModal
        visible={modals.notificationsModal}
        onClose={() => closeModal("notificationsModal")}
        onSave={async (prefs: NotificationPreferences) => {
          const saved = await saveNotificationPreferences(prefs);
          if (!saved) {
            throw new Error("Unable to save notification preferences");
          }
        }}
        isLoading={isLoading}
      />

      <HelpSupportModal
        visible={modals.helpModal}
        onClose={() => closeModal("helpModal")}
        isLoading={isLoading}
      />

    </SafeAreaView>
  );
}
