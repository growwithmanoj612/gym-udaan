import { ONBOARDING_KEY, TENANT_KEY, useAuthStore } from "@/store/useAuthStore";
import { useIsFocused } from "@react-navigation/native";
import { Redirect, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const isFocused = useIsFocused();
  const { checkAuth, isAuthenticated, isOffline, selectedTenantId, hasCompletedOnboarding, loadPersistedState } = useAuthStore();

  useEffect(() => {
    const performAuthCheck = async () => {
      setIsLoading(true);
      await loadPersistedState(); // Load onboarding and tenant from storage
      await checkAuth();
      setIsLoading(false);
    };
    if (isFocused) {
      performAuthCheck();
    }
  }, [isFocused]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Checking authentication...</Text>
      </View>
    );
  }

  if (isOffline) {
    return (
      <View style={{ backgroundColor: 'orange', padding: 10 }}>
        <Text>You're offline. Connect to the internet for full features.</Text>
      </View>
    );
  }

  // Redirect logic
  if (!hasCompletedOnboarding) {
    return <Redirect href="/(auth)/getting-started" />;
  }

  if (!selectedTenantId) {
    return <Redirect href="/(auth)/tenant-select" />;
  }

  // Allow access if authenticated, even offline
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  // If not authenticated and not offline (or auth failed), redirect to login
  return <Redirect href="/(auth)/login" />;
}