import React, { useMemo } from "react";
import { View, ScrollView, Text, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/colors";
import { styles } from "@/assets/styles/home.styles";
import { useManagerStatus } from "@/shared/hooks/useManagerStatus";
import { useSettingsModals } from "@/shared/hooks/useSettingsModals";
import { SettingsMenu, SettingsMenuItem } from "@/shared/components/settings/SettingsMenu";
import { GroupInfoModal } from "@/shared/components/settings/modals/GroupInfoModal";
import { PendingRequestsModal } from "@/shared/components/settings/modals/PendingRequestsModal";
import { TransferManagerModal } from "@/shared/components/settings/modals/TransferManagerModal";

export default function ManagerScreen() {
  const { user } = useUser();
  const { isManager, userMealGroupId, mealGroupData, isLoading: managerLoading, refreshManagerStatus } = useManagerStatus();
  const { modals, openModal, closeModal } = useSettingsModals();

  const isOwner = useMemo(() => {
    return mealGroupData?.owner?.toString() === user?.id || false;
  }, [mealGroupData, user]);

  const managerItems: SettingsMenuItem[] = useMemo(
    () => [
      {
        icon: "information-circle",
        title: "Group Info",
        subtitle: "View group details and invite code",
        onPress: () => openModal("groupInfoModal"),
      },
      {
        icon: "people",
        title: "Pending Member Requests",
        subtitle: "Approve or reject join requests",
        onPress: () => openModal("pendingRequestsModal"),
      },
      {
        icon: isOwner ? "crown" : "swap-horizontal",
        title: isOwner ? "Transfer Ownership" : "Delegate Manager",
        subtitle: isOwner
          ? "Transfer group ownership to another member"
          : "Promote a member temporarily or permanently",
        onPress: () => openModal("transferManagerModal"),
      },
    ],
    [openModal, isOwner]
  );

  const content = () => {
    if (managerLoading) {
      return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 16, color: COLORS.textLight }}>Loading manager controls...</Text>
        </View>
      );
    }

    if (!isManager || !userMealGroupId) {
      return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 }}>
          <Ionicons name="shield-checkmark-outline" size={56} color={COLORS.border} />
          <Text style={{ marginTop: 18, fontSize: 18, fontWeight: "700", color: COLORS.text, textAlign: "center" }}>
            Manager controls are available only to group owners and managers.
          </Text>
          <Text style={{ marginTop: 12, fontSize: 14, color: COLORS.textLight, textAlign: "center" }}>
            If you are an owner or manager, make sure your group is active and try refreshing the app.
          </Text>
        </View>
      );
    }

    return <SettingsMenu items={managerItems} />;
  };

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
          <View style={{ paddingHorizontal: 20, paddingVertical: 18 }}>
            <Text style={{ fontSize: 26, fontWeight: "700", color: COLORS.text, marginBottom: 8 }}>
              {isOwner ? "👑 Owner Controls" : "👨‍💼 Manager Controls"}
            </Text>
            <Text style={{ fontSize: 14, color: COLORS.textLight, lineHeight: 20 }}>
              {isOwner
                ? "Manage your group, handle member requests, and transfer ownership as needed."
                : "Access your group management tools and handle member requests, transfer roles, or view group details."}
            </Text>
          </View>

          {content()}
        </View>
      </ScrollView>

      <GroupInfoModal
        visible={modals.groupInfoModal}
        onClose={() => closeModal("groupInfoModal")}
        mealGroupData={mealGroupData}
        isLoading={managerLoading}
      />

      <PendingRequestsModal
        visible={modals.pendingRequestsModal}
        onClose={() => closeModal("pendingRequestsModal")}
        userMealGroupId={userMealGroupId}
      />

      <TransferManagerModal
        visible={modals.transferManagerModal}
        onClose={() => closeModal("transferManagerModal")}
        mealGroupData={mealGroupData}
        onTransferSuccess={refreshManagerStatus}
        isOwner={isOwner}
      />
    </SafeAreaView>
  );
}
