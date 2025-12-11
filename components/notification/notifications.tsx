// components/notification/notifications.tsx
import { Colors } from "@/constants/color";
import { NotificationItem as NotifType } from "@/data/notifications";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, useColorScheme, View } from "react-native";

type Props = {
  item: NotifType;
  onPress?: () => void;
};

export default function NotificationItem({ item, onPress }: Props) {
  const theme = useColorScheme() ?? "light";
  const C = Colors[theme];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        padding: 18,
        marginBottom: 14,
        borderRadius: 14,
        flexDirection: "row",
        gap: 14,
        backgroundColor: item.read ? C.card : C.cardElevated,
        borderWidth: 1,
        borderColor: C.borderLight,
        shadowColor: C.shadow,
        shadowOpacity: 0.7,
        shadowRadius: item.read ? 3 : 8,
        shadowOffset: { width: 0, height: 3 },
      }}
    >
      <Ionicons
        name={item.read ? "notifications-outline" : "notifications"}
        size={26}
        color={item.read ? C.textSecondary : C.primary}
        style={{ marginTop: 4 }}
      />

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 17,
            fontWeight: item.read ? "600" : "700",
            color: C.text,
          }}
        >
          {item.title}
        </Text>

        <Text
          style={{
            marginTop: 4,
            fontSize: 14,
            color: C.textSecondary,
          }}
        >
          {item.message}
        </Text>

        <Text
          style={{
            marginTop: 8,
            fontSize: 12,
            color: C.textTertiary,
          }}
        >
          {new Date(item.createdAt).toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
