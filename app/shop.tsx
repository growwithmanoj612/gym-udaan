import ProductCard from "@/components/shop/ProductCard";
import { Colors } from "@/constants/color";
import { products } from "@/data/products";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ShopScreen() {
  const router = useRouter();
  const theme = useColorScheme() ?? "dark";
  const C = Colors[theme];

  const addToCart = (item: any) => {
    console.log("Added to cart:", item.name);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.background }}>
      <View style={{ paddingHorizontal: 20, flex: 1 }}>
        {/* HEADER */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 25,
            justifyContent: "space-between",
          }}
        >
          {/* Back */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              padding: 10,
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

          <Text
            style={{
              flex: 1,
              textAlign: "center",
              color: C.primaryLight,
              fontSize: 26,
              fontWeight: "800",
              marginLeft: -32,
              textShadowColor: C.shadowDark,
              textShadowRadius: 10,
            }}
          >
            Shop
          </Text>

          <View style={{ width: 40 }} />
        </View>

        {/* PRODUCTS */}
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => (
            <ProductCard item={item} onAdd={() => addToCart(item)} />
          )}
        />
      </View>
    </SafeAreaView>
  );
}
