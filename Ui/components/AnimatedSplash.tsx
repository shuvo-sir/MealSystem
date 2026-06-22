import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
} from "react-native";

export default function AnimatedSplash({
  onFinish,
}: {
  onFinish: () => void;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      onFinish();
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require("../assets/images/Recipe book-pana.png")}
        style={[
          styles.image,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
        resizeMode="contain"
      />

      <Animated.Text
        style={[
          styles.title,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        Meal Management
      </Animated.Text>

      <Text style={styles.subtitle}>
        Manage meals smarter
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6F4FE",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  image: {
    width: 280,
    height: 280,
  },

  title: {
    marginTop: 20,
    fontSize: 28,
    fontWeight: "700",
    color: "#1E293B",
  },

  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: "#64748B",
  },
});