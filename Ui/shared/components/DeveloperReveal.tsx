import React, { useEffect, useRef, useState } from "react";
import { 
  Animated, 
  Text, 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Linking 
} from "react-native";
import { Accelerometer } from "expo-sensors";
// IMPORTANT: Update this path to wherever your colors.js file is located
import { COLORS } from "@/constants/colors"; 

const SHAKE_THRESHOLD = 1.8;
const MIN_COOLDOWN_MS = 1800;

export const DeveloperReveal: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;
  const lastShakeRef = useRef(0);
  const isShowingRef = useRef(false);

  useEffect(() => {
    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();

      if (magnitude > SHAKE_THRESHOLD && now - lastShakeRef.current > MIN_COOLDOWN_MS) {
        lastShakeRef.current = now;

        if (!isShowingRef.current) {
          isShowingRef.current = true;
          setIsVisible(true);

          Animated.parallel([
            Animated.timing(opacity, {
              toValue: 1,
              duration: 250,
              useNativeDriver: true,
            }),
            Animated.spring(scale, {
              toValue: 1,
              friction: 8,
              tension: 80,
              useNativeDriver: true,
            }),
          ]).start();
        } else {
          isShowingRef.current = false;

          Animated.parallel([
            Animated.timing(opacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 0.95,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => {
            setIsVisible(false);
          });
        }
      }
    });

    Accelerometer.setUpdateInterval(150);

    return () => {
      subscription.remove();
    };
  }, [opacity, scale]);

  const handleSupportEmail = () => {
    Linking.openURL("mailto:support@mealapp.com?subject=MealApp Problem Report");
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View
      style={[styles.fullScreen, { opacity, transform: [{ scale }] }]}
    >
      <View style={styles.contentContainer}>
        {/* Header / Developer Info */}
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>Developer Mode</Text>
        </View>
        
        <Text style={styles.name}>Shuvo Halder</Text>
        <Text style={styles.tagline}>Built with care</Text>

        <View style={styles.divider} />

        {/* App Info & Copyright */}
        <Text style={styles.appInfo}>MealApp v1.0.0</Text>
        <Text style={styles.copyright}>© 2026 All rights reserved</Text>

        {/* Clickable Support Email */}
        <TouchableOpacity 
          style={styles.emailButton} 
          onPress={handleSupportEmail}
          activeOpacity={0.8}
        >
          <Text style={styles.emailIcon}>📧</Text>
          <Text style={styles.emailText}>support@mealapp.com</Text>
        </TouchableOpacity>
        <Text style={styles.emailHint}>Tap to report a problem</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.shakeHint}>📱 Shake again to return</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.background, 
    zIndex: 9999,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  contentContainer: {
    alignItems: "center",
    width: "100%",
    flex: 1,
    justifyContent: "center",
  },
  badgeContainer: {
    backgroundColor: COLORS.card,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.primary,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  badgeText: {
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  name: {
    fontSize: 34,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 18,
    color: COLORS.textLight,
    fontWeight: "500",
    fontStyle: "italic",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    width: "60%",
    marginVertical: 32,
  },
  appInfo: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  copyright: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 32,
  },
  emailButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  emailIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  emailText: {
    fontSize: 16,
    color: COLORS.white, // Using white so it always contrasts nicely with the primary button color
    fontWeight: "600",
  },
  emailHint: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  footer: {
    paddingBottom: 40,
  },
  shakeHint: {
    color: COLORS.textLight,
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
});