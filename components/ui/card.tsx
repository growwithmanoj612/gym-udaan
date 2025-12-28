// components/ui/Card.tsx
import { Colors } from "@/constants/color";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View, ViewStyle, StyleProp } from "react-native";

interface CardProps {
  children: React.ReactNode;
  gradient?: boolean;
  elevated?: boolean;
  style?: StyleProp<ViewStyle>; // Changed from ViewStyle to StyleProp<ViewStyle>
}

export function Card({ children, gradient, elevated, style }: CardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  if (gradient) {
    return (
      <LinearGradient
        colors={[colors.gradientStart, colors. gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, elevated && styles.elevated, style]}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: elevated ? colors.cardElevated : colors.card },
        elevated && styles.elevated,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
  },
  elevated: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
});