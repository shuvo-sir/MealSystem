import React, { useEffect, useRef, useState } from "react";
import { Animated, Text, View } from "react-native";
import { Accelerometer } from "expo-sensors";
import { styles } from "@/assets/styles/home.styles";

const SHAKE_THRESHOLD = 1.8;
const SHOW_DURATION_MS = 2500;
const MIN_COOLDOWN_MS = 1800;

export const DeveloperReveal: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;
  const lastShakeRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();

      if (magnitude > SHAKE_THRESHOLD && now - lastShakeRef.current > MIN_COOLDOWN_MS) {
        lastShakeRef.current = now;
        setIsVisible(true);

        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 180,
            useNativeDriver: true,
          }),
          Animated.spring(scale, {
            toValue: 1,
            friction: 6,
            tension: 100,
            useNativeDriver: true,
          }),
        ]).start();

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          Animated.parallel([
            Animated.timing(opacity, {
              toValue: 0,
              duration: 220,
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 0.85,
              duration: 220,
              useNativeDriver: true,
            }),
          ]).start(() => {
            setIsVisible(false);
          });
        }, SHOW_DURATION_MS);
      }
    });

    Accelerometer.setUpdateInterval(150);

    return () => {
      subscription.remove();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [opacity, scale]);

  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.devRevealOverlay, { opacity, transform: [{ scale }] }]}
    >
      <View style={styles.devRevealCard}>
        <Text style={styles.devRevealBadge}>Developer</Text>
        <Text style={styles.devRevealName}>Shuvo Halder</Text>
        <Text style={styles.devRevealText}>Built with care</Text>
      </View>
    </Animated.View>
  );
};
