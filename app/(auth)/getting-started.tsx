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
  Image,
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
  withTiming,
  withSpring,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

export default function GettingStarted() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ??   "light"];
  
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);

  // ⭐ Enhanced Animations ⭐
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.5);
  const iconBounce = useSharedValue(0);

  useEffect(() => {
    // Pulse animation for hero icon
    pulseScale.value = withRepeat(
      withSequence(
        withSpring(1.1, { damping: 2, stiffness: 80 }),
        withSpring(1, { damping: 2, stiffness: 80 })
      ),
      -1,
      false
    );

    // Glow effect
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200 }),
        withTiming(0.5, { duration: 1200 })
      ),
      -1,
      false
    );

    // Icon floating
    iconBounce.value = withRepeat(
      withSequence(
        withTiming(-12, { duration: 1500 }),
        withTiming(0, { duration: 1500 })
      ),
      -1,
      false
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale:   pulseScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const bounceStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: iconBounce.value }],
  }));

  const quickStats = [
    { icon: "checkmark-circle", label: "Track Attendance", color: "#FF6B35" },
    { icon: "card", label: "View Membership", color: "#FF8C42" },
    { icon: "notifications", label: "Get Alerts", color: "#FFA726" },
  ];

  const benefits = [
    {
      icon: "calendar-outline",
      title: "Attendance History",
      desc: "Track your gym visits and stay consistent with your fitness journey.",
    },
    {
      icon: "ribbon-outline",
      title: "Membership Details",
      desc: "View your plan, renewal dates, and membership benefits anytime.",
    },
    {
      icon: "megaphone-outline",
      title: "Important Alerts",
      desc: "Stay updated with gym announcements, events, and personalized notifications.",
    },
  ];

  const handleGetStarted = async () => {
    await completeOnboarding();
    router.replace("/(auth)/tenant-select");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Gradient Background Overlay */}
      <LinearGradient
        colors={['rgba(255, 107, 53, 0.05)', 'rgba(255, 140, 66, 0.02)', 'transparent']}
        style={styles.gradientOverlay}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ⭐ Hero Section with Custom Logo ⭐ */}
        <Animated.View
          entering={ZoomIn.duration(800).springify()}
          style={styles.heroSection}
        >
          {/* Animated Glow Background */}
          <Animated.View style={[styles.glowCircle, glowStyle]}>
            <LinearGradient
              colors={['rgba(255, 107, 53, 0.3)', 'rgba(255, 140, 66, 0.1)']}
              style={styles.glowGradient}
            />
          </Animated.View>

          {/* Main Logo - UPDATED SECTION */}
          <Animated.View style={[styles.logoContainer, pulseStyle]}>
            <Animated.View style={bounceStyle}>
              <Image
                source={require("../../assets/images/gymudaanmobileapplogo.jpg")}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </Animated.View>
          </Animated.View>

          <Animated.Text
            entering={FadeInUp.delay(300).springify()}
            style={[styles.appName, { color: colors.text }]}
          >
            GYM UDAAN
          </Animated.Text>

          <Animated.Text
            entering={FadeInUp.delay(450).springify()}
            style={[styles.tagline, { color: colors.textSecondary }]}
          >
            Your Personal Fitness Companion
          </Animated.Text>

          <Animated.View
            entering={FadeInUp.delay(600)}
            style={styles.divider}
          >
            <View style={styles.dividerLine} />
            <Ionicons name="barbell" size={20} color="#FF6B35" style={styles.dividerIcon} />
            <View style={styles.dividerLine} />
          </Animated.View>
        </Animated.View>

        {/* ⭐ Quick Stats ⭐ */}
        <View style={styles.quickStatsContainer}>
          {quickStats.map((stat, index) => (
            <Animated.View
              key={index}
              entering={FadeInUp.delay(700 + index * 100).springify()}
              style={styles.statCard}
            >
              <View style={[styles.statIconWrapper, { backgroundColor: `${stat.color}15` }]}>
                <Ionicons name={stat.icon as any} size={28} color={stat.color} />
              </View>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                {stat.label}
              </Text>
            </Animated.View>
          ))}
        </View>

        {/* ⭐ Main Features Section ⭐ */}
        <Animated.View
          entering={FadeInDown.delay(1000)}
          style={styles.featuresSection}
        >
          <View style={styles.sectionHeader}>
            <Ionicons name="sparkles" size={24} color="#FF6B35" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              What You'll Get
            </Text>
          </View>

          {benefits.map((benefit, index) => (
            <Animated.View
              key={index}
              entering={FadeInUp.delay(1100 + index * 150).springify()}
            >
              <Card elevated style={styles.benefitCard}>
                <View style={styles.benefitIconContainer}>
                  <LinearGradient
                    colors={['#FF6B35', '#FF8C42']}
                    style={styles.benefitIconCircle}
                  >
                    <Ionicons name={benefit.icon as any} size={26} color="#FFFFFF" />
                  </LinearGradient>
                </View>

                <View style={styles.benefitContent}>
                  <Text style={[styles.benefitTitle, { color: colors.text }]}>
                    {benefit.title}
                  </Text>
                  <Text style={[styles.benefitDesc, { color: colors.textSecondary }]}>
                    {benefit.desc}
                  </Text>
                </View>
              </Card>
            </Animated.View>
          ))}
        </Animated.View>

        {/* ⭐ Call to Action Message ⭐ */}
        <Animated.View
          entering={FadeInUp.delay(1600)}
          style={styles.ctaMessage}
        >
          <LinearGradient
            colors={['rgba(255, 107, 53, 0.1)', 'rgba(255, 140, 66, 0.05)']}
            style={styles.ctaCard}
          >
            <Ionicons name="rocket" size={32} color="#FF6B35" />
            <Text style={[styles.ctaText, { color: colors.text }]}>
              Ready to take control of your fitness journey?
            </Text>
            <Text style={[styles.ctaSubtext, { color: colors.textSecondary }]}>
              Login to access your personalized dashboard
            </Text>
          </LinearGradient>
        </Animated.View>
      </ScrollView>

      {/* ⭐ Bottom CTA Button ⭐ */}
      <Animated.View
        entering={SlideInUp.duration(600).springify()}
        style={[styles.bottomSection, { backgroundColor: colors.background }]}
      >
        <LinearGradient
          colors={['transparent', colors.background]}
          style={styles.bottomGradient}
        />
        <Button
          title="Get Started"
          onPress={handleGetStarted}
          variant="primary"
          size="large"
          style={styles.ctaButton}
        />
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          Join hundreds of members achieving their fitness goals
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  gradientOverlay:   {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.5,
  },

  scrollContent: {
    paddingTop: 70,
    paddingHorizontal: 20,
    paddingBottom: 180,
  },

  // Hero Section
  heroSection: {
    alignItems: 'center',
    marginBottom: 40,
    paddingVertical: 20,
  },

  glowCircle:   {
    position: 'absolute',
    top: 0,
    width: 200,
    height: 200,
  },

  glowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
  },

  // 🔥 UPDATED: Custom Logo Styles
  logoContainer: {
    marginBottom: 24,
    zIndex: 10,
  },

  logoImage: {
    width: 160,
    height: 160,
    borderRadius: 80,
    shadowColor: '#FF6B35',
    shadowOffset: { width:  0, height: 8 },
    shadowOpacity:  0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  // END UPDATED SECTION

  appName: {
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 8,
  },

  tagline: {
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 20,
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    width: '60%',
  },

  dividerLine: {
    flex:  1,
    height:   1,
    backgroundColor: '#FF6B3530',
  },

  dividerIcon: {
    marginHorizontal: 12,
  },

  // Quick Stats
  quickStatsContainer:  {
    flexDirection: 'row',
    justifyContent:  'space-between',
    marginBottom: 40,
    gap: 12,
  },

  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },

  statIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  statLabel: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },

  // Features Section
  featuresSection: {
    marginBottom: 30,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },

  sectionTitle:  {
    fontSize: 24,
    fontWeight: '800',
  },

  benefitCard: {
    padding:  18,
    marginBottom:  16,
    flexDirection:  'row',
    alignItems: 'flex-start',
  },

  benefitIconContainer:   {
    marginRight: 16,
  },

  benefitIconCircle:  {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B35',
    shadowOffset:  { width:   0, height: 4 },
    shadowOpacity:  0.3,
    shadowRadius:  8,
    elevation: 6,
  },

  benefitContent: {
    flex:  1,
    paddingTop: 4,
  },

  benefitTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },

  benefitDesc: {
    fontSize: 14,
    lineHeight: 20,
  },

  // CTA Message
  ctaMessage:   {
    marginBottom: 20,
  },

  ctaCard: {
    padding:  24,
    borderRadius:  16,
    alignItems:  'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.2)',
  },

  ctaText: {
    fontSize:  18,
    fontWeight:  '700',
    textAlign:  'center',
    marginTop: 12,
    marginBottom: 6,
  },

  ctaSubtext: {
    fontSize:  14,
    textAlign: 'center',
  },

  // Bottom Section
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left:  0,
    right:   0,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width:  0, height: -4 },
    shadowOpacity:  0.1,
    shadowRadius: 12,
    elevation:  10,
  },

  bottomGradient: {
    position:  'absolute',
    top: -40,
    left: 0,
    right:  0,
    height: 40,
  },

  ctaButton: {
    width:   '100%',
    marginBottom: 12,
  },

  footerText: {
    fontSize: 13,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});