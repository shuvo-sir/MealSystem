import React from "react";
import { View, Pressable, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/colors";

export interface SettingsMenuItem {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}

interface SettingsMenuProps {
  items: SettingsMenuItem[];
}

export const SettingsMenu: React.FC<SettingsMenuProps> = ({ items }) => {
  return (
    <View>
      {items.map((item, index) => (
        <Pressable
          key={index}
          onPress={item.onPress}
          style={({ pressed }) => [
            {
              paddingHorizontal: 20,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: COLORS.border,
              opacity: pressed ? 0.7 : 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            },
          ]}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Ionicons name={item.icon as any} size={24} color={COLORS.primary} />
            <View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: COLORS.text,
                }}
              >
                {item.title}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: COLORS.textLight,
                  marginTop: 4,
                }}
              >
                {item.subtitle}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
        </Pressable>
      ))}
    </View>
  );
};
