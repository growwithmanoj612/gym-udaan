import { useAuth } from "@/store/useAuth";
import { useRouter } from "expo-router";
import { Button, StyleSheet, Text, View } from "react-native";

export default function GettingStarted() {
  const router = useRouter();
  const { completeOnboarding } = useAuth();

  const handleGetStarted = () => {
    completeOnboarding();
    router.replace("/(auth)/tenant-select");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Gym Udaan!</Text>
      <Text style={styles.subtitle}>Lets get you started</Text>
      <Button title="Get Started" onPress={handleGetStarted} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
  },
});
