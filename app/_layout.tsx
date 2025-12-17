import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { ToastProvider } from "@/providers/toast-provider";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme :  DefaultTheme}>
      <ToastProvider>
        <Slot />
        <StatusBar style="auto" />
      </ToastProvider>
    </ThemeProvider>
  );
}