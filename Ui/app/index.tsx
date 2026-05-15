import { Redirect } from "expo-router";

export default function Index() {
  // Navigation guards in (auth) and (home) layout files handle routing
  // This acts as a fallback
  return <Redirect href="/(auth)/sign-in" />;
}

