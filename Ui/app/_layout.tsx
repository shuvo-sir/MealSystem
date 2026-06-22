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
import { View } from "react-native";

// Keep native splash active during engine boot
SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

if (!publishableKey) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
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

  // Wait underneath the native splash screen until font resources are ready
  if (!fontsLoaded && !fontError) {
    return null;
  }

  // Show your beautiful custom splash screen sequence
  if (showAnimatedSplash) {
    return (
      <View style={{ flex: 1 }} onLayout={onCustomSplashLayout}>
        <AnimatedSplash
          onFinish={() => setShowAnimatedSplash(false)}
        />
      </View>
    );
  }

  // Once custom splash finishes, display the actual app!
  return (
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
  );
}