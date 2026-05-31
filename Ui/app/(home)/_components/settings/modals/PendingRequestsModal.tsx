import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/colors";
import { getPendingRequests, acceptMember, rejectMember } from "@/api/meal.api";

interface PendingRequestsModalProps {
  visible: boolean;
  onClose: () => void;
  userMealGroupId: string | null;
}

interface PendingRequest {
  _id: string;
  userName?: string;
  userId?: string;
  userEmail?: string;
  inviteCode?: string;
  joinCode?: string;
}

export const PendingRequestsModal: React.FC<PendingRequestsModalProps> = ({
  visible,
  onClose,
  userMealGroupId,
}) => {
  const { getToken } = useAuth();
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPendingRequests = async () => {
    if (!userMealGroupId) return;

    setLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        Alert.alert("Error", "Authentication token not found");
        setLoading(false);
        return;
      }
      const data = await getPendingRequests(userMealGroupId, token);
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading pending requests:", error);
      Alert.alert("Error", "Failed to load pending requests");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptMember = async (requestId: string) => {
    try {
      const token = await getToken();
      if (!token) {
        Alert.alert("Error", "Authentication token not found");
        return;
      }
      await acceptMember(requestId, token);
      Alert.alert("Success", "Member request accepted!");
      await loadPendingRequests();
    } catch (error) {
      console.error("Error accepting member:", error);
      Alert.alert("Error", "Failed to accept member request");
    }
  };

  const handleRejectMember = async (requestId: string) => {
    try {
      const token = await getToken();
      if (!token) {
        Alert.alert("Error", "Authentication token not found");
        return;
      }
      await rejectMember(requestId, token);
      Alert.alert("Success", "Member request rejected!");
      await loadPendingRequests();
    } catch (error) {
      console.error("Error rejecting member:", error);
      Alert.alert("Error", "Failed to reject member request");
    }
  };

  useEffect(() => {
    if (visible && userMealGroupId) {
      loadPendingRequests();
    }
  }, [visible]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
        {/* Header */}
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
            Pending Member Requests
          </Text>
          <TouchableOpacity
            onPress={onClose}
            disabled={loading}
          >
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={{ flex: 1, paddingHorizontal: 20, paddingVertical: 16 }}>
          {loading ? (
            <View style={{ justifyContent: "center", alignItems: "center", marginTop: 50 }}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : requests.length === 0 ? (
            <View style={{ justifyContent: "center", alignItems: "center", marginTop: 50 }}>
              <Text style={{ fontSize: 16, color: COLORS.textLight }}>
                No pending requests
              </Text>
            </View>
          ) : (
            <View>
              {requests.map((request) => (
                <View
                  key={request._id}
                  style={{
                    backgroundColor: COLORS.card,
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 16,
                    borderWidth: 1,
                    borderColor: COLORS.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: COLORS.text,
                      marginBottom: 8,
                    }}
                  >
                    {request.userName || request.userId}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: COLORS.textLight,
                      marginBottom: 8,
                    }}
                  >
                    Email: {request.userEmail || "N/A"}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: COLORS.textLight,
                      marginBottom: 12,
                    }}
                  >
                    <Text style={{ fontWeight: "600", color: COLORS.primary }}>
                      Invite Code:{" "}
                    </Text>
                    {request.inviteCode || request.joinCode || "N/A"}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <Pressable
                      onPress={() => handleAcceptMember(request._id)}
                      style={{
                        flex: 1,
                        backgroundColor: COLORS.primary,
                        paddingVertical: 10,
                        paddingHorizontal: 16,
                        borderRadius: 8,
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: COLORS.white,
                          fontWeight: "600",
                          fontSize: 14,
                        }}
                      >
                        Accept
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleRejectMember(request._id)}
                      style={{
                        flex: 1,
                        backgroundColor: COLORS.expense,
                        paddingVertical: 10,
                        paddingHorizontal: 16,
                        borderRadius: 8,
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: COLORS.white,
                          fontWeight: "600",
                          fontSize: 14,
                        }}
                      >
                        Reject
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};
