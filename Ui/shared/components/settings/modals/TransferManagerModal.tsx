import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/colors";
import { transferManager } from "@/api/meal.api";

const DURATION_OPTIONS = [
  { label: "3 days", value: "3" },
  { label: "7 days", value: "7" },
  { label: "30 days", value: "30" },
  { label: "Permanent", value: "permanent" },
];

interface TransferManagerModalProps {
  visible: boolean;
  onClose: () => void;
  mealGroupData: any;
  onTransferSuccess: () => void;
}

export const TransferManagerModal: React.FC<TransferManagerModalProps> = ({
  visible,
  onClose,
  mealGroupData,
  onTransferSuccess,
}) => {
  const { getToken } = useAuth();
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState("permanent");
  const [isLoading, setIsLoading] = useState(false);

  const availableMembers = useMemo(() => {
    const currentManagerId = mealGroupData?.manager?.toString?.() || mealGroupData?.manager;
    return (mealGroupData?.members || []).filter((member: any) => {
      if (!member?._id) return false;
      return member._id.toString() !== currentManagerId?.toString();
    });
  }, [mealGroupData]);

  useEffect(() => {
    if (!visible) {
      setSelectedMemberId(null);
      setSelectedDuration("permanent");
    }
  }, [visible]);

  const handleTransfer = async () => {
    if (!mealGroupData?._id) {
      Alert.alert("Error", "Group information not found.");
      return;
    }

    if (!selectedMemberId) {
      Alert.alert("Select member", "Please choose a member to promote.");
      return;
    }

    setIsLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        Alert.alert("Error", "Authentication token not found");
        return;
      }

      const response = await transferManager(
        {
          memberId: selectedMemberId,
          duration: selectedDuration,
        },
        token
      );

      Alert.alert("Success", response?.message || "Manager transferred successfully");
      await onTransferSuccess();
      onClose();
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.message || error?.message || "Failed to transfer manager");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.title}>Transfer Manager</Text>
              <Pressable onPress={onClose}>
                <Ionicons name="close-circle-outline" size={28} color={COLORS.primary} />
              </Pressable>
            </View>

            <View style={styles.warningSection}>
              <View style={styles.warningIcon}>
                <Ionicons name="shield-checkmark-outline" size={32} color={COLORS.primary} />
              </View>
              <Text style={styles.warningTitle}>Choose a new manager</Text>
              <Text style={styles.warningMessage}>
                Select an existing member and choose how long they should stay manager.
                Temporary manager roles automatically revert after the selected duration.
              </Text>
              <Text style={[styles.warningMessage, { marginTop: 10, color: COLORS.primary, fontWeight: "600" }]}>
                If you want to leave the group, choose Permanent.
              </Text>
            </View>

            <ScrollView style={{ maxHeight: 320 }} contentContainerStyle={{ paddingBottom: 8 }}>
              <Text style={styles.sectionTitle}>Select Member</Text>
              {availableMembers.length === 0 ? (
                <Text style={styles.emptyText}>No other members are available.</Text>
              ) : (
                availableMembers.map((member: any) => {
                  const isSelected = selectedMemberId === member._id;

                  return (
                    <TouchableOpacity
                      key={member._id}
                      onPress={() => setSelectedMemberId(member._id)}
                      style={[
                        styles.memberCard,
                        isSelected && styles.memberCardSelected,
                      ]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.memberName}>{member.name || "Unknown member"}</Text>
                        <Text style={styles.memberEmail}>{member.email || "No email available"}</Text>
                      </View>
                      <Ionicons
                        name={isSelected ? "radio-button-on" : "radio-button-off"}
                        size={20}
                        color={COLORS.primary}
                      />
                    </TouchableOpacity>
                  );
                })
              )}

              <Text style={[styles.sectionTitle, { marginTop: 18 }]}>Duration</Text>
              <View style={styles.durationGrid}>
                {DURATION_OPTIONS.map((option) => {
                  const isSelected = selectedDuration === option.value;

                  return (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => setSelectedDuration(option.value)}
                      style={[
                        styles.durationButton,
                        isSelected && styles.durationButtonSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.durationText,
                          isSelected && styles.durationTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.transferButton]}
                onPress={handleTransfer}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="swap-horizontal" size={20} color="#fff" />
                    <Text style={styles.transferButtonText}>Transfer Manager</Text>
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
    width: "88%",
    maxWidth: 420,
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
    marginBottom: 20,
    paddingVertical: 12,
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1a1a1a",
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 13,
    color: "#777",
    marginBottom: 8,
  },
  memberCard: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    backgroundColor: "#fafafa",
    marginBottom: 10,
    gap: 12,
  },
  memberCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + "10",
  },
  memberName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#1a1a1a",
  },
  memberEmail: {
    fontSize: 12,
    color: "#777",
    marginTop: 3,
  },
  durationGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 10,
    marginBottom: 8,
  },
  durationButton: {
    flexBasis: "47%" as const,
    flexGrow: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    backgroundColor: "#fafafa",
    alignItems: "center" as const,
  },
  durationButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  durationText: {
    fontSize: 13,
    color: "#333",
    fontWeight: "600" as const,
  },
  durationTextSelected: {
    color: "#fff",
  },
  buttonContainer: {
    gap: 12,
    marginTop: 18,
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
  transferButton: {
    backgroundColor: COLORS.primary,
    gap: 8,
  },
  transferButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#fff",
  },
});