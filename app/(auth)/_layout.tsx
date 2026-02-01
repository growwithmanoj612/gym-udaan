import { ForceUpdateModal } from "@/global/modal/force-update-modal";
import { useVersionCheck } from "@/global/utils/version-check";
import { Stack } from "expo-router";
import { Alert, Linking, Platform } from "react-native";

export default function AuthLayout() {
  // ✅ Version check hook (which internally uses global store)
  const { updateRequired, updateInfo } = useVersionCheck();
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
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="getting-started" />
      <Stack.Screen name="tenant-select" />
      <Stack.Screen name="login" />
    </Stack>
  );
}
