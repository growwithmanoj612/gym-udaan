import { Button } from "@/components/ui/button";
import { Colors } from "@/constants/color";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/store/useAuthStore";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export default function GettingStarted() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";

  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);

  const logoScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);

  useEffect(() => {
    logoScale.value = withRepeat(
      withSequence(
        withSpring(1.05, { damping: 3, stiffness: 60 }),
        withSpring(1, { damping: 3, stiffness: 60 })
      ),
      -1,
      false
    );

    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 2000 }),
        withTiming(0.3, { duration: 2000 })
      ),
      -1,
      false
    );
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const features = [
    {
      icon: "fitness-outline" as const,
      title: "Track Attendance",
      description: "Monitor your gym visits effortlessly",
    },
    {
      icon: "card-outline" as const,
      title: "Membership Status",
      description: "View plans and renewal dates",
    },
    {
      icon: "notifications-outline" as const,
      title: "Stay Updated",
      description: "Get important gym announcements",
    },
  ];

  const handleGetStarted = async () => {
    await completeOnboarding();
    router.replace("/(auth)/tenant-select");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={
          isDark
            ? ["rgba(255, 107, 53, 0.08)", "transparent"]
            : ["rgba(255, 107, 53, 0.06)", "transparent"]
        }
        style={styles.backgroundGradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.6 }}
      />

      <View style={[styles.content, { paddingTop: insets.top + SPACING.xxl }]}>
        <View style={styles.heroSection}>
          <Animated.View style={[styles.glowContainer, glowAnimatedStyle]}>
            <LinearGradient
              colors={["rgba(255, 107, 53, 0.4)", "transparent"]}
              style={styles.glowGradient}
            />
          </Animated.View>

          <Animated.View
            entering={FadeIn.duration(800)}
            style={[styles.logoWrapper, logoAnimatedStyle]}
          >
            <View
              style={[
                styles.logoContainer,
                {
                  shadowColor: colors.primary,
                  backgroundColor: colors.card,
                },
              ]}
            >
              <Image
                source={require("../../assets/images/gymudaanmobileapplogo.jpg")}
                style={styles.logoImage}
                resizeMode="cover"
              />
            </View>
          </Animated.View>

          <Animated.Text
            entering={FadeInUp.delay(200).duration(600)}
            style={[styles.brandName, { color: colors.text }]}
          >
            GYM UDAAN
          </Animated.Text>

          <Animated.Text
            entering={FadeInUp.delay(350).duration(600)}
            style={[styles.tagline, { color: colors.textSecondary }]}
          >
            Your Personal Fitness Companion
          </Animated.Text>
        </View>

        <Animated.View
          entering={FadeInDown.delay(500).duration(600)}
          style={styles.valueSection}
        >
          <View
            style={[
              styles.valueCard,
              {
                backgroundColor: isDark
                  ? "rgba(255, 107, 53, 0.08)"
                  : "rgba(255, 107, 53, 0.05)",
                borderColor: isDark
                  ? "rgba(255, 107, 53, 0.15)"
                  : "rgba(255, 107, 53, 0.1)",
              },
            ]}
          >
            <Text style={[styles.valueText, { color: colors.text }]}>
              Your gym membership, access, and updates — all in one place.
            </Text>
          </View>
        </Animated.View>

        <View style={styles.featuresSection}>
          {features.map((feature, index) => (
            <Animated.View
              key={feature.title}
              entering={FadeInDown.delay(650 + index * 100).duration(500)}
              style={[
                styles.featureItem,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View
                style={[
                  styles.featureIconWrapper,
                  { backgroundColor: `${colors.primary}15` },
                ]}
              >
                <Ionicons
                  name={feature.icon}
                  size={22}
                  color={colors.primary}
                />
              </View>
              <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, { color: colors.text }]}>
                  {feature.title}
                </Text>
                <Text
                  style={[
                    styles.featureDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  {feature.description}
                </Text>
              </View>
            </Animated.View>
          ))}
        </View>
      </View>

      <Animated.View
        entering={FadeInUp.delay(950).duration(500)}
        style={[
          styles.bottomSection,
          {
            paddingBottom: insets.bottom + SPACING.xl,
            backgroundColor: colors.background,
          },
        ]}
      >
        <Button
          title="Continue"
          onPress={handleGetStarted}
          variant="primary"
          size="large"
          style={styles.ctaButton}
        />

        <View style={styles.infoContainer}>
          <Ionicons
            name="information-circle-outline"
            size={16}
            color={colors.textTertiary}
          />
          <Text style={[styles.infoText, { color: colors.textTertiary }]}>
            Account provided by your gym via gymudaan.com
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xxl,
  },
  heroSection: {
    alignItems: "center",
    paddingTop: SPACING.xxxl,
  },
  glowContainer: {
    position: "absolute",
    top: -20,
    width: 200,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  glowGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 100,
  },
  logoWrapper: {
    marginBottom: SPACING.xl,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 32,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  brandName: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 3,
    marginBottom: SPACING.sm,
  },
  tagline: {
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  valueSection: {
    marginTop: SPACING.xxxl,
  },
  valueCard: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    borderRadius: 16,
    borderWidth: 1,
  },
  valueText: {
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 24,
  },
  featuresSection: {
    marginTop: SPACING.xxl,
    gap: SPACING.md,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.lg,
    borderRadius: 16,
    borderWidth: 1,
  },
  featureIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.lg,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 13,
    fontWeight: "500",
  },
  bottomSection: {
    paddingHorizontal: SPACING.xxl,
    paddingTop: SPACING.lg,
  },
  ctaButton: {
    width: "100%",
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  infoText: {
    fontSize: 13,
    fontWeight: "500",
  },
});