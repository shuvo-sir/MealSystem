import { Image, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../../assets/styles/home.styles";
import { Ionicons } from "@expo/vector-icons";
import { BalanceCard } from "@/components/BalanceCard";
import { useClerk, useUser } from "@clerk/expo";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const { signOut } = useClerk();
  const { user } = useUser();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/(auth)/sign-in");
    } catch (error) {
      console.error("Sign-out error:", error);
    }
  };

  const userName = user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] || "User";

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              source={require("../../assets/images/icon.png")}
              style={styles.headerLogo}
            />
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeText}>Welcome</Text>
              <Text style={styles.usernameText}>{userName}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.addButton} onPress={() => alert("Add new meal")}>
              <Ionicons name="add-circle" size={24} color="#fff" />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addButton, { paddingHorizontal: 12 }]}
              onPress={handleSignOut}
            >
              <Ionicons name="log-out" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        <BalanceCard summary={{ balance: 1000, income: 2000, expenses: 1000 }} />
      </View>
    </View>
  );
}
