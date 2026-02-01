import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/color";
import { ForceUpdateModal } from "@/global/modal/force-update-modal";
import { useVersionCheck } from "@/global/utils/version-check";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/store/useAuthStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { Ionicons, Octicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Alert, Linking, Platform, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ??  "light"];
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const { isOffline } = useAuthStore();
  const insets = useSafeAreaInsets();

  // Calculate the tab bar height based on platform and safe area insets
  const tabBarHeight = Platform. select({
    ios: 88,
    android:  60 + insets.bottom, // Add bottom inset for Android navigation bar
    default: 68,
  });

  const tabBarPaddingBottom = Platform.select({
    ios: 28,
    android: Math.max(insets.bottom, 8), // Use bottom inset or minimum padding
    default: 12,
  });
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
    <View style={{ flex: 1 }}>
      {isOffline && (
        <View style={{ backgroundColor: 'orange', padding: 10, alignItems: 'center' }}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>
            You're offline.  Connect to the internet for full features.
          </Text>
        </View>
      )}
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor:  colors.textTertiary,
          headerShown: false,
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
        <Tabs. Screen
          name="message"
          options={{
            title: "Message",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "chatbubbles-outline" : "chatbubbles"}
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
                name={focused ? "restaurant" : "restaurant-outline"}
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
                name={focused ? "checkmark-circle" :  "checkmark-circle-outline"}
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
    </View>
  );
}