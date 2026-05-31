import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/colors";
import { styles } from "@/assets/styles/home.styles";

interface NotificationPreferences {
  pushEnabled: boolean;
  emailEnabled: boolean;
  mealReminders: boolean;
  frequency: "daily" | "weekly" | "none";
}

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (prefs: NotificationPreferences) => Promise<void>;
  isLoading: boolean;
}

const DEFAULT_PREFS: NotificationPreferences = {
  pushEnabled: true,
  emailEnabled: true,
  mealReminders: true,
  frequency: "daily",
};

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  visible,
  onClose,
  onSave,
  isLoading,
}) => {
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_PREFS);

  const handleSave = async () => {
    try {
      await onSave(prefs);
      Alert.alert("Success", "Notification preferences saved!");
      onClose();
    } catch (error) {
      Alert.alert("Error", "Failed to save preferences");
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={() => {
        if (!isLoading) onClose();
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
          <TouchableOpacity onPress={onClose} disabled={isLoading}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 24 }}
        >
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
              value={prefs.pushEnabled}
              onValueChange={(val) => setPrefs({ ...prefs, pushEnabled: val })}
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
              value={prefs.emailEnabled}
              onValueChange={(val) => setPrefs({ ...prefs, emailEnabled: val })}
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
              value={prefs.mealReminders}
              onValueChange={(val) => setPrefs({ ...prefs, mealReminders: val })}
              disabled={isLoading}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
            />
          </View>

          {/* Reminder Frequency Selector */}
          {prefs.mealReminders && (
            <View style={{ marginTop: 24, marginBottom: 32 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: COLORS.text,
                  marginBottom: 12,
                }}
              >
                Reminder Frequency
              </Text>
              {(["daily", "weekly", "none"] as const).map((freq) => (
                <Pressable
                  key={freq}
                  onPress={() => setPrefs({ ...prefs, frequency: freq })}
                  disabled={isLoading}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 8,
                    borderWidth: 2,
                    borderColor:
                      prefs.frequency === freq ? COLORS.primary : COLORS.border,
                    backgroundColor:
                      prefs.frequency === freq ? COLORS.primary + "15" : "transparent",
                    marginBottom: 10,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 9,
                      borderWidth: 2,
                      borderColor: COLORS.primary,
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 12,
                    }}
                  >
                    {prefs.frequency === freq && (
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
                      fontWeight: "500",
                      color: COLORS.text,
                      textTransform: "capitalize",
                    }}
                  >
                    {freq === "none" ? "No reminders" : freq}
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
            onPress={handleSave}
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
            onPress={onClose}
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
            <Text style={{ fontSize: 16, fontWeight: "600", color: COLORS.text }}>Cancel</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
};
