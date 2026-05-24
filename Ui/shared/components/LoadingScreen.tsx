import React from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/constants/colors";
import { styles } from "@/assets/styles/home.styles";

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {
  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      <View style={[styles.content, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={{ marginBottom: 16 }}
        />
      </View>
    </SafeAreaView>
  );
};
