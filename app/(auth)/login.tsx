import { useAuth } from "@/store/useAuth";
import { useRouter } from "expo-router";
import { Button, StyleSheet, Text, View } from "react-native";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = () => {
    login({ id: "123", name: "User" });
    router.replace("/(tabs)");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <Button title="Login" onPress={handleLogin} />
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
    marginBottom: 30,
  },
});
