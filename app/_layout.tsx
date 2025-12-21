import { registerForPushNotificationsAsync } from "@/components/notification/notifications";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { ToastProvider } from "@/providers/toast-provider";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import { Slot, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";

type NotificationData = {
  route?: string;
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    // Register push token
    registerForPushNotificationsAsync();

    // Foreground notifications
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Foreground notification:", notification);
      });

    // User taps notification
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content
          .data as NotificationData;

        console.log("Notification tapped:", data);

        if (data.route && typeof data.route === "string") {
          router.push(data.route as any);
        }
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [router]);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <ToastProvider>
        <Slot />
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      </ToastProvider>
    </ThemeProvider>
  );
}
