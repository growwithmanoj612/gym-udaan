import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Slot, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { LogLevel, OneSignal } from "react-native-onesignal";
import { Alert, Linking, Platform } from "react-native";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { ToastProvider } from "@/providers/toast-provider";
import { useAuthStore } from "@/store/useAuthStore"; 
import { useVersionCheck } from "@/global/utils/version-check";
import { ForceUpdateModal } from "@/global/modal/force-update-modal";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  
  // ✅ Version check hook (which internally uses global store)
  const { updateRequired, updateInfo } = useVersionCheck();

  useEffect(() => {
    OneSignal.Debug.setLogLevel(LogLevel. Verbose);
    OneSignal.initialize("62593ae1-e19c-4b19-895c-fd5a086ccb39");
    OneSignal. Notifications.requestPermission(true);

    OneSignal.Notifications.addEventListener("click", (event: any) => {
      const route = event. notification.additionalData?.route;
      if (typeof route === "string") {
        router.push(route as any);
      }
    });

    const unsubscribe = useAuthStore. subscribe((state) => {
      if (state.isAuthenticated && state.appUser?.id) {
        OneSignal.User. addTag("user_id", state.appUser.id. toString());
        console.log("OneSignal:  Set user_id tag to", state.appUser.id);
      } else if (! state.isAuthenticated) {
        OneSignal.User.removeTag("user_id");
        console.log("OneSignal: Removed user_id tag");
      }
    });

    return unsubscribe;
  }, [router]);

  // ✅ Updated to use new deepLink and webUrl structure
  const handleUpdate = () => {
    if (updateInfo?.storeUrls) {
      const { deepLink, webUrl } = updateInfo.storeUrls;
      
      // Try deep link first (opens directly in App Store/Play Store app)
      Linking.openURL(deepLink).catch(() => {
        // Fallback to web URL (opens in browser)
        Linking.openURL(webUrl).catch(() => {
          // Final fallback - show alert
          Alert.alert(
            "Update Required",
            `Please update the app from the ${Platform.OS === 'ios' ? 'App Store' : 'Google Play Store'}`
          );
        });
      });
    } else {
      // If no backend URLs, show alert
      Alert.alert(
        "Update Required",
        `Please update the app from the ${Platform.OS === 'ios' ? 'App Store' :  'Google Play Store'}`
      );
    }
  };

  if (updateRequired) {
    return (
      <ForceUpdateModal
        visible={true}
        message={updateInfo?.updateMessage}
        onUpdate={handleUpdate}
      />
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ?  DarkTheme : DefaultTheme}>
      <ToastProvider>
        <Slot />
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      </ToastProvider>
    </ThemeProvider>
  );
}