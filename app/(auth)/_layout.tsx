import { Colors } from "@/constants/color";
import { ForceUpdateModal } from "@/global/modal/force-update-modal";
import { useVersionCheck } from "@/global/utils/version-check";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Stack } from "expo-router";
import { Alert, Linking, Platform, StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function AuthLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";

  const { updateRequired, updateInfo } = useVersionCheck();

  const handleUpdate = () => {
    if (updateInfo?.storeUrls) {
      const { deepLink, webUrl } = updateInfo.storeUrls;

      Linking.openURL(deepLink).catch(() => {
        Linking.openURL(webUrl).catch(() => {
          Alert.alert(
            "Update Required",
            `Please update the app from the ${Platform.OS === "ios" ? "App Store" : "Google Play Store"}`
          );
        });
      });
    } else {
      Alert.alert(
        "Update Required",
        `Please update the app from the ${Platform.OS === "ios" ? "App Store" : "Google Play Store"}`
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
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: "slide_from_right",
          animationDuration: 300,
        }}
      >
        <Stack.Screen
          name="getting-started"
          options={{
            animation: "fade",
            animationDuration: 400,
          }}
        />
        <Stack.Screen
          name="tenant-select"
          options={{
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="login"
          options={{
            animation: "slide_from_right",
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
