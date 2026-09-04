import React, { useEffect, useRef } from "react";
import {
  Text,
  StyleSheet,
  Animated,
} from "react-native";
import { COLORS } from "../constants/colors";


export default function AnimatedSplash({
  onFinish,
}: {
  onFinish: () => void;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const exitAnim = useRef(new Animated.Value(1)).current;

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
      Animated.timing(exitAnim, {
        toValue: 0,
        duration: 320,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          onFinish();
        }
      });
    }, 2500);

    return () => {
      clearTimeout(timer);
      fadeAnim.stopAnimation();
      scaleAnim.stopAnimation();
      exitAnim.stopAnimation();
    };
  }, [exitAnim, fadeAnim, onFinish, scaleAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: exitAnim,
          transform: [{ scale: exitAnim }],
        },
      ]}
    >
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

      {/* Replaced fixed color with Animated.Text just to safely handle the fade out if needed, 
          though standard Text works here too. Let's keep it consistent. */}
      <Animated.Text 
        style={[
          styles.subtitle,
          { opacity: fadeAnim }
        ]}
      >
        Manage meals smarter
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background, // 👈 Uses theme background
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
    color: COLORS.text, // 👈 Uses theme primary text color
  },

  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.textLight, // 👈 Uses theme secondary/light text color
  },
});