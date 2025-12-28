import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Colors } from "@/constants/color";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/store/useAuthStore";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useEffect } from "react";
import Animated, {
  FadeInDown,
  FadeInUp,
  SlideInUp,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from "react-native-reanimated";

const { width } = Dimensions. get("window");

export default function GettingStarted() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ??  "light"];
  
  // ✅ Use the store directly without auto-selector
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);

  // ⭐ PREMIUM Dumbbell Animation ⭐
  const bounce = useSharedValue(0);
  const rotate = useSharedValue(0);
  const glow = useSharedValue(1);
  const scale = useSharedValue(1);

  useEffect(() => {
    // Floating bounce
    bounce.value = withRepeat(
      withSequence(
        withTiming(-18, { duration: 450 }),
        withTiming(0, { duration: 450 })
      ),
      -1,
      false
    );

    // Slow rotating
    rotate.value = withRepeat(
      withTiming(360, { duration:  4000 }),
      -1,
      false
    );

    // Glow pulse
    glow.value = withRepeat(
      withSequence(
        withTiming(1.25, { duration: 900 }),
        withTiming(1, { duration: 900 })
      ),
      -1,
      false
    );

    // Breathing scale
    scale. value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 900 }),
        withTiming(1, { duration:  900 })
      ),
      -1,
      false
    );
  }, []);

  const dumbbellAnim = useAnimatedStyle(() => ({
    transform: [
      { translateY: bounce.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
    shadowOpacity: 0.3,
    shadowRadius: 15 * glow.value,
  }));

  const features = [
    { icon:  "fitness", title:  "25+", subtitle: "Workouts", color: colors.primary },
    { icon: "people", title: "500+", subtitle: "Members", color: colors. secondary },
    { icon: "trophy", title: "98%", subtitle: "Success Rate", color:  colors.accent }
  ];

  const handleGetStarted = async () => {
    await completeOnboarding();
    router.replace("/(auth)/tenant-select");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors. background }]}>

      {/* SCROLL CONTENT */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles. scrollContent}
      >

        {/* ⭐ Animated Logo Section ⭐ */}
        <Animated. View
          entering={ZoomIn.duration(700)}
          style={styles.logoSection}
        >
          <Animated.View style={dumbbellAnim}>
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              style={styles.logoCircle}
            >
              <Ionicons name="barbell" size={54} color="#fff" />
            </LinearGradient>
          </Animated.View>

          <Animated.Text
            entering={FadeInUp.delay(200)}
            style={[styles.title, { color: colors.text }]}
          >
            GYM UDAAN
          </Animated.Text>

          <Animated.Text
            entering={FadeInUp.delay(350)}
            style={[styles.subtitle, { color: colors.textSecondary }]}
          >
            Transform Your Body, Elevate Your Mind
          </Animated.Text>
        </Animated.View>

        {/* FEATURE CARDS */}
        <View style={styles.featuresContainer}>
          {features. map((feature, i) => (
            <Animated.View key={i} entering={FadeInUp.delay(300 + i * 150)} style={{ flex: 1 }}>
              <Card elevated style={styles.featureCard}>
                <Ionicons name={feature.icon as any} size={32} color={feature. color} />
                <Text style={[styles.featureTitle, { color: colors.text }]}>{feature.title}</Text>
                <Text style={[styles. featureSubtitle, { color: colors.textSecondary }]}>
                  {feature. subtitle}
                </Text>
              </Card>
            </Animated.View>
          ))}
        </View>

        {/* WHY CHOOSE US */}
        <Animated. View entering={FadeInDown. delay(600)} style={styles.benefitsSection}>
          <Text style={[styles.sectionHeader, { color: colors.text }]}>
            Why Choose GYM UDAAN?
          </Text>

          {[
            {
              icon: "flame",
              title: "Personalized Training",
              desc: "Custom workout plans tailored to your goals."
            },
            {
              icon: "battery-charging",
              title: "High Energy Atmosphere",
              desc: "Stay motivated with trainers who push your limits."
            },
            {
              icon: "shield-checkmark",
              title: "Trusted Coaches",
              desc: "Certified professionals guiding your journey."
            }
          ].map((item, i) => (
            <Animated.View key={i} entering={FadeInUp. delay(700 + i * 150)}>
              <Card elevated style={styles.benefitCard}>
                <View style={styles. benefitRow}>
                  <View style={[styles.benefitIcon, { backgroundColor: colors.primary }]}>
                    <Ionicons name={item.icon as any} size={24} color="#fff" />
                  </View>

                  <View style={styles.benefitText}>
                    <Text style={[styles. benefitTitle, { color: colors.text }]}>{item.title}</Text>
                    <Text style={[styles.benefitDesc, { color: colors.textSecondary }]}>
                      {item.desc}
                    </Text>
                  </View>
                </View>
              </Card>
            </Animated.View>
          ))}
        </Animated.View>

      </ScrollView>

      {/* BOTTOM ACTION BUTTON */}
      <Animated.View
        entering={SlideInUp. duration(500)}
        style={[styles.bottomSection, { backgroundColor: colors.background }]}
      >
        <Button
          title="GET STARTED"
          onPress={handleGetStarted}
          variant="primary"
          size="large"
          style={styles.button}
        />
      </Animated.View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:  1 },

  scrollContent: {
    paddingTop:  60,
    paddingHorizontal: 24,
    paddingBottom: 140
  },

  logoSection: {
    alignItems: "center",
    marginBottom: 40
  },

  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  title: {
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 1.5
  },

  subtitle: {
    fontSize: 14,
    textAlign: "center",
    maxWidth: 260,
    marginTop: 6
  },

  featuresContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom:  30
  },

  featureCard: {
    alignItems: "center",
    paddingVertical: 22,
    marginHorizontal: 4
  },

  featureTitle:  {
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 10
  },

  featureSubtitle: {
    fontSize: 12,
    marginTop: 4
  },

  sectionHeader: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12
  },

  benefitsSection: {
    marginBottom:  20,
    gap: 12
  },

  benefitCard: {
    paddingVertical: 12,
    paddingHorizontal: 10
  },

  benefitRow:  {
    flexDirection: "row",
    alignItems: "center"
  },

  benefitIcon: {
    width: 54,
    height: 54,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16
  },

  benefitText: { flex: 1 },

  benefitTitle: {
    fontSize: 16,
    fontWeight: "700"
  },

  benefitDesc:  {
    fontSize: 13,
    marginTop: 3
  },

  bottomSection: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding:  24,
    paddingBottom: 40
  },

  button: { width: "100%" }
});