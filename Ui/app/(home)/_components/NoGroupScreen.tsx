import React from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@clerk/expo";
import { COLORS } from "@/constants/colors";
import { styles } from "../../../assets/styles/home.styles";
import { GroupAction } from "../types/homeScreen.types";

interface NoGroupScreenProps {
  groupAction: GroupAction;
  groupName: string;
  inviteCode: string;
  isLoading: boolean;
  onSetGroupAction: (action: GroupAction) => void;
  onSetGroupName: (name: string) => void;
  onSetInviteCode: (code: string) => void;
  onGroupSubmit: () => void;
  avatarImageFailed: boolean;
  onAvatarImageFailed: (failed: boolean) => void;
  userName: string;
}

export const NoGroupScreen: React.FC<NoGroupScreenProps> = ({
  groupAction,
  groupName,
  inviteCode,
  isLoading,
  onSetGroupAction,
  onSetGroupName,
  onSetInviteCode,
  onGroupSubmit,
  avatarImageFailed,
  onAvatarImageFailed,
  userName,
}) => {
  const { user } = useUser();

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {user?.imageUrl && !avatarImageFailed ? (
                <Image
                  source={{ uri: user.imageUrl }}
                  style={[styles.headerLogo, { borderRadius: 50 }]}
                  onError={() => onAvatarImageFailed(true)}
                />
              ) : (
                <Image
                  source={require("../../../assets/images/icon.png")}
                  style={styles.headerLogo}
                />
              )}
              <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeText}>Welcome</Text>
                <Text style={styles.usernameText}>{userName}</Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => alert("Add Money")}
              >
                <Ionicons name="add-circle" size={24} color="#fff" />
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Group Setup Card */}
          <View style={styles.setupCard}>
            <Text style={styles.setupTitle}>Meal Group</Text>
            <Text style={styles.setupSubtitle}>No meal group yet</Text>

            <View style={styles.setupActionRow}>
              <TouchableOpacity
                style={[
                  styles.setupActionButton,
                  groupAction === "create" && styles.setupActionButtonActive,
                ]}
                onPress={() => onSetGroupAction("create")}
              >
                <Ionicons
                  name="add-circle"
                  size={22}
                  color={
                    groupAction === "create" ? COLORS.white : COLORS.primary
                  }
                />
                <Text
                  style={[
                    styles.setupActionText,
                    groupAction === "create" &&
                      styles.setupActionTextActive,
                  ]}
                >
                  Create Meal
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.setupActionButton,
                  groupAction === "join" && styles.setupActionButtonActive,
                ]}
                onPress={() => onSetGroupAction("join")}
              >
                <Ionicons
                  name="enter"
                  size={22}
                  color={
                    groupAction === "join" ? COLORS.white : COLORS.primary
                  }
                />
                <Text
                  style={[
                    styles.setupActionText,
                    groupAction === "join" && styles.setupActionTextActive,
                  ]}
                >
                  Join Meal
                </Text>
              </TouchableOpacity>
            </View>

            {groupAction && (
              <View style={styles.setupForm}>
                <TextInput
                  style={styles.setupInput}
                  placeholder={
                    groupAction === "create" ? "Group name" : "Invite code"
                  }
                  placeholderTextColor={COLORS.textLight}
                  autoCapitalize={
                    groupAction === "join" ? "characters" : "words"
                  }
                  value={
                    groupAction === "create" ? groupName : inviteCode
                  }
                  onChangeText={
                    groupAction === "create"
                      ? onSetGroupName
                      : onSetInviteCode
                  }
                  editable={!isLoading}
                />

                <TouchableOpacity
                  style={[
                    styles.primaryActionButton,
                    isLoading && styles.primaryActionButtonDisabled,
                  ]}
                  onPress={onGroupSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <Ionicons
                      name={groupAction === "create" ? "checkmark" : "enter"}
                      size={18}
                      color={COLORS.white}
                    />
                  )}
                  <Text style={styles.primaryActionButtonText}>
                    {groupAction === "create" ? "Create Group" : "Join Group"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
