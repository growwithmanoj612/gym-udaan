import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
  useIsFocused,
} from "@react-navigation/native";
import { Slot, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { LogLevel, OneSignal } from "react-native-onesignal";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { ToastProvider } from "@/providers/toast-provider";
import { useAuthStore } from "@/store/useAuthStore"; // Add this import

export default function RootLayout() {
   
  const colorScheme = useColorScheme();
  const router = useRouter(); 

  useEffect(() => {
    // 🔹 OneSignal debug logs (remove in production)
    OneSignal.Debug.setLogLevel(LogLevel.Verbose);

    // 🔹 Initialize OneSignal
    OneSignal.initialize("62593ae1-e19c-4b19-895c-fd5a086ccb39");

    // 🔹 Request permission
  OneSignal.Notifications.requestPermission(true); 

    // 🔹 Handle notification click
    OneSignal.Notifications.addEventListener("click", (event: any) => {
      const route = event.notification.additionalData?.route;
      if (typeof route === "string") {
        router.push(route as any);
      }
    });

    // 🔹 Subscribe to auth state changes
    const unsubscribe = useAuthStore.subscribe((state) => {
     
 
// In the subscribe callback
if (state.isAuthenticated && state.appUser?.id) {
  OneSignal.User.addTag("user_id", state.appUser.id.toString());
  console.log("OneSignal: Set user_id tag to", state.appUser.id);
} else if (!state.isAuthenticated) {
  OneSignal.User.removeTag("user_id");
  console.log("OneSignal: Removed user_id tag");
}
    });

    // Cleanup subscription on unmount
    return unsubscribe;
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





// import { useEffect } from "react";
// import { Slot, useRouter } from "expo-router";
// import { StatusBar } from "expo-status-bar";
// import {
//   DarkTheme,
//   DefaultTheme,
//   ThemeProvider,
// } from "@react-navigation/native";
// import { OneSignal, LogLevel } from "react-native-onesignal";

// import { useColorScheme } from "@/hooks/use-color-scheme";
// import { ToastProvider } from "@/providers/toast-provider";

// export default function RootLayout() {
//   const colorScheme = useColorScheme();
//   const router = useRouter();

//   useEffect(() => {
//     // 🔹 OneSignal debug logs (remove in production)
//     OneSignal.Debug.setLogLevel(LogLevel.Verbose);

//     // 🔹 Initialize OneSignal
//     OneSignal.initialize("62593ae1-e19c-4b19-895c-fd5a086ccb39");

//     // 🔹 Request permission
//     OneSignal.Notifications.requestPermission(false);

//     // 🔹 Handle notification click
//     OneSignal.Notifications.addEventListener("click", (event:any) => {
//       const route = event.notification.additionalData?.route;

//       if (typeof route === "string") {
//         router.push(route as any);
//       }
//     });
//   }, [router]);

//   return (
//     <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
//       <ToastProvider>
//         <Slot />
//         <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
//       </ToastProvider>
//     </ThemeProvider>
//   );
// }
