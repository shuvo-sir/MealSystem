import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/colors";
import { styles } from "@/assets/styles/home.styles";

interface PasswordChangeModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (currentPassword: string, newPassword: string) => Promise<void>;
  isLoading: boolean;
}

export const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({
  visible,
  onClose,
  onSave,
  isLoading,
}) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters");
      return;
    }

    try {
      await onSave(currentPassword, newPassword);
      Alert.alert("Success", "Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onClose();
    } catch (error) {
      Alert.alert("Error", "Failed to change password");
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
            Change Password
          </Text>
          <TouchableOpacity onPress={onClose} disabled={isLoading}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1 }}
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
