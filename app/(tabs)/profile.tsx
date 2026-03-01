import { Card } from "@/components/ui/card";
import { Colors } from "@/constants/color";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { toast } from "@/providers/toast-provider";
import { useAuthStore } from "@/store/useAuthStore";
import { useMembershipStore } from "@/store/useMembershipStore";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  Layout,
  SlideInRight,
} from "react-native-reanimated";
import ChangePasswordModal from "../component/change-password-modal";
import MembershipCard from "../component/membership-card";

const AnimatedCard = Animated.createAnimatedComponent(Card);
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const { width } = Dimensions.get("window");

export default function Profile() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { logout, appUser, changePassword, selectedTenantDetails } =
    useAuthStore();
  const { currentMembership, fetchAll, memberships } = useMembershipStore();

  const [showHistory, setShowHistory] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (showHistory) {
      fetchAll();
    }
  }, [showHistory]);

  const handleLogout = () => {
    logout();
    router.replace("/(auth)/login");
  };

  const handlePasswordChange = async (
    oldPassword: string,
    newPassword: string,
    confirmPassword: string
  ) => {
    setIsSubmitting(true);
    try {
      await changePassword(oldPassword, newPassword);
      setShowChangePassword(false);
      toast.show({
        type: "success",
        text1: "Success",
        text2: "Password changed successfully!",
      });
    } catch (error: any) {
      toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message || "Failed to change password.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get initials for avatar
  const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  // Account menu items
  const accountMenuItems = [
    {
      icon: "key" as const,
      title: "Change Password",
      subtitle: "Update your account security",
      color: "#8B5CF6",
      onPress: () => setShowChangePassword(true),
    },
    {
      icon: "business" as const,
      title: "Switch Gym",
      subtitle: "Change your active gym",
      color: "#3B82F6",
      onPress: () => router.replace("/(auth)/tenant-select"),
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ═══════════ HEADER HERO SECTION ═══════════ */}
        <Animated.View
          entering={FadeInUp.duration(600).springify()}
        >
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            {/* Decorative circles */}
            <View style={styles.decorCircle1} />
            <View style={styles.decorCircle2} />
            <View style={styles.decorCircle3} />

            <View style={styles.heroContent}>
              {/* Avatar with initials */}
              <Animated.View
                entering={FadeIn.delay(200).duration(500)}
                style={styles.avatarOuter}
              >
                <View style={styles.avatarRing}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {getInitials(appUser?.fullName)}
                    </Text>
                  </View>
                </View>
              </Animated.View>

              {/* User Info */}
              <Animated.View
                entering={FadeInUp.delay(300).springify()}
                style={styles.userInfoContainer}
              >
                <Text style={styles.userName} numberOfLines={1}>
                  {appUser?.fullName || "Member"}
                </Text>

                <View style={styles.infoBadgesRow}>
                  {appUser?.phone && (
                    <View style={styles.infoBadge}>
                      <Ionicons
                        name="call"
                        size={12}
                        color="rgba(255,255,255,0.95)"
                      />
                      <Text style={styles.infoBadgeText}>
                        {appUser.phone}
                      </Text>
                    </View>
                  )}
                  {selectedTenantDetails?.businessName && (
                    <View style={styles.infoBadge}>
                      <Ionicons
                        name="fitness"
                        size={12}
                        color="rgba(255,255,255,0.95)"
                      />
                      <Text style={styles.infoBadgeText} numberOfLines={1}>
                        {selectedTenantDetails.businessName}
                      </Text>
                    </View>
                  )}
                </View>
              </Animated.View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ═══════════ STATS ROW ═══════════ */}
        {currentMembership && (
          <Animated.View
            entering={FadeInUp.delay(250).springify()}
            style={styles.statsSection}
          >
            <Card elevated style={styles.statsCard}>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <View
                    style={[
                      styles.statIconBg,
                      { backgroundColor: `${colors.primary}15` },
                    ]}
                  >
                    <Ionicons
                      name="calendar"
                      size={20}
                      color={colors.primary}
                    />
                  </View>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {currentMembership.remainingDays}
                  </Text>
                  <Text
                    style={[
                      styles.statLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Days Left
                  </Text>
                </View>

                <View
                  style={[
                    styles.statDivider,
                    { backgroundColor: colors.border },
                  ]}
                />

                <View style={styles.statItem}>
                  <View
                    style={[
                      styles.statIconBg,
                      { backgroundColor: `${colors.success}15` },
                    ]}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.success}
                    />
                  </View>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {currentMembership.memberShipStatus}
                  </Text>
                  <Text
                    style={[
                      styles.statLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Status
                  </Text>
                </View>

                <View
                  style={[
                    styles.statDivider,
                    { backgroundColor: colors.border },
                  ]}
                />

                <View style={styles.statItem}>
                  <View
                    style={[
                      styles.statIconBg,
                      { backgroundColor: `${colors.info}15` },
                    ]}
                  >
                    <Ionicons
                      name="barbell"
                      size={20}
                      color={colors.info}
                    />
                  </View>
                  <Text
                    style={[styles.statValue, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {currentMembership.planName?.split(" ")[0] || "—"}
                  </Text>
                  <Text
                    style={[
                      styles.statLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Plan
                  </Text>
                </View>
              </View>
            </Card>
          </Animated.View>
        )}

        {/* ═══════════ GYM INFO CARD ═══════════ */}
        {selectedTenantDetails && (
          <Animated.View
            entering={FadeInUp.delay(300).springify()}
            style={styles.section}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View
                  style={[
                    styles.sectionIconBg,
                    { backgroundColor: `${colors.success}15` },
                  ]}
                >
                  <Ionicons
                    name="business"
                    size={18}
                    color={colors.success}
                  />
                </View>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Your Gym
                </Text>
              </View>
            </View>

            <Card elevated style={styles.gymInfoCard}>
              {/* Gym Image */}
              <View style={styles.gymImageWrapper}>
                {selectedTenantDetails?.imageName ? (
                  <Image
                    source={{ uri: selectedTenantDetails.imageName }}
                    style={styles.gymImage}
                    resizeMode="cover"
                  />
                ) : (
                  <LinearGradient
                    colors={[colors.gradientStart, colors.gradientEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gymImagePlaceholder}
                  >
                    <Ionicons name="barbell" size={32} color="#FFFFFF" />
                    <Text style={styles.gymImagePlaceholderText}>
                      {selectedTenantDetails?.businessName?.charAt(0) || "G"}
                    </Text>
                  </LinearGradient>
                )}
              </View>

              {/* Gym Details */}
              <View style={styles.gymDetailsContainer}>
                <Text
                  style={[styles.gymName, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {selectedTenantDetails?.businessName?.replaceAll("_", " ") ||
                    "Your Gym"}
                </Text>

                {selectedTenantDetails?.businessAddress && (
                  <View style={styles.gymDetailRow}>
                    <View
                      style={[
                        styles.gymDetailIcon,
                        { backgroundColor: `${colors.primary}12` },
                      ]}
                    >
                      <Ionicons
                        name="location"
                        size={14}
                        color={colors.primary}
                      />
                    </View>
                    <Text
                      style={[
                        styles.gymDetailText,
                        { color: colors.textSecondary },
                      ]}
                      numberOfLines={2}
                    >
                      {selectedTenantDetails.businessAddress}
                    </Text>
                  </View>
                )}

                {selectedTenantDetails?.businessPhone && (
                  <TouchableOpacity
                    style={styles.gymDetailRow}
                    onPress={() =>
                      Linking.openURL(
                        `tel:${selectedTenantDetails.customerCareNumber || selectedTenantDetails.businessPhone}`
                      )
                    }
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.gymDetailIcon,
                        { backgroundColor: `${colors.success}12` },
                      ]}
                    >
                      <Ionicons
                        name="call"
                        size={14}
                        color={colors.success}
                      />
                    </View>
                    <Text
                      style={[
                        styles.gymDetailText,
                        { color: colors.info },
                      ]}
                    >
                      {selectedTenantDetails.customerCareNumber ||
                        selectedTenantDetails.businessPhone}
                    </Text>
                    <Ionicons
                      name="open-outline"
                      size={14}
                      color={colors.info}
                      style={{ marginLeft: 4 }}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </Card>
          </Animated.View>
        )}

        {/* ═══════════ ACCOUNT SECTION ═══════════ */}
        <Animated.View
          entering={FadeInUp.delay(350).springify()}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View
                style={[
                  styles.sectionIconBg,
                  { backgroundColor: `${colors.primary}15` },
                ]}
              >
                <Ionicons
                  name="person-circle"
                  size={18}
                  color={colors.primary}
                />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Account
              </Text>
            </View>
          </View>

          <Card elevated style={styles.menuCard}>
            {accountMenuItems.map((item, index) => (
              <React.Fragment key={item.title}>
                <AnimatedTouchable
                  entering={SlideInRight.delay(400 + index * 80).springify()}
                  style={styles.menuItem}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.menuIconContainer,
                      { backgroundColor: `${item.color}12` },
                    ]}
                  >
                    <Ionicons
                      name={item.icon}
                      size={20}
                      color={item.color}
                    />
                  </View>
                  <View style={styles.menuContent}>
                    <Text style={[styles.menuTitle, { color: colors.text }]}>
                      {item.title}
                    </Text>
                    <Text
                      style={[
                        styles.menuSubtitle,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {item.subtitle}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.menuArrow,
                      { backgroundColor: colors.backgroundSecondary },
                    ]}
                  >
                    <Ionicons
                      name="chevron-forward"
                      size={14}
                      color={colors.textTertiary}
                    />
                  </View>
                </AnimatedTouchable>
                {index < accountMenuItems.length - 1 && (
                  <View
                    style={[
                      styles.menuDivider,
                      { backgroundColor: colors.border },
                    ]}
                  />
                )}
              </React.Fragment>
            ))}
          </Card>
        </Animated.View>

        {/* ═══════════ MEMBERSHIP SECTION ═══════════ */}
        <Animated.View
          entering={FadeInUp.delay(450).springify()}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View
                style={[
                  styles.sectionIconBg,
                  { backgroundColor: `${colors.secondary}15` },
                ]}
              >
                <Ionicons name="card" size={18} color={colors.secondary} />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Membership
              </Text>
            </View>
          </View>

          {!showHistory && currentMembership && (
            <MembershipCard membership={currentMembership} />
          )}

          <TouchableOpacity
            style={[
              styles.historyToggle,
              {
                backgroundColor: showHistory
                  ? `${colors.primary}12`
                  : "transparent",
                borderColor: colors.primary,
              },
            ]}
            onPress={() => setShowHistory(!showHistory)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={showHistory ? "eye-off-outline" : "time-outline"}
              size={18}
              color={colors.primary}
            />
            <Text style={[styles.historyToggleText, { color: colors.primary }]}>
              {showHistory ? "Hide History" : "View History"}
            </Text>
            <Ionicons
              name={showHistory ? "chevron-up" : "chevron-down"}
              size={16}
              color={colors.primary}
            />
          </TouchableOpacity>

          {showHistory && (
            <Animated.View
              entering={FadeInDown.springify()}
              layout={Layout.springify()}
              style={styles.historyContainer}
            >
              {memberships?.length > 0 ? (
                memberships.map((membership, index) => (
                  <Animated.View
                    key={membership.id}
                    entering={FadeInDown.delay(index * 80).springify()}
                  >
                    <MembershipCard membership={membership} />
                  </Animated.View>
                ))
              ) : (
                <Card elevated style={styles.emptyCard}>
                  <Ionicons
                    name="document-text-outline"
                    size={40}
                    color={colors.textTertiary}
                  />
                  <Text
                    style={[
                      styles.emptyText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    No membership history available
                  </Text>
                </Card>
              )}
            </Animated.View>
          )}
        </Animated.View>

        {/* ═══════════ LOGOUT SECTION ═══════════ */}
        <Animated.View
          entering={FadeInUp.delay(550).springify()}
          style={styles.logoutSection}
        >
          <TouchableOpacity
            style={[styles.logoutButton, { borderColor: `${colors.error}40` }]}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={[`${colors.error}08`, `${colors.error}04`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.logoutGradient}
            >
              <Ionicons name="log-out-outline" size={20} color={colors.error} />
              <Text style={[styles.logoutText, { color: colors.error }]}>
                Sign Out
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={[styles.versionText, { color: colors.textTertiary }]}>
            Gym Udaan • v1.0.0
          </Text>
        </Animated.View>
      </ScrollView>

      {/* Change Password Modal */}
      <ChangePasswordModal
        visible={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        onSubmit={handlePasswordChange}
        isSubmitting={isSubmitting}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },

  // ── Hero Header ──
  heroGradient: {
    paddingTop: Platform.OS === "ios" ? 65 : 50,
    paddingBottom: 40,
    paddingHorizontal: 24,
    overflow: "hidden",
    position: "relative",
  },
  decorCircle1: {
    position: "absolute",
    top: -40,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  decorCircle2: {
    position: "absolute",
    bottom: -20,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  decorCircle3: {
    position: "absolute",
    top: 30,
    left: 50,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  heroContent: {
    alignItems: "center",
  },

  // ── Avatar ──
  avatarOuter: {
    marginBottom: 18,
  },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 1,
  },

  // ── User Info ──
  userInfoContainer: {
    alignItems: "center",
  },
  userName: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  infoBadgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  infoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  infoBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.95)",
    maxWidth: 150,
  },

  // ── Stats ──
  statsSection: {
    paddingHorizontal: 20,
    marginTop: -20,
    marginBottom: 8,
  },
  statsCard: {
    padding: 16,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  statIconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  statDivider: {
    width: 1,
    height: 50,
  },

  // ── Sections ──
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sectionIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  // ── Gym Info ──
  gymInfoCard: {
    padding: 0,
    overflow: "hidden",
  },
  gymImageWrapper: {
    width: "100%",
    height: 160,
    overflow: "hidden",
  },
  gymImage: {
    width: "100%",
    height: "100%",
  },
  gymImagePlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  gymImagePlaceholderText: {
    fontSize: 28,
    fontWeight: "900",
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 2,
  },
  gymDetailsContainer: {
    padding: 16,
  },
  gymName: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
    letterSpacing: 0.1,
  },
  gymDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 10,
  },
  gymDetailIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  gymDetailText: {
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
    lineHeight: 18,
  },

  // ── Account Menu ──
  menuCard: {
    padding: 0,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 3,
    letterSpacing: 0.1,
  },
  menuSubtitle: {
    fontSize: 13,
    lineHeight: 17,
  },
  menuArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  menuDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 72,
  },

  // ── Membership History ──
  historyToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    marginTop: 14,
  },
  historyToggleText: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  historyContainer: {
    marginTop: 14,
  },
  emptyCard: {
    padding: 40,
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },

  // ── Logout ──
  logoutSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    alignItems: "center",
  },
  logoutButton: {
    width: "100%",
    borderRadius: 14,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  logoutGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 15,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  versionText: {
    fontSize: 12,
    marginTop: 16,
    letterSpacing: 0.5,
  },
});