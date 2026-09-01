import { useEffect, useState, useCallback } from "react";
import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { Stack } from "expo-router";
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";

import { COLORS } from "../constants/colors";

import { useFonts } from "expo-font";
import { Ionicons } from "@expo/vector-icons";
import * as SplashScreen from "expo-splash-screen";

import AnimatedSplash from "../components/AnimatedSplash";
import { StyleSheet, Text, View } from "react-native";

// Keep native splash active during engine boot
SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() ?? "";

function MissingConfigScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
        backgroundColor: COLORS.background,
      }}
    >
      <Text
        style={{
          fontSize: 18,
          fontWeight: "700",
          color: COLORS.text,
          textAlign: "center",
          marginBottom: 8,
        }}
      >
        App configuration is missing
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: COLORS.textLight,
          textAlign: "center",
          lineHeight: 20,
        }}
      >
        The Clerk publishable key was not bundled into this build. Rebuild the APK with the public env variables configured.
      </Text>
    </View>
  );
}

export default function RootLayout() {
  const [showAnimatedSplash, setShowAnimatedSplash] = useState(true);

  const [fontsLoaded, fontError] = useFonts({
    ...Ionicons.font,
  });

  useEffect(() => {
    if (fontsLoaded) {
      console.log('[DEBUG] Ionicons fonts loaded successfully');
    }
    if (fontError) {
      console.error('[DEBUG] Font loading error:', fontError);
    }
  }, [fontsLoaded, fontError]);

  // This trigger runs the moment our Custom Splash Screen view renders to the screen
  const onCustomSplashLayout = useCallback(async () => {
    if (fontsLoaded || fontError) {
      console.log('[DEBUG] Custom splash layout triggered, hiding native splash');
      // Hides the native background instantly now that our custom animated layout is visible
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  const onSplashFinish = useCallback(() => {
    setShowAnimatedSplash(false);
  }, []);

  // Wait underneath the native splash screen until font resources are ready
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <View style={styles.root}>
      {publishableKey ? (
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
          <ClerkProvider
            publishableKey={publishableKey}
            tokenCache={tokenCache}
          >
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: {
                  backgroundColor: COLORS.background,
                },
              }}
            />
          </ClerkProvider>
        </SafeAreaProvider>
      ) : (
        <MissingConfigScreen />
      )}

      {showAnimatedSplash && (
        <View style={styles.splashOverlay} onLayout={onCustomSplashLayout}>
          <AnimatedSplash onFinish={onSplashFinish} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  splashOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
});