import { Colors } from "@/constants/color";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

export default function ProductCard({ item, onAdd }: any) {
  const theme = useColorScheme() ?? "dark";
  const C = Colors[theme];

  return (
    <View
      style={{
        backgroundColor: C.card,
        borderRadius: 18,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: C.borderLight,
        shadowColor: C.primary,
        shadowOpacity: 0.4,
        shadowRadius: 8,
      }}
    >
      {/* IMAGE */}
      <Image
        source={{ uri: item.image }}
        style={{
          width: "100%",
          height: 150,
          borderRadius: 14,
          marginBottom: 14,
        }}
        resizeMode="contain"
      />

      {/* TITLE */}
      <Text
        style={{
          color: C.text,
          fontWeight: "700",
          fontSize: 18,
          marginBottom: 4,
        }}
      >
        {item.name}
      </Text>

      {/* DESCRIPTION */}
      <Text
        style={{
          color: C.textSecondary,
          fontSize: 14,
          marginBottom: 10,
        }}
        numberOfLines={2}
      >
        {item.description}
      </Text>

      {/* Bottom Row */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* PRICE */}
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: C.primaryLight,
          }}
        >
          ${item.price}
        </Text>

        {/* ADD BUTTON */}
        <TouchableOpacity
          onPress={onAdd}
          activeOpacity={0.8}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 14,
            paddingVertical: 8,
            backgroundColor: C.primaryDark,
            borderRadius: 12,
            shadowColor: C.primary,
            shadowOpacity: 0.7,
            shadowRadius: 10,
          }}
        >
          <Ionicons name="cart" size={18} color="white" />
          <Text
            style={{
              color: "white",
              marginLeft: 6,
              fontWeight: "600",
            }}
          >
            Add
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
