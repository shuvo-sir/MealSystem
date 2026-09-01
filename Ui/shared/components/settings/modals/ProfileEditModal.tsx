import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/colors";
import { styles } from "@/assets/styles/home.styles";

interface ProfileEditModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (firstName: string, lastName: string) => Promise<void>;
  onChangeProfilePicture: () => Promise<void>;
  isLoading: boolean;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  visible,
  onClose,
  onSave,
  onChangeProfilePicture,
  isLoading,
}) => {
  const { user } = useUser();
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");

  const handleUpdateProfile = async () => {
    try {
      await onSave(firstName, lastName);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to update profile");
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
            Edit Profile
          </Text>
          <TouchableOpacity onPress={onClose} disabled={isLoading}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1 }}
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
                <Image source={{ uri: user.imageUrl }} style={{ width: "100%", height: "100%" }} />
              ) : (
                <Ionicons name="person" size={50} color={COLORS.textLight} />
              )}
            </View>
            <Pressable
              onPress={onChangeProfilePicture}
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
              <Text style={{ color: COLORS.white, fontWeight: "600" }}>Change Picture</Text>
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

          <View style={{ marginBottom: 24 }}>
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
