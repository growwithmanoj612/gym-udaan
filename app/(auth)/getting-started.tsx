import { Colors } from "@/constants/color";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/store/useAuthStore";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInRight,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function GettingStarted() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";

  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);

  const floatValue = useSharedValue(0);

  useEffect(() => {
    floatValue.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 2500 }),
        withTiming(8, { duration: 2500 })
      ),
      -1,
      true
    );
  }, []);

  const floatingStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatValue.value }],
  }));

  const features = [
    {
      icon: "scan-outline" as const,
      title: "Smart Attendance",
      description: "Quick check-ins & real-time gym capacity",
    },
    {
      icon: "ribbon-outline" as const,
      title: "Membership Hub",
      description: "Track expiry dates and renew instantly",
    },
    {
      icon: "flash-outline" as const,
      title: "Pushed to Excel",
      description: "Motivation & live gym updates",
    },
  ];

  const handleGetStarted = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await completeOnboarding();
    router.replace("/(auth)/tenant-select");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Background Ambience */}
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={
            isDark
              ? [colors.background, colors.primary + '1A', colors.background]
              : [colors.background, colors.primary + '12', colors.background]
          }
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        {/* Abstract shapes for premium feel */}
        <Animated.View style={[styles.glowSphere, styles.glowTop, { backgroundColor: colors.primary }]} />
        <Animated.View style={[styles.glowSphere, styles.glowBottom, { backgroundColor: colors.primaryLight }]} />
      </View>

      <View style={[styles.content, { paddingTop: insets.top + 20 }]}>
        {/* Header / Logo */}
        <Animated.View entering={FadeInDown.duration(800).springify()} style={styles.header}>
          <View style={[styles.logoDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.headerBrandText, { color: colors.text }]}>Gym Udaan</Text>
        </Animated.View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Animated.View style={floatingStyle}>
            <View style={styles.logoImageWrapper}>
              <View style={[styles.logoImageRing, { borderColor: colors.primary + '30', backgroundColor: colors.card }]}>
                <Image
                  source={require("../../assets/images/gymudaanmobileapplogo.jpg")}
                  style={styles.logoImage}
                  resizeMode="cover"
                />
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(300).duration(800).springify()} style={styles.titleWrapper}>
            <Text style={[styles.titleText, { color: colors.text }]}>
              Unlock Your{"\n"}
              <Text style={{ color: colors.primary }}>Potential.</Text>
            </Text>
            <Text style={[styles.subtitleText, { color: colors.textSecondary }]}>
              Your entire gym ecosystem, perfectly organized in one powerful application.
            </Text>
          </Animated.View>
        </View>

        {/* Features List */}
        <View style={styles.featuresList}>
          {features.map((feature, index) => (
            <Animated.View
              key={feature.title}
              entering={FadeInRight.delay(500 + index * 100).duration(800).springify()}
              style={[
                styles.featureCard,
                { backgroundColor: colors.card, borderColor: colors.border + '60' },
              ]}
            >
              <View style={[styles.featureIconContainer, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name={feature.icon} size={24} color={colors.primary} />
              </View>
              <View style={styles.featureTextContent}>
                <Text style={[styles.featureTitle, { color: colors.text }]}>
                  {feature.title}
                </Text>
                <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                  {feature.description}
                </Text>
              </View>
            </Animated.View>
          ))}
        </View>

        <View style={{ flex: 1 }} />

        {/* Footer CTA */}
        <Animated.View
          entering={FadeInUp.delay(900).duration(600).springify()}
          style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}
        >
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.text }]}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <Text style={[styles.primaryButtonText, { color: colors.background }]}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color={colors.background} />
          </TouchableOpacity>

          <Text style={[styles.footerDisclaimer, { color: colors.textTertiary }]}>
            Powered by gymudaan.com
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  glowSphere: {
    position: 'absolute',
    width: SCREEN_WIDTH * 1.5,
    height: SCREEN_WIDTH * 1.5,
    borderRadius: SCREEN_WIDTH * 0.75,
    opacity: 0.12,
  },
  glowTop: {
    top: -SCREEN_WIDTH * 0.6,
    right: -SCREEN_WIDTH * 0.6,
  },
  glowBottom: {
    bottom: -SCREEN_WIDTH * 0.5,
    left: -SCREEN_WIDTH * 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 40,
  },
  logoDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  headerBrandText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  heroSection: {
    alignItems: 'flex-start',
    marginBottom: 40,
  },
  logoImageWrapper: {
    marginBottom: 24,
  },
  logoImageRing: {
    padding: 8,
    borderRadius: 40,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  logoImage: {
    width: 72,
    height: 72,
    borderRadius: 32,
  },
  titleWrapper: {
    gap: 16,
  },
  titleText: {
    fontSize: 52,
    fontWeight: '900',
    lineHeight: 56,
    letterSpacing: -1.5,
  },
  subtitleText: {
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 28,
    maxWidth: '95%',
    opacity: 0.8,
  },
  featuresList: {
    gap: 16,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  featureIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureTextContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 24,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 20,
    borderRadius: 100,
    gap: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  footerDisclaimer: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    opacity: 0.7,
  },
});