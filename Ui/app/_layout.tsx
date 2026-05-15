import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { Stack } from "expo-router";
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

if (!publishableKey) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

export default function RootLayout() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
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