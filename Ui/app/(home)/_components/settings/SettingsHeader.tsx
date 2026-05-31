import React, { useState, useMemo } from "react";
import { View, Text, Image, Pressable } from "react-native";
import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/colors";
import { styles } from "@/assets/styles/home.styles";

interface SettingsHeaderProps {
  onProfilePress: () => void;
  onChangeProfilePicture: () => void;
  isLoadingProfilePic: boolean;
}

export const SettingsHeader: React.FC<SettingsHeaderProps> = ({
  onProfilePress,
  onChangeProfilePicture,
  isLoadingProfilePic,
}) => {
  const { user } = useUser();
  const [avatarImageFailed, setAvatarImageFailed] = useState(false);

  const firstName = user?.firstName || "";
  const userName = useMemo(
    () =>
      [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
      user?.username ||
      user?.emailAddresses?.[0]?.emailAddress ||
      "Unnamed user",
    [user?.firstName, user?.lastName, user?.username, user?.emailAddresses]
  );

  return (
    <>
      {/* Profile Section */}
      <View style={{ alignItems: "center", paddingBottom: 25 }}>
        {user?.imageUrl && !avatarImageFailed ? (
          <Image
            source={{ uri: user.imageUrl }}
            style={{ width: 75, height: 75, borderRadius: 37.5 }}
            onError={() => setAvatarImageFailed(true)}
          />
        ) : (
          <View
            style={{
              width: 75,
              height: 75,
              borderRadius: 37.5,
              backgroundColor: COLORS.primary,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 24, fontWeight: "bold", color: COLORS.white }}>
              {firstName?.[0]?.toUpperCase() || "U"}
            </Text>
          </View>
        )}
        <View style={{ alignItems: "center", marginTop: 8 }}>
          <Text style={[styles.usernameText, { color: COLORS.textLight }]}>
            {userName}
          </Text>
          <Text
            style={[
              styles.welcomeText,
              { marginTop: 2, fontSize: 14, color: COLORS.textLight },
            ]}
          >
            {user?.emailAddresses?.[0]?.emailAddress}
          </Text>
        </View>
      </View>

      {/* Settings Title */}
      <View
        style={{
          paddingVertical: 20,
          gap: 10,
          flexDirection: "row",
          paddingHorizontal: 20,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.border,
          paddingBottom: 16,
          paddingTop: 10,
        }}
      >
        <Ionicons name="settings" size={28} color={COLORS.primary} />
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            color: COLORS.text,
          }}
        >
          Settings
        </Text>
      </View>
    </>
  );
};
