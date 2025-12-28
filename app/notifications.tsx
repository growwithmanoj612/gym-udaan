// app/(auth)/(tabs)/notifications.tsx
import NotificationItem from "@/components/notification/notifications";
import { Colors } from "@/constants/color";
import { notifications as seedData } from "@/data/notifications";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotificationsScreen() {
  const router = useRouter();
  const [items, setItems] = useState(seedData);
  const theme = useColorScheme() ?? "dark";
  const C = Colors[theme];

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: C.background,
      }}
      edges={["top", "left", "right"]}
    >
      <View
        style={{
          flex: 1,
          paddingHorizontal: 20,
          paddingTop: Platform.OS === "android" ? 20 : 0,
        }}
      >
        {/* HEADER */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 25,
            justifyContent: "space-between",
          }}
        >
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.8}
            style={{
              padding: 8,
              borderRadius: 12,
              backgroundColor: C.backgroundSecondary,
              borderWidth: 1,
              borderColor: C.borderLight,
              shadowColor: C.primary,
              shadowOpacity: 0.5,
              shadowRadius: 8,
            }}
          >
            <Ionicons name="arrow-back" size={24} color={C.primaryLight} />
          </TouchableOpacity>

          {/* Screen Title */}
          <Text
            style={{
              flex: 1,
              textAlign: "center",
              fontSize: 20,
              fontWeight: "800",
              color: C.primaryLight,
              textShadowColor: C.shadowDark,
              textShadowRadius: 10,
              marginLeft: -32, // centers title despite back button
            }}
          >
            Notifications
          </Text>

          {/* Mark All Read */}
          <TouchableOpacity
            onPress={markAllRead}
            activeOpacity={0.8}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 14,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: C.primary,
              backgroundColor: C.backgroundSecondary,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              shadowColor: C.primary,
              shadowRadius: 6,
              shadowOpacity: 0.4,
            }}
          >
            <Ionicons name="checkmark-done" size={20} color={C.primary} />
            <Text style={{ fontWeight: "700", color: C.primary, fontSize: 14 }}>
              Mark All
            </Text>
          </TouchableOpacity>
        </View>

        {/* LIST */}
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => (
            <NotificationItem
              item={item}
              onPress={() => {
                setItems((old) =>
                  old.map((x) => (x.id === item.id ? { ...x, read: true } : x))
                );
              }}
            />
          )}
        />
      </View>
    </SafeAreaView>
  );
}
