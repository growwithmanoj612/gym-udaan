import { useState, useEffect } from "react";
import { Platform } from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { ToastProvider } from "@/providers/toast-provider";

// Set global notification handler
 

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false,   // Deprecated: Use shouldShowBanner & shouldShowList
    shouldShowBanner: true,   // Show banner notifications
    shouldShowList: true,     // Add notifications to the system notification list
    shouldPlaySound: true,    // Play sound for notifications
    shouldSetBadge: false,    // Do not update badge count
  }),
});

// Function to register for push notifications
// Register for push notifications
async function registerForPushNotificationsAsync() {
  try {
    let token;

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      console.log("Existing notification permission status:", existingStatus);

      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        console.log("Newly requested notification permission status:", status);
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        alert("Permission not granted for push notifications!");
        return;
      }

      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log("Expo Push Token:", token);

      // Send token to the backend
      await fetch("https://your-backend-url/api/register-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      console.log("Push token registered successfully!");
    } else {
      alert("Must use a physical device for Push Notifications.");
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.HIGH,
        sound: "default",
      });
    }
  } catch (error) {
    console.error("Failed to register for notifications:", error);
  }
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Register push notifications
    registerForPushNotificationsAsync();

    // Listener for when the app is in the foreground
    const foregroundSubscription =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification received in foreground:", notification);
        // Show custom toast or UI if required
      });

    // Listener for background notification response clicks
    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification response clicked:", response);

        // Navigate to a specific route if needed, based on notification data
        const route = response.notification.request.content.data.route;
        if (route) {
          console.log(`Navigate to route: ${route}`);
        }
      });

    // Clean up notification listeners on component unmount
    return () => {
      foregroundSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  return (
    <ThemeProvider
      value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
    >
      <ToastProvider>
        <Slot />
        <StatusBar
          style={colorScheme === "dark" ? "light" : "dark"}
        />
      </ToastProvider>
    </ThemeProvider>
  );
}