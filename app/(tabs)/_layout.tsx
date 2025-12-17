// app/(tabs)/_layout.tsx
import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/color";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useNotificationStore } from "@/store/useNotificationStore";
import { Ionicons, Octicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native"; 

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const unreadCount = useNotificationStore((state) => state.unreadCount);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors. primary,
        tabBarInactiveTintColor: colors.textTertiary,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 88 : 68,
          paddingBottom: Platform.OS === "ios" ? 28 : 12,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize:  11,
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
              name={focused ? "notifications" : "notifications-outline"}
              size={24}
              color={color}
            />
          ),
          tabBarBadge: unreadCount > 0 ?  unreadCount : undefined,
        }}
      />
      <Tabs.Screen
        name="diet-plans"
        options={{
          title: "Diet Plans",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ?  "restaurant" : "restaurant-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: "Check-in",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "checkmark-circle" : "checkmark-circle-outline"}
              size={28}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}