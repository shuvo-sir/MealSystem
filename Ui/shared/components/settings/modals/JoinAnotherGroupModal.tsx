import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Pressable,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/colors";

interface JoinAnotherGroupModalProps {
  visible: boolean;
  onClose: () => void;
  onJoinSuccess: () => void;
  joinMeal: (data: { inviteCode: string }) => Promise<void>;
}

export const JoinAnotherGroupModal: React.FC<JoinAnotherGroupModalProps> = ({
  visible,
  onClose,
  onJoinSuccess,
  joinMeal,
}) => {
  const [inviteCode, setInviteCode] = useState(""
  );
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleJoinGroup = async () => {
    if (!inviteCode.trim()) {
      Alert.alert("Error", "Please enter an invite code");
      return;
    }

    setIsLoading(true);
    try {
      await joinMeal({ inviteCode: inviteCode.trim() });
      setSubmitted(true);
      setInviteCode("");
      setTimeout(() => {
        onJoinSuccess();
        onClose();
      }, 2000);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.message ||
          "Failed to submit join request. Please check the invite code and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setInviteCode("");
    setSubmitted(false);
    onClose();
  };

  if (submitted) {
    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
        <View style={styles.overlay}>
          <SafeAreaView style={styles.container}>
            <View style={styles.modalContent}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-circle-outline" size={64} color={COLORS.primary} />
              </View>
              <Text style={styles.successTitle}>Request Submitted!</Text>
              <Text style={styles.successMessage}>
                Your join request has been sent to the group manager. You will
                be notified once they approve your request.
              </Text>
              <TouchableOpacity style={styles.submitButton} onPress={handleClose}>
                <Text style={styles.submitButtonText}>Go to Home</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.title}>Join Another Group</Text>
              <Pressable onPress={handleClose}>
                <Ionicons name="close-circle-outline" size={28} color={COLORS.primary} />
              </Pressable>
            </View>

            <Text style={styles.description}>
              Enter the invite code from your group manager to join a meal group.
            </Text>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Invite Code</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter invite code"
                placeholderTextColor="#999"
                value={inviteCode}
                onChangeText={setInviteCode}
                editable={!isLoading}
                maxLength={50}
                autoCapitalize="upper"
                returnKeyType="done"
                onSubmitEditing={handleJoinGroup}
              />
            </View>

            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={16} color={COLORS.primary} />
              <Text style={styles.infoBoxText}>
                You'll need to wait for the group manager to approve your request.
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleClose}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>Maybe Later</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.joinButton]}
                onPress={handleJoinGroup}
                disabled={isLoading || !inviteCode.trim()}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="add-circle-outline" size={20} color="#fff" />
                    <Text style={styles.joinButtonText}>Send Request</Text>
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

const styles = {
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
    marginHorizontal: "auto" as any,
  },
  header: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: "#1a1a1a",
  },
  description: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 20,
  },
  inputSection: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1a1a1a",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#1a1a1a",
  },
  infoBox: {
    flexDirection: "row" as const,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    alignItems: "flex-start" as const,
    gap: 10,
  },
  infoBoxText: {
    fontSize: 12,
    color: "#666",
    flex: 1,
    lineHeight: 16,
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
  joinButton: {
    backgroundColor: COLORS.primary,
    gap: 8,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#fff",
  },
  submitButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: COLORS.primary,
    marginTop: 16,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#fff",
  },
  successIcon: {
    alignItems: "center" as const,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: "#1a1a1a",
    textAlign: "center" as const,
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 14,
    color: "#666",
    textAlign: "center" as const,
    lineHeight: 20,
    marginBottom: 24,
  },
};
