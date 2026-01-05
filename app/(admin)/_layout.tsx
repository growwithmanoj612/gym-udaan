// app/(admin)/_layout.tsx
import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/color";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useNotificationStore } from "@/store/useNotificationStore";
import { Ionicons, Octicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const insets = useSafeAreaInsets();

  // Calculate the tab bar height based on platform and safe area insets
  const tabBarHeight = Platform.select({
    ios:  88,
    android: 60 + insets. bottom, // Add bottom inset for Android navigation bar
    default: 68,
  });

  const tabBarPaddingBottom = Platform.select({
    ios: 28,
    android: Math.max(insets.bottom, 8), // Use bottom inset or minimum padding
    default: 12,
  });

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors. primary,
        tabBarInactiveTintColor: colors.textTertiary,
        headerShown:  false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingBottom: tabBarPaddingBottom,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Octicons
              name="home"
              size={22}
              color={focused ? colors.primary : color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="message"
        options={{
          title: "Message",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "chatbubbles-outline" :  "chatbubbles"}
              size={24}
              color={color}
            />
          ),
          tabBarBadge: unreadCount > 0 ?  unreadCount : undefined,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" :  "person-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}