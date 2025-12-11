// app/(auth)/getting-started.tsx
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Colors } from "@/constants/color";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuth } from "@/store/useAuth";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function GettingStarted() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { completeOnboarding } = useAuth();

  const features = [
    {
      icon: "fitness",
      title: "25+",
      subtitle: "Workouts",
      color: colors.primary,
    },
    {
      icon: "people",
      title: "500+",
      subtitle: "Members",
      color: colors.secondary,
    },
    {
      icon: "trophy",
      title: "98%",
      subtitle: "Success Rate",
      color: colors.accent,
    },
  ];

  const handleGetStarted = () => {
    completeOnboarding();
    router.replace("/(auth)/tenant-select");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            style={styles.logoCircle}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="barbell" size={48} color="#FFFFFF" />
          </LinearGradient>

          <Text style={[styles.title, { color: colors.text }]}>GYM UDAAN</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Transform Your Body, Elevate Your Mind
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <Card key={index} elevated style={styles.featureCard}>
              <Ionicons
                name={feature.icon as any}
                size={28}
                color={feature.color}
              />
              <Text style={[styles.featureTitle, { color: colors.text }]}>
                {feature.title}
              </Text>
              <Text
                style={[
                  styles.featureSubtitle,
                  { color: colors.textSecondary },
                ]}
              >
                {feature.subtitle}
              </Text>
            </Card>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View
        style={[styles.bottomSection, { backgroundColor: colors.background }]}
      >
        <Button
          title="GET STARTED"
          onPress={handleGetStarted}
          variant="primary"
          size="large"
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    maxWidth: 250,
  },
  featuresContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  featureCard: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 4,
    paddingVertical: 20,
  },
  featureTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 12,
  },
  featureSubtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  benefitsSection: {
    gap: 12,
  },
  benefitCard: {
    marginBottom: 8,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  benefitIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  benefitDesc: {
    fontSize: 14,
  },
  bottomSection: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  button: {
    width: "100%",
  },
});
