import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Switch,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useClerk, useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { validatePassword } from "../../utils/validation";
import { getNotificationPreferences, saveNotificationPreferences, type NotificationPreferences } from "../../utils/storageService";
import { styles } from "../../assets/styles/home.styles";
import { COLORS } from "@/constants/colors";

// FAQ data structure
const FAQ_ITEMS = [
  {
    question: "How do I track my meals?",
    answer: "Navigate to the home screen and tap the '+' button to add a new meal. Enter the meal name, date, and any notes. Your meals will be tracked in your meal history.",
  },
  {
    question: "Can I edit or delete meals?",
    answer: "Yes, you can swipe left on any meal in your history to see edit and delete options. Make changes as needed and save.",
  },
  {
    question: "What data does MealApp collect?",
    answer: "MealApp collects your meal records, profile information, and preferences. We use this data to provide better meal tracking features. Your data is encrypted and secure.",
  },
  {
    question: "How do I export my meal data?",
    answer: "Go to Settings > Help & Support > Contact us to request a data export. We'll send your meal data in CSV format within 24 hours.",
  },
  {
    question: "Is my data backed up?",
    answer: "Yes, all your meal data is automatically backed up to our secure servers. You can access your data from any device with your account.",
  },
];

export default function SettingsScreen() {
  const { signOut } = useClerk();
  const { user } = useUser();
  const router = useRouter();
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [notificationsModalVisible, setNotificationsModalVisible] = useState(false);
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [helpLoading, setHelpLoading] = useState(false);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({
    pushEnabled: true,
    emailEnabled: true,
    mealReminders: true,
    frequency: 'daily',
  });

  const userName = [user?.firstName, user?.lastName].filter(Boolean).join(' ');



  // Load notification preferences on component mount
  useEffect(() => {
    const loadNotificationPrefs = async () => {
      try {
        const prefs = await getNotificationPreferences();
        setNotificationPrefs(prefs);
      } catch (error) {
        console.error('Failed to load notification preferences:', error);
      }
    };
    loadNotificationPrefs();
  }, []);

  // Save notification preferences
  const handleSaveNotifications = async () => {
    if (notificationPrefs.mealReminders && notificationPrefs.frequency === 'none') {
      Alert.alert('Error', 'Please select a reminder frequency or disable meal reminders');
      return;
    }

    setIsLoading(true);
    try {
      const saved = await saveNotificationPreferences(notificationPrefs);
      if (saved) {
        Alert.alert('Success', 'Notification preferences saved successfully!');
        setNotificationsModalVisible(false);
      } else {
        Alert.alert('Error', 'Failed to save preferences. Please try again.');
      }
    } catch (error) {
      console.error('Error saving notifications:', error);
      Alert.alert('Error', 'An error occurred while saving preferences.');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle FAQ item
  const handleToggleFaq = (index: number) => {
    setExpandedFaqIndex(expandedFaqIndex === index ? null : index);
  };

  // Send feedback/support message
  const handleSendFeedback = async () => {
    if (!supportMessage.trim()) {
      Alert.alert('Error', 'Please enter a message before sending');
      return;
    }

    setHelpLoading(true);
    try {
      // Open email client with pre-filled support email
      const subject = 'MealApp Support Request';
      const body = `User Message:\n${supportMessage}\n\nUser Email: ${user?.emailAddresses?.[0]?.emailAddress}\nApp Version: 1.0.0`;
      const mailto = `mailto:support@mealapp.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      const canOpen = await Linking.canOpenURL(mailto);
      if (canOpen) {
        await Linking.openURL(mailto);
        Alert.alert('Success', 'Your email client is opening. Send the message to support us!');
        setSupportMessage('');
      } else {
        // Fallback: copy email to clipboard and show message
        Alert.alert(
          'Support Email',
          'Please send your message to: support@mealapp.com',
          [
            { text: 'Copy Email', onPress: () => console.log('Email copied') },
            { text: 'OK', onPress: () => setSupportMessage('') },
          ]
        );
      }
    } catch (error) {
      console.error('Error sending feedback:', error);
      Alert.alert('Error', 'Failed to open email client. Please try again.');
    } finally {
      setHelpLoading(false);
    }
  };

  // Change password function
  const handleChangePassword = async () => {
    // Validation
    if (!currentPassword.trim()) {
      Alert.alert("Error", "Current password is required");
      return;
    }

    if (!newPassword.trim()) {
      Alert.alert("Error", "New password is required");
      return;
    }

    if (!confirmPassword.trim()) {
      Alert.alert("Error", "Please confirm your new password");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    // Validate new password strength
    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      Alert.alert("Error", validation.error || "Invalid password");
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert("Error", "New password must be different from current password");
      return;
    }

    setIsLoading(true);
    try {
      await user?.updatePassword({
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
      });

      Alert.alert("Success", "Password updated successfully!");
      // Reset form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordModalVisible(false);
    } catch (error: any) {
      console.error("Password update error:", error);
      const errorMsg = error?.errors?.[0]?.message || "Failed to update password. Please check your current password and try again.";
      Alert.alert("Error", errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Update user profile (name)
  const handleUpdateProfile = async () => {
    if (!firstName.trim()) {
      Alert.alert("Error", "First name cannot be empty");
      return;
    }

    setIsLoading(true);
    try {
      await user?.update({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      Alert.alert("Success", "Profile updated successfully!");
      setProfileModalVisible(false);
    } catch (error) {
      console.error("Profile update error:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Change profile picture
  const handleChangeProfilePicture = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "We need permission to access your photo library.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], // Updated from deprecated MediaTypeOptions
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        setIsLoading(true);
        const imageAsset = result.assets[0];

        try {
          // FIX: Pass the file object directly to Clerk instead of FormData
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
          console.error("Image upload error:", JSON.stringify(uploadError, null, 2));
          const msg = uploadError?.errors?.[0]?.message || "Failed to upload image.";
          Alert.alert("Upload Failed", msg);
        }
      }
    } catch (error) {
      console.error("Profile picture selection error:", error);
      Alert.alert("Error", "Failed to select profile picture.");
    } finally {
      setIsLoading(false);
    }
  };

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
              Alert.alert("Error", "Failed to sign out.");
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
      onPress: () => {
        setFirstName(user?.firstName || "");
        setLastName(user?.lastName || "");
        setProfileModalVisible(true);
      },
    },
    {
      icon: "key",
      title: "Change Password",
      subtitle: "Update your password",
      onPress: () => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordModalVisible(true);
      },
    },
    {
      icon: "notifications",
      title: "Notifications",
      subtitle: "Manage notification preferences",
      onPress: () => {
        setNotificationsModalVisible(true);
      },
    },
    {
      icon: "help-circle",
      title: "Help & Support",
      subtitle: "Get help or contact support",
      onPress: () => {
        setExpandedFaqIndex(null);
        setSupportMessage("");
        setHelpModalVisible(true);
      },
    },
  ];

  return (
    <SafeAreaView edges={["top"]} style={[styles.container, { paddingHorizontal: 0 }]}>
      <ScrollView>
        <View style={styles.content}>
          <View>
            <Text style={{
              fontSize: 24, 
              fontWeight: 'bold', 
              color: COLORS.text,
              paddingHorizontal: 20,
              borderBottomWidth: 1,
              borderBottomColor: COLORS.border,
              paddingBottom: 16,
              paddingTop: 10,
            }}
              >Settings</Text>

          </View>

          <View
            style={[
              styles.header,
              {
                flexDirection: "row",
                paddingHorizontal: 20,
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: COLORS.border,
                gap: 5,
              },
            ]}
          >
            <Image
              source={{ uri: user?.imageUrl }}
              style={{width: 75, height: 75, borderRadius: 37.5, }}
            />
            <View style={styles.welcomeContainer}>
              <Text style={[styles.usernameText, {color: COLORS.textLight}]}>{userName}</Text>
              <Text
                style={[
                  styles.welcomeText,
                  { marginTop: 2, fontSize: 14, color: COLORS.textLight },
                ]}
              >
                {user?.emailAddresses?.[0]?.emailAddress}
              </Text>
            </View>

          </View>

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

          <View
            style={{
              height: 1,
              backgroundColor: COLORS.border,
              marginVertical: 24,
              marginHorizontal: 20,
            }}
          />

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




      

      <Modal
        visible={profileModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => {
          if (!isLoading) setProfileModalVisible(false);
        }}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 20,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: COLORS.border,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "700", color: COLORS.text }}>
              Edit Profile
            </Text>
            <TouchableOpacity
              onPress={() => {
                if (!isLoading) setProfileModalVisible(false);
              }}
              disabled={isLoading}
            >
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} 
            contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 24 }}
          >
            <View style={{ alignItems: "center", marginBottom: 32 }}>
              <View
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  backgroundColor: COLORS.border,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 16,
                  overflow: "hidden",
                }}
              >
                {user?.imageUrl ? (
                  <Image
                    source={{ uri: user.imageUrl }}
                    style={{ width: "100%", height: "100%" }}
                  />
                ) : (
                  <Ionicons name="person" size={50} color={COLORS.textLight} />
                )}
              </View>
              <Pressable
                onPress={handleChangeProfilePicture}
                disabled={isLoading}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 8,
                  backgroundColor: COLORS.primary,
                  opacity: pressed || isLoading ? 0.7 : 1,
                })}
              >
                {isLoading ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <Ionicons name="camera" size={18} color={COLORS.white} />
                )}
                <Text style={{ color: COLORS.white, fontWeight: "600" }}>
                  Change Picture
                </Text>
              </Pressable>
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: COLORS.text, marginBottom: 8 }}>
                First Name
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: COLORS.text,
                }}
                placeholder="Enter first name"
                placeholderTextColor={COLORS.textLight}
                value={firstName}
                onChangeText={setFirstName}
                editable={!isLoading}
              />
            </View>

            <View style={{ marginBottom: 32 }}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: COLORS.text, marginBottom: 8 }}>
                Last Name
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: COLORS.text,
                }}
                placeholder="Enter last name"
                placeholderTextColor={COLORS.textLight}
                value={lastName}
                onChangeText={setLastName}
                editable={!isLoading}
              />
            </View>

            <View style={{ marginBottom: 32 }}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: COLORS.text, marginBottom: 8 }}>
                Email
              </Text>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  backgroundColor: COLORS.border,
                }}
              >
                <Text style={{ fontSize: 16, color: COLORS.textLight }}>
                  {user?.emailAddresses?.[0]?.emailAddress}
                </Text>
              </View>
              <Text style={{ fontSize: 12, color: COLORS.textLight, marginTop: 4 }}>
                Email cannot be changed
              </Text>
            </View>
          </ScrollView>

          <View
            style={{
              paddingHorizontal: 20,
              paddingBottom: 24,
              borderTopWidth: 1,
              borderTopColor: COLORS.border,
              gap: 12,
            }}
          >
            <Pressable
              onPress={handleUpdateProfile}
              disabled={isLoading}
              style={({ pressed }) => [
                styles.addButton,
                {
                  marginHorizontal: 0,
                  opacity: pressed || isLoading ? 0.8 : 1,
                },
              ]}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <Ionicons name="checkmark" size={20} color={COLORS.white} />
              )}
              <Text style={styles.addButtonText}>Save Changes</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                if (!isLoading) setProfileModalVisible(false);
              }}
              disabled={isLoading}
              style={({ pressed }) => ({
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: 8,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: COLORS.border,
                opacity: pressed || isLoading ? 0.7 : 1,
              })}
            >
              <Ionicons name="close" size={20} color={COLORS.text} />
              <Text style={{ fontSize: 16, fontWeight: "600", color: COLORS.text }}>
                Cancel
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Password Change Modal */}
      <Modal
        visible={passwordModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => {
          if (!isLoading) setPasswordModalVisible(false);
        }}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 20,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: COLORS.border,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "700", color: COLORS.text }}>
              Change Password
            </Text>
            <TouchableOpacity
              onPress={() => {
                if (!isLoading) setPasswordModalVisible(false);
              }}
              disabled={isLoading}
            >
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} 
            contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 24 }}
          >
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: COLORS.text, marginBottom: 8 }}>
                Current Password
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: COLORS.text,
                }}
                placeholder="Enter your current password"
                placeholderTextColor={COLORS.textLight}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={true}
                editable={!isLoading}
              />
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: COLORS.text, marginBottom: 8 }}>
                New Password
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: COLORS.text,
                }}
                placeholder="Enter new password (min 8 characters)"
                placeholderTextColor={COLORS.textLight}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={true}
                editable={!isLoading}
              />
              <Text style={{ fontSize: 11, color: COLORS.textLight, marginTop: 4 }}>
                Must include uppercase, lowercase, numbers, and special characters
              </Text>
            </View>

            <View style={{ marginBottom: 32 }}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: COLORS.text, marginBottom: 8 }}>
                Confirm New Password
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: COLORS.text,
                }}
                placeholder="Re-enter new password"
                placeholderTextColor={COLORS.textLight}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={true}
                editable={!isLoading}
              />
            </View>
          </ScrollView>

          <View
            style={{
              paddingHorizontal: 20,
              paddingBottom: 24,
              borderTopWidth: 1,
              borderTopColor: COLORS.border,
              gap: 12,
            }}
          >
            <Pressable
              onPress={handleChangePassword}
              disabled={isLoading}
              style={({ pressed }) => [
                styles.addButton,
                {
                  marginHorizontal: 0,
                  opacity: pressed || isLoading ? 0.8 : 1,
                },
              ]}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <Ionicons name="checkmark" size={20} color={COLORS.white} />
              )}
              <Text style={styles.addButtonText}>Update Password</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                if (!isLoading) setPasswordModalVisible(false);
              }}
              disabled={isLoading}
              style={({ pressed }) => ({
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: 8,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: COLORS.border,
                opacity: pressed || isLoading ? 0.7 : 1,
              })}
            >
              <Ionicons name="close" size={20} color={COLORS.text} />
              <Text style={{ fontSize: 16, fontWeight: "600", color: COLORS.text }}>
                Cancel
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Notifications Modal */}
      <Modal
        visible={notificationsModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => {
          if (!isLoading) setNotificationsModalVisible(false);
        }}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 20,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: COLORS.border,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "700", color: COLORS.text }}>
              Notifications
            </Text>
            <TouchableOpacity
              onPress={() => {
                if (!isLoading) setNotificationsModalVisible(false);
              }}
              disabled={isLoading}
            >
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 24 }}>
            {/* Push Notifications Toggle */}
            <View
              style={{
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: COLORS.border,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: "600", color: COLORS.text, marginBottom: 4 }}>
                  Push Notifications
                </Text>
                <Text style={{ fontSize: 13, color: COLORS.textLight }}>
                  Receive alerts about your meals
                </Text>
              </View>
              <Switch
                value={notificationPrefs.pushEnabled}
                onValueChange={(val) =>
                  setNotificationPrefs({ ...notificationPrefs, pushEnabled: val })
                }
                disabled={isLoading}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
              />
            </View>

            {/* Email Notifications Toggle */}
            <View
              style={{
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: COLORS.border,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: "600", color: COLORS.text, marginBottom: 4 }}>
                  Email Notifications
                </Text>
                <Text style={{ fontSize: 13, color: COLORS.textLight }}>
                  Receive email summaries
                </Text>
              </View>
              <Switch
                value={notificationPrefs.emailEnabled}
                onValueChange={(val) =>
                  setNotificationPrefs({ ...notificationPrefs, emailEnabled: val })
                }
                disabled={isLoading}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
              />
            </View>

            {/* Meal Reminders Toggle */}
            <View
              style={{
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: COLORS.border,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: "600", color: COLORS.text, marginBottom: 4 }}>
                  Meal Reminders
                </Text>
                <Text style={{ fontSize: 13, color: COLORS.textLight }}>
                  Remind me to log meals
                </Text>
              </View>
              <Switch
                value={notificationPrefs.mealReminders}
                onValueChange={(val) =>
                  setNotificationPrefs({ ...notificationPrefs, mealReminders: val })
                }
                disabled={isLoading}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
              />
            </View>

            {/* Reminder Frequency Selector */}
            {notificationPrefs.mealReminders && (
              <View style={{ marginTop: 24, marginBottom: 32 }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: COLORS.text, marginBottom: 12 }}>
                  Reminder Frequency
                </Text>
                {['daily', 'weekly', 'none'].map((freq) => (
                  <Pressable
                    key={freq}
                    onPress={() =>
                      setNotificationPrefs({
                        ...notificationPrefs,
                        frequency: freq as 'daily' | 'weekly' | 'none',
                      })
                    }
                    style={{
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderRadius: 8,
                      borderWidth: 2,
                      borderColor:
                        notificationPrefs.frequency === freq
                          ? COLORS.primary
                          : COLORS.border,
                      backgroundColor:
                        notificationPrefs.frequency === freq
                          ? COLORS.primary + '15'
                          : 'transparent',
                      marginBottom: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <View
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 9,
                        borderWidth: 2,
                        borderColor: COLORS.primary,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 12,
                      }}
                    >
                      {notificationPrefs.frequency === freq && (
                        <View
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: COLORS.primary,
                          }}
                        />
                      )}
                    </View>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: '500',
                        color: COLORS.text,
                        textTransform: 'capitalize',
                      }}
                    >
                      {freq === 'none' ? 'No reminders' : freq}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </ScrollView>

          <View
            style={{
              paddingHorizontal: 20,
              paddingBottom: 24,
              borderTopWidth: 1,
              borderTopColor: COLORS.border,
              gap: 12,
            }}
          >
            <Pressable
              onPress={handleSaveNotifications}
              disabled={isLoading}
              style={({ pressed }) => [
                styles.addButton,
                {
                  marginHorizontal: 0,
                  opacity: pressed || isLoading ? 0.8 : 1,
                },
              ]}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <Ionicons name="checkmark" size={20} color={COLORS.white} />
              )}
              <Text style={styles.addButtonText}>Save Preferences</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                if (!isLoading) setNotificationsModalVisible(false);
              }}
              disabled={isLoading}
              style={({ pressed }) => ({
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: 8,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: COLORS.border,
                opacity: pressed || isLoading ? 0.7 : 1,
              })}
            >
              <Ionicons name="close" size={20} color={COLORS.text} />
              <Text style={{ fontSize: 16, fontWeight: "600", color: COLORS.text }}>
                Cancel
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Help & Support Modal */}
      <Modal
        visible={helpModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => {
          if (!helpLoading) setHelpModalVisible(false);
        }}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 20,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: COLORS.border,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "700", color: COLORS.text }}>
              Help & Support
            </Text>
            <TouchableOpacity
              onPress={() => {
                if (!helpLoading) setHelpModalVisible(false);
              }}
              disabled={helpLoading}
            >
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 24 }}>
            {/* FAQ Section */}
            <View style={{ marginBottom: 32 }}>
              <Text style={{ fontSize: 16, fontWeight: "700", color: COLORS.text, marginBottom: 16 }}>
                Frequently Asked Questions
              </Text>
              {FAQ_ITEMS.map((item, index) => (
                <Pressable
                  key={index}
                  onPress={() => handleToggleFaq(index)}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: COLORS.border,
                    marginBottom: 12,
                    backgroundColor:
                      expandedFaqIndex === index ? COLORS.primary + '10' : 'transparent',
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: COLORS.text,
                        flex: 1,
                        paddingRight: 12,
                      }}
                    >
                      {item.question}
                    </Text>
                    <Ionicons
                      name={expandedFaqIndex === index ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={COLORS.primary}
                    />
                  </View>
                  {expandedFaqIndex === index && (
                    <Text
                      style={{
                        fontSize: 13,
                        color: COLORS.textLight,
                        marginTop: 12,
                        lineHeight: 20,
                      }}
                    >
                      {item.answer}
                    </Text>
                  )}
                </Pressable>
              ))}
            </View>

            {/* App Info Section */}
            <View style={{ marginBottom: 32 }}>
              <Text style={{ fontSize: 16, fontWeight: "700", color: COLORS.text, marginBottom: 12 }}>
                About MealApp
              </Text>
              <View
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  marginBottom: 12,
                }}
              >
                <Text style={{ fontSize: 14, color: COLORS.text, marginBottom: 8 }}>
                  <Text style={{ fontWeight: '600' }}>App Version:</Text> 1.0.0
                </Text>
                <Text style={{ fontSize: 14, color: COLORS.text, marginBottom: 8 }}>
                  <Text style={{ fontWeight: '600' }}>Build:</Text> 2026.04.27
                </Text>
                <Text style={{ fontSize: 14, color: COLORS.text }}>
                  <Text style={{ fontWeight: '600' }}>© 2026 MealApp</Text> - All rights reserved
                </Text>
              </View>
            </View>

            {/* Contact Support Section */}
            <View>
              <Text style={{ fontSize: 16, fontWeight: "700", color: COLORS.text, marginBottom: 12 }}>
                Contact Support
              </Text>
              <Text style={{ fontSize: 13, color: COLORS.textLight, marginBottom: 12 }}>
                Have a question or issue? Send us a message and we'll get back to you within 24 hours.
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  fontSize: 14,
                  color: COLORS.text,
                  minHeight: 120,
                  textAlignVertical: 'top',
                  marginBottom: 12,
                }}
                placeholder="Describe your issue or question..."
                placeholderTextColor={COLORS.textLight}
                value={supportMessage}
                onChangeText={setSupportMessage}
                multiline={true}
                numberOfLines={4}
                editable={!helpLoading}
              />
              <Pressable
                onPress={handleSendFeedback}
                disabled={helpLoading}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 8,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  backgroundColor: COLORS.primary,
                  opacity: pressed || helpLoading ? 0.7 : 1,
                })}
              >
                {helpLoading ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <Ionicons name="send" size={18} color={COLORS.white} />
                )}
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: COLORS.white,
                  }}
                >
                  Send Message
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
}