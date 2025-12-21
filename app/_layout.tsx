import { useColorScheme } from "@/hooks/use-color-scheme";
import { ToastProvider } from "@/providers/toast-provider";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
// import messaging from '@react-native-firebase/messaging';

export default function RootLayout() {
  // const requestUserPermission = async (): Promise<boolean> => {
  //   const authStatus = await messaging().requestPermission();

  //   const enabled =
  //     authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
  //     authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  //   if (enabled) {
  //     console.log("Authorization status:", authStatus);
  //   }

  //   return enabled;
  // };

  const colorScheme = useColorScheme();

  // useEffect(() => {
  //   const initFCM = async () => {
  //     const hasPermission = await requestUserPermission();

  //     if (hasPermission) {
  //       const token = await messaging().getToken();
  //       console.log("FCM Token:", token);
  //     } else {
  //       console.log("Notification permission not granted");
  //     }
  //   };

  //   initFCM();

  //   // ---- listeners ----
  //   messaging()
  //     .getInitialNotification()
  //     .then((remoteMessage) => {
  //       if (remoteMessage) {
  //         console.log(
  //           "Notification caused app to open from quit state:",
  //           remoteMessage.notification
  //         );
  //       }
  //     });

  //   const unsubscribeOpen = messaging().onNotificationOpenedApp(
  //     (remoteMessage) => {
  //       console.log(
  //         "Notification caused app to open from background state:",
  //         remoteMessage.notification
  //       );
  //     }
  //   );

  //   const unsubscribeMessage = messaging().onMessage(async (remoteMessage) => {
  //     Alert.alert("A new FCM message arrived!", JSON.stringify(remoteMessage));
  //     console.log("A new FCM message arrived!", remoteMessage);
  //   });

  //   return () => {
  //     unsubscribeOpen();
  //     unsubscribeMessage();
  //   };
  // }, []);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <ToastProvider>
        <Slot />
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      </ToastProvider>
    </ThemeProvider>
  );
}
