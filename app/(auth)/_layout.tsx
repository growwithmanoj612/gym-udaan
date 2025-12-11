import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="getting-started" />
      <Stack.Screen name="tenant-select" />
      <Stack.Screen name="login" />
    </Stack>
  );
}
