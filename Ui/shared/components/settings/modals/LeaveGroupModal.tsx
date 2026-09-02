import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Pressable,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/colors";

interface LeaveGroupModalProps {
  visible: boolean;
  onClose: () => void;
  groupName: string | null;
  onLeaveSuccess: () => void;
  leaveMealGroup: () => Promise<void>;
  isManager?: boolean;
  isOwner?: boolean;
}

export const LeaveGroupModal: React.FC<LeaveGroupModalProps> = ({
  visible,
  onClose,
  groupName,
  onLeaveSuccess,
  leaveMealGroup,
  isManager = false,
  isOwner = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLeaveGroup = async () => {
    if (!groupName) {
      Alert.alert("Error", "Group information not found");
      return;
    }

    if (isOwner) {
      Alert.alert(
        "Owner action required",
        "You must transfer ownership to another member before leaving the group."
      );
      return;
    }

    if (isManager) {
      Alert.alert(
        "Manager action required",
        "You must promote a member to manager before leaving the group."
      );
      return;
    }

    Alert.alert(
      "Confirm Leave",
      `Are you sure you want to leave "${groupName}"? You will need an invite code to join another group.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              await leaveMealGroup();
              Alert.alert(
                "Success",
                `You have left "${groupName}". You can now join another group.`
              );
              onLeaveSuccess();
              onClose();
            } catch (error: any) {
              Alert.alert("Error", error?.message || "Failed to leave the group");
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.title}>Leave Group</Text>
              <Pressable onPress={onClose}>
                <Ionicons name="close-circle-outline" size={28} color={COLORS.primary} />
              </Pressable>
            </View>

            <View style={styles.warningSection}>
              <View style={styles.warningIcon}>
                <Ionicons name="warning-outline" size={32} color={COLORS.primary} />
              </View>
              <Text style={styles.warningTitle}>Leave "{groupName}"?</Text>
              <Text style={styles.warningMessage}>
                Once you leave this group, you will lose access to all group data
                and meal history. You can rejoin with a new invite code.
              </Text>
              {isOwner ? (
                <Text style={[styles.warningMessage, { marginTop: 12, color: COLORS.primary, fontWeight: "600" }]}>
                  You are the group owner. Transfer ownership to another member first.
                </Text>
              ) : isManager ? (
                <Text style={[styles.warningMessage, { marginTop: 12, color: COLORS.primary, fontWeight: "600" }]}>
                  You are the manager. Promote a member to manager first.
                </Text>
              ) : null}
            </View>

            <View style={styles.infoSection}>
              <View style={styles.infoItem}>
                <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
                <Text style={styles.infoText}>Other group members can still see meal history</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
                <Text style={styles.infoText}>Your account will remain active</Text>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>Keep Group</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.leaveButton]}
                onPress={handleLeaveGroup}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="exit-outline" size={20} color="#fff" />
                    <Text style={styles.leaveButtonText}>Leave Group</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  container: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    width: "100%",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "85%",
    maxWidth: 400,
  },
  header: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: "#1a1a1a",
  },
  warningSection: {
    alignItems: "center" as const,
    marginBottom: 24,
    paddingVertical: 16,
  },
  warningIcon: {
    marginBottom: 12,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#1a1a1a",
    marginBottom: 8,
    textAlign: "center" as const,
  },
  warningMessage: {
    fontSize: 14,
    color: "#666",
    textAlign: "center" as const,
    lineHeight: 20,
  },
  infoSection: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 13,
    color: "#666",
    marginLeft: 12,
    flex: 1,
    lineHeight: 18,
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    flexDirection: "row" as const,
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1a1a1a",
  },
  leaveButton: {
    backgroundColor: COLORS.primary,
    gap: 8,
  },
  leaveButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#fff",
  },
});
