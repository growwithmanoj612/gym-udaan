import { useAuth } from "@/store/useAuth";
import { useRouter } from "expo-router";
import { Button, StyleSheet, Text, View } from "react-native";

export default function TenantSelect() {
  const router = useRouter();
  const { selectTenant } = useAuth();

  const handleSelectTenant = (tenantId: string) => {
    selectTenant(tenantId);
    router.replace("/(auth)/login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Gym</Text>
      <Button title="Gym A" onPress={() => handleSelectTenant("gym-a")} />
      <Button title="Gym B" onPress={() => handleSelectTenant("gym-b")} />
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
