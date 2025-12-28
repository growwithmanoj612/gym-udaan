import { useAuthStore } from "@/store/useAuthStore";
import { useIsFocused } from "@react-navigation/native";
import { Redirect, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

// Import your auth store (create this first)
// import { useAuth } from "@/store/useAuth";

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const isFocused = useIsFocused();
  const { checkAuth, isAuthenticated, appUser } = useAuthStore();

  // Simulate auth check - replace with your actual auth logic


  // future ma change hunxa we will use flag
  const hasCompletedOnboarding = appUser?.fullName;
  const hasSelectedTenant = appUser?.businessDetailsId;








  
      useEffect(() => {
    
      checkAuth();
    }, [isFocused]);

  useEffect(() => {
    // Simulate checking auth state
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timeout);
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Redirect logic based on auth state
  if (!hasCompletedOnboarding) {
    return <Redirect href="/(auth)/getting-started" />;
  }

  if (!hasSelectedTenant) {
    return <Redirect href="/(auth)/tenant-select" />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)" />;
}
