import React from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Alert,
  Linking,
  Clipboard,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/colors";

interface GroupInfoModalProps {
  visible: boolean;
  onClose: () => void;
  mealGroupData: any;
  isLoading: boolean;
}

export const GroupInfoModal: React.FC<GroupInfoModalProps> = ({
  visible,
  onClose,
  mealGroupData,
  isLoading,
}) => {
  const handleCopyCode = () => {
    if (mealGroupData?.inviteCode) {
      try {
        Clipboard.setString(mealGroupData.inviteCode);
        Alert.alert(
          "Success",
          `Invite code "${mealGroupData.inviteCode}" copied to clipboard`
        );
      } catch (error) {
        Alert.alert("Error", "Failed to copy to clipboard");
      }
    }
  };

  const handleShareViaSMS = async () => {
    if (mealGroupData?.inviteCode) {
      try {
        await Linking.openURL(
          `sms:?body=${encodeURIComponent(
            `Join my MealApp group! Use invite code: ${mealGroupData.inviteCode}`
          )}`
        );
      } catch (error) {
        Alert.alert("Error", "Failed to open messaging app");
      }
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
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
            Group Information
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 24 }}
        >
          {isLoading ? (
            <View style={{ justifyContent: "center", alignItems: "center", marginTop: 50 }}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : mealGroupData ? (
            <View>
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: COLORS.text, marginBottom: 8 }}>
                  Group Name
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
                  <Text style={{ fontSize: 16, color: COLORS.text, fontWeight: "500" }}>
                    {mealGroupData.name || "N/A"}
                  </Text>
                </View>
              </View>

              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: COLORS.text, marginBottom: 8 }}>
                  Members
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
                  <Text style={{ fontSize: 16, color: COLORS.text, fontWeight: "500" }}>
                    {mealGroupData.members?.length || 0} members
                  </Text>
                </View>
              </View>

              <View style={{ marginBottom: 32 }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: COLORS.text, marginBottom: 8 }}>
                  Invite Code
                </Text>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: COLORS.primary,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 12,
                    backgroundColor: COLORS.primary + "10",
                    marginBottom: 12,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color: COLORS.primary,
                      fontWeight: "600",
                      flex: 1,
                    }}
                  >
                    {mealGroupData.inviteCode || "N/A"}
                  </Text>
                  <Pressable
                    onPress={handleCopyCode}
                    style={({ pressed }) => ({
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      marginLeft: 12,
                      opacity: pressed ? 0.7 : 1,
                    })}
                  >
                    <Ionicons name="copy" size={20} color={COLORS.primary} />
                  </Pressable>
                </View>
                <Text style={{ fontSize: 12, color: COLORS.textLight }}>
                  Share this code with members to invite them to your group
                </Text>
              </View>

              <View style={{ marginBottom: 24 }}>
                <Pressable
                  onPress={handleShareViaSMS}
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 8,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 8,
                    backgroundColor: COLORS.primary,
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <Ionicons name="share-social" size={18} color={COLORS.white} />
                  <Text style={{ fontSize: 16, fontWeight: "600", color: COLORS.white }}>
                    Share via SMS
                  </Text>
                </Pressable>
              </View>

              <View
                style={{
                  backgroundColor: COLORS.primary + "10",
                  borderRadius: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
                  <Ionicons
                    name="information-circle"
                    size={20}
                    color={COLORS.primary}
                    style={{ marginTop: 2 }}
                  />
                  <Text
                    style={{
                      fontSize: 13,
                      color: COLORS.text,
                      flex: 1,
                      lineHeight: 20,
                    }}
                  >
                    Share the invite code with new members so they can join your meal
                    group. They can enter it during signup or from the home screen.
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={{ justifyContent: "center", alignItems: "center", marginTop: 50 }}>
              <Text style={{ fontSize: 16, color: COLORS.textLight }}>
                No group information available
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};
