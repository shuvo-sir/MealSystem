import { useAuth } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { COLORS } from "../../constants/colors";

export default function AuthRoutesLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: COLORS.background,
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // If user is signed in, redirect to home
  if (isSignedIn) {
    return <Redirect href="/(home)" />;
  }

  return (
  <Stack
    screenOptions={{
      headerShown: false,
      contentStyle: {
        backgroundColor: COLORS.background,
      },
    }}
  />
);
}
