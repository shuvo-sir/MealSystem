import React, { useEffect, useRef } from "react";
import { View, Text, Animated, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/constants/colors";

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = "Loading..." }) => {
  // Set up animation drivers
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Trigger animations immediately when the loading screen mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600, // Faster duration since it's an in-app loader
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      <View style={styles.content}>
        
        {/* Animated Image replacing the ActivityIndicator */}
        <Animated.Image
          source={require("../../assets/images/Recipe book-pana.png")}
          style={[
            styles.image,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
          resizeMode="contain"
        />

        {/* Animated text that accepts your dynamic message prop */}
        <Animated.Text style={[styles.messageText, { opacity: fadeAnim }]}>
          {message}
        </Animated.Text>
        
      </View>
    </SafeAreaView>
  );
};

// Scoped styles to keep your loading screen clean and centered
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background, // 👈 Now dynamically matches your active theme background
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  image: {
    width: 180, // Slightly smaller than splash screen so it feels like an in-app loader
    height: 180,
    marginBottom: 20,
  },
  messageText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text, // 👈 Now dynamically matches your active theme text color
    textAlign: "center",
  },
});