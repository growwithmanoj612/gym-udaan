import { useAuthStore } from "@/store/useAuthStore";
import { useIsFocused } from "@react-navigation/native";
import { Redirect, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const isFocused = useIsFocused();
  const { checkAuth, isAuthenticated, appUser, isOffline } = useAuthStore();

  const hasCompletedOnboarding = appUser?.fullName;
  const hasSelectedTenant = appUser?.businessDetailsId;

  useEffect(() => {
    const performAuthCheck = async () => {
      setIsLoading(true);
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

  {
    isOffline && (
      <View style={{ backgroundColor: 'orange', padding: 10 }}>
        <Text>You're offline. Connect to the internet for full features.</Text>
      </View>
    )
  }

  // Redirect logic
  if (!hasCompletedOnboarding) {
    return <Redirect href="/(auth)/getting-started" />;
  }

  if (!hasSelectedTenant) {
    return <Redirect href="/(auth)/tenant-select" />;
  }

  // Allow access if authenticated, even offline
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  // If not authenticated and not offline (or auth failed), redirect to login
  return <Redirect href="/(auth)/login" />;
}