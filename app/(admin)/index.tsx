import { Colors } from "@/constants/color";
import { INotificationDetails } from "@/global/interfaces";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/store/useAuthStore";
import { useBiometricStore } from "@/store/useBiometricStore";
import { useNotificationStoreOwner } from "@/store/useNotificationStoreForOwner";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { memo, useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Linking,
  ScrollView,
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
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MessageCard from "../component/message-card";
import MessageModal from "../component/message-card-modal";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const softwareLink = "https://www.gymudaan.com/tenant/add";

// ==================== SPACING CONSTANTS ====================
const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

// ==================== TYPES ====================
type ColorTheme = typeof Colors.light | typeof Colors.dark;

// ==================== SKELETON LOADER COMPONENT ====================
const SkeletonLoader = memo(({ colors }: { colors: ColorTheme }) => (
  <View style={styles.skeletonContainer}>
    {[1, 2, 3].map((item) => (
      <Animated.View
        key={item}
        entering={FadeInDown.delay(item * 100).duration(400)}
        style={[styles.skeletonCard, { backgroundColor: colors.card }]}
      >
        <View style={styles.skeletonContent}>
          <View
            style={[
              styles.skeletonAvatar,
              { backgroundColor: colors.backgroundSecondary },
            ]}
          />
          <View style={styles.skeletonTextContainer}>
            <View
              style={[
                styles.skeletonTitle,
                { backgroundColor: colors.backgroundSecondary },
              ]}
            />
            <View
              style={[
                styles.skeletonSubtitle,
                { backgroundColor: colors.backgroundSecondary },
              ]}
            />
          </View>
        </View>
      </Animated.View>
    ))}
  </View>
));

// ==================== QUICK ACTION CARD COMPONENT ====================
interface QuickActionCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  gradientColors: readonly [string, string, ...string[]];
  onPress: () => void;
  delay?: number;
  isLoading?: boolean;
  isSuccess?: boolean;
}

const QuickActionCard = memo(
  ({
    icon,
    title,
    subtitle,
    gradientColors,
    onPress,
    delay = 0,
    isLoading = false,
    isSuccess = false,
  }: QuickActionCardProps) => {
    const scale = useSharedValue(1);
    const rotation = useSharedValue(0);
    const successScale = useSharedValue(0);

    useEffect(() => {
      if (isLoading) {
        // Continuous rotation while loading
        rotation.value = withSpring(360, { damping: 8, stiffness: 40 });
      } else if (isSuccess) {
        rotation.value = 0;
        successScale.value = withSpring(1, { damping: 12, stiffness: 100 });
      } else {
        rotation.value = 0;
        successScale.value = 0;
      }
    }, [isLoading, isSuccess]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const animatedIconStyle = useAnimatedStyle(() => ({
      transform: [{ rotate: `${rotation.value}deg` }],
    }));

    const successOverlayStyle = useAnimatedStyle(() => ({
      opacity: successScale.value,
      transform: [{ scale: successScale.value }],
    }));

    const handlePressIn = () => {
      scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
    };

    const handlePressOut = () => {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    };

    const displayIcon = isSuccess ? "lock-open" : isLoading ? "key" : icon;
    const displayTitle = isSuccess ? "Unlocked!" : isLoading ? "Unlocking..." : title;
    const displaySubtitle = isSuccess ? "Access granted" : isLoading ? "Please wait" : subtitle;

    return (
      <Animated.View
        entering={FadeInRight.delay(delay).duration(200).springify()}
        style={animatedStyle}
      >
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
          disabled={isLoading}
        >
          <LinearGradient
            colors={isSuccess ? ["#10B981", "#059669"] : gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.quickActionCard}
          >
            <View style={styles.quickActionIconContainer}>
              <Animated.View style={animatedIconStyle}>
                <Ionicons name={displayIcon} size={24} color="#FFFFFF" />
              </Animated.View>
            </View>
            <Text style={styles.quickActionTitle}>{displayTitle}</Text>
            <Text style={styles.quickActionSubtitle}>{displaySubtitle}</Text>
            
            {/* Success checkmark overlay */}
            {isSuccess && (
              <Animated.View style={[styles.successCheckOverlay, successOverlayStyle]}>
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              </Animated.View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

// ==================== EMPTY STATE COMPONENT ====================
const EmptyState = memo(({ colors }: { colors: ColorTheme }) => (
  <Animated.View
    entering={FadeInDown.delay(200).duration(500)}
    style={[styles.emptyStateContainer, { backgroundColor: colors.card }]}
  >
    <View
      style={[
        styles.emptyStateIconContainer,
        { backgroundColor: colors.backgroundSecondary },
      ]}
    >
      <Ionicons name="chatbubbles-outline" size={48} color={colors.textTertiary} />
    </View>
    <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
      No messages yet
    </Text>
    <Text style={[styles.emptyStateSubtitle, { color: colors.textSecondary }]}>
      Your notifications will appear here
    </Text>
  </Animated.View>
));

// ==================== AVATAR COMPONENT ====================
const Avatar = memo(
  ({
    name,
    colors,
  }: {
    name: string;
    colors: ColorTheme;
  }) => {
    const initials = name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "U";

    return (
      <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
    );
  }
);

// ==================== MAIN COMPONENT ====================
export default function Home() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();

  // Stores
  const appUser = useAuthStore((state) => state.appUser);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchPaginated,
    getUnreadCount,
    markAsRead,
  } = useNotificationStoreOwner();
  const { biometrics, getBiometrics, doorUnlock } = useBiometricStore();

  // Modal state
  const [selectedMessage, setSelectedMessage] =
    useState<INotificationDetails | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockSuccess, setUnlockSuccess] = useState(false);

  const openMessageModal = async (message: INotificationDetails) => {
    setSelectedMessage(message);
    setIsModalVisible(true);
    if (!message.isRead) {
      await markAsRead(message.id);
    }
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedMessage(null);
  };

  useEffect(() => {
    getBiometrics();
    checkAuth();
  }, []);

  useEffect(() => {
    fetchPaginated();
    getUnreadCount();
  }, [isFocused]);

  const handleManageBusiness = async () => {
    try {
      const supported = await Linking.canOpenURL(softwareLink);
      if (supported) {
        await Linking.openURL(softwareLink);
      } else {
        Alert.alert("Error", "Unable to open the link. Please try again later.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to open the browser.");
    }
  };

  const handleUnlockDoor = async () => {
    if (!biometrics || biometrics.length === 0) {
      Alert.alert(
        "No Biometric Device",
        "No biometric devices available for unlocking."
      );
      return;
    }
    
    setIsUnlocking(true);
    setUnlockSuccess(false);
    
    try {
      await doorUnlock(biometrics[0].deviceSN);
      setUnlockSuccess(true);
      
      // Auto-hide after 2 seconds
      setTimeout(() => {
        setIsUnlocking(false);
        setUnlockSuccess(false);
      }, 2000);
    } catch (error) {
      setIsUnlocking(false);
      Alert.alert("Unlock Failed", "Failed to send unlock request.");
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: SPACING.xxxl }}
      >
        {/* ==================== HEADER ==================== */}
        <Animated.View entering={FadeInUp.duration(600).springify()}>
          <LinearGradient
            colors={
              isDark
                ? [colors.card, colors.background]
                : [colors.card, colors.background]
            }
            style={[styles.header, { paddingTop: insets.top + SPACING.lg }]}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <Avatar name={appUser?.fullName || "User"} colors={colors} />
                <View style={styles.headerTextContainer}>
                  <Text style={[styles.greeting, { color: colors.textSecondary }]}>
                    {getGreeting()}
                  </Text>
                  <Text style={[styles.userName, { color: colors.text }]}>
                    {appUser?.fullName?.split(" ")[0] || "Owner"} 👋
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.notificationButton,
                  { backgroundColor: colors.backgroundSecondary },
                ]}
                onPress={() => router.push("/(admin)/message")}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="notifications-outline"
                  size={22}
                  color={colors.text}
                />
                {unreadCount > 0 && (
                  <View style={[styles.badge, { backgroundColor: colors.error }]}>
                    <Text style={styles.badgeText}>
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ==================== QUICK ACTIONS ==================== */}
        <View style={styles.quickActionsSection}>
          <Animated.Text
            entering={FadeInDown.delay(200).duration(500)}
            style={[styles.sectionLabel, { color: colors.textSecondary }]}
          >
            Quick Actions
          </Animated.Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActionsContainer}
          >
            {biometrics && biometrics.length > 0 && (
              <QuickActionCard
                icon="key-outline"
                title="Unlock Door"
                subtitle="Access control"
                gradientColors={["#10B981", "#059669"] as const}
                onPress={handleUnlockDoor}
                delay={300}
                isLoading={isUnlocking}
                isSuccess={unlockSuccess}
              />
            )}
            <QuickActionCard
              icon="business-outline"
              title="Manage Business"
              subtitle="Open dashboard"
              gradientColors={["#6366F1", "#4F46E5"] as const}
              onPress={handleManageBusiness}
              delay={400}
            />
          </ScrollView>
        </View>

        {/* ==================== RECENT MESSAGES ==================== */}
        <Animated.View
          entering={FadeInDown.delay(600).duration(500).springify()}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Recent Messages
              </Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                {notifications.length > 0
                  ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
                  : "Stay updated with your gym"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/(admin)/message")}
              style={[styles.viewAllButton, { backgroundColor: colors.backgroundSecondary }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.viewAllText, { color: colors.primary }]}>
                View All
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {isLoading && notifications.length === 0 ? (
            <SkeletonLoader colors={colors} />
          ) : notifications.length === 0 ? (
            <EmptyState colors={colors} />
          ) : (
            <View style={styles.messagesContainer}>
              {notifications?.slice(0, 5)?.map((message, index) => (
                <Animated.View
                  key={message.id || index}
                  entering={FadeInDown.delay(700 + index * 80).duration(400)}
                >
                  <MessageCard
                    notification={message}
                    onPress={openMessageModal}
                  />
                </Animated.View>
              ))}
            </View>
          )}
        </Animated.View>

        {/* ==================== MOTIVATION CARD ==================== */}
        <Animated.View
          entering={FadeInDown.delay(900).duration(600).springify()}
          style={styles.motivationSection}
        >
          <LinearGradient
            colors={
              isDark
                ? [`${colors.primary}40`, `${colors.secondary}30`]
                : [`${colors.primary}20`, `${colors.secondary}15`]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.motivationCard}
          >
            <View style={styles.motivationGlow} />
            <View style={styles.motivationContent}>
              <View
                style={[
                  styles.motivationIconContainer,
                  { backgroundColor: `${colors.primary}30` },
                ]}
              >
                <Ionicons name="trophy" size={28} color={colors.primary} />
              </View>
              <Text style={[styles.motivationTitle, { color: colors.text }]}>
                Keep Going! 💪
              </Text>
              <Text
                style={[styles.motivationText, { color: colors.textSecondary }]}
              >
                Manage your business with ease and grow your gym community.
              </Text>
              <TouchableOpacity
                style={[styles.motivationButton, { backgroundColor: colors.primary }]}
                onPress={handleManageBusiness}
                activeOpacity={0.8}
              >
                <Text style={styles.motivationButtonText}>Get Started</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </ScrollView>

      {/* Message Modal */}
      <MessageModal
        visible={isModalVisible}
        onClose={closeModal}
        selectedMessage={selectedMessage}
      />
    </View>
  );
}

// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerTextContainer: {
    marginLeft: SPACING.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  greeting: {
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  userName: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.3,
    marginTop: 2,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  // Quick Actions
  quickActionsSection: {
    marginTop: SPACING.lg,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
  },
  quickActionsContainer: {
    paddingHorizontal: SPACING.xl,
    gap: SPACING.md,
  },
  quickActionCard: {
    width: SCREEN_WIDTH * 0.44,
    padding: SPACING.lg,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  quickActionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
  },
  quickActionTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: SPACING.xs,
  },
  quickActionSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255,255,255,0.8)",
  },
  successCheckOverlay: {
    position: "absolute",
    top: SPACING.sm,
    right: SPACING.sm,
  },

  // Section
  section: {
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.xxl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: SPACING.xs,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 12,
    gap: SPACING.xs,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: "600",
  },

  // Messages
  messagesContainer: {
    gap: SPACING.md,
  },

  // Skeleton
  skeletonContainer: {
    gap: SPACING.md,
  },
  skeletonCard: {
    padding: SPACING.lg,
    borderRadius: 16,
  },
  skeletonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  skeletonAvatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
  },
  skeletonTextContainer: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  skeletonTitle: {
    height: 14,
    borderRadius: 7,
    width: "60%",
    marginBottom: SPACING.sm,
  },
  skeletonSubtitle: {
    height: 12,
    borderRadius: 6,
    width: "80%",
  },

  // Empty State
  emptyStateContainer: {
    padding: SPACING.xxxl,
    borderRadius: 20,
    alignItems: "center",
  },
  emptyStateIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.lg,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: SPACING.sm,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },

  // Motivation
  motivationSection: {
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.xxl,
  },
  motivationCard: {
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
  },
  motivationGlow: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  motivationContent: {
    padding: SPACING.xxl,
    alignItems: "center",
  },
  motivationIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.lg,
  },
  motivationTitle: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: SPACING.sm,
  },
  motivationText: {
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  motivationButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 14,
    gap: SPACING.sm,
  },
  motivationButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});