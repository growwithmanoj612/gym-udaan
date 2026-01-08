import { ONBOARDING_KEY, TENANT_KEY, useAuthStore } from "@/store/useAuthStore";
import { AppUserRoles } from "@/global/enums";
import { useIsFocused } from "@react-navigation/native";
import { Redirect, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const isFocused = useIsFocused();
  const { 
    checkAuth, 
    isAuthenticated, 
    isOffline, 
    selectedTenantId, 
    hasCompletedOnboarding, 
    loadPersistedState,
    appUser  // ✅ Get the user to check role
  } = useAuthStore();

  useEffect(() => {
    const performAuthCheck = async () => {
      setIsLoading(true);
      await loadPersistedState();
      await checkAuth();
      setIsLoading(false);
    };
    if (isFocused) {
      performAuthCheck();
    }
  }, [isFocused]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent:  "center", alignItems: "center" }}>
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
  if (! hasCompletedOnboarding) {
    return <Redirect href="/(auth)/getting-started" />;
  }

  if (! selectedTenantId) {
    return <Redirect href="/(auth)/tenant-select" />;
  }

  // ✅ FIXED: Check role and redirect to correct section (same logic as login)
  if (isAuthenticated && appUser) {
    if (appUser?.appUserRole === AppUserRoles.ROLE_ADMIN) {
      console.log("🔐 Admin detected - redirecting to admin section");
      return <Redirect href="/(admin)" />;
    } else if (appUser?.appUserRole === AppUserRoles.ROLE_MEMBER) {
      console.log("🔐 Member detected - redirecting to member section");
      return <Redirect href="/(tabs)" />;
    } else {
      // Fallback
      return <Redirect href="/(tabs)" />;
    }
  }

  // If not authenticated, redirect to login
  return <Redirect href="/(auth)/login" />;
}