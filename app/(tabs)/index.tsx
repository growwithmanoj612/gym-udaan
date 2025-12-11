// app/(tabs)/index.tsx
import { Card } from "@/components/ui/card";
import { Colors } from "@/constants/color";
import { attendanceData, memberData, membershipHistory } from "@/data/members";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Dimensions,
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
} from "react-native-reanimated";

const AnimatedCard = Animated.createAnimatedComponent(Card);
const { width } = Dimensions.get("window");

export default function Home() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const member = memberData.data;
  const activeMembership = membershipHistory.data.find(
    (m) => m.memberShipStatus === "ACTIVE"
  );
  const recentAttendance = attendanceData.data.slice(0, 3);

  const quickActions = [
    {
      icon: "qr-code",
      title: "Scan QR",
      color: colors.primary,
      route: "/scan-qr",
    },
    {
      icon: "restaurant",
      title: "Diet Plan",
      color: "#10B981",
      route: "/diet-plans",
    },
    {
      icon: "cart",
      title: "Shop",
      color: "#8B5CF6",
      route: "/products",
    },
    {
      icon: "notifications",
      title: "Alerts",
      color: "#F59E0B",
      route: "/notifications",
    },
  ];

  const stats = [
    {
      label: "Workouts",
      value: recentAttendance.length,
      icon: "fitness",
      color: colors.primary,
      subtext: "This week",
    },
    {
      label: "Calories",
      value: "1,850",
      icon: "flame",
      color: "#EF4444",
      subtext: "Burned today",
    },
    {
      label: "Streak",
      value: "12",
      icon: "trophy",
      color: "#F59E0B",
      subtext: "Days active",
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View
          entering={FadeInUp.springify()}
          style={[styles.header, { backgroundColor: colors.card }]}
        >
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              Welcome back,
            </Text>
            <Text style={[styles.userName, { color: colors.text }]}>
              {member.fullName.split(" ")[0]}! 👋
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.notificationButton,
              { backgroundColor: colors.backgroundSecondary },
            ]}
            onPress={() => router.push("/notifications")}
          >
            <Ionicons name="notifications" size={24} color={colors.text} />
            <View style={[styles.badge, { backgroundColor: colors.error }]} />
          </TouchableOpacity>
        </Animated.View>

        {/* Active Membership Card */}
        {activeMembership && (
          <AnimatedCard
            entering={FadeInDown.delay(100).springify()}
            gradient
            style={styles.membershipCard}
          >
            <View style={styles.membershipContent}>
              <View style={{ flex: 1 }}>
                <Text style={styles.membershipLabel}>Active Membership</Text>
                <Text style={styles.membershipPlan}>
                  {activeMembership.planName}
                </Text>
                <View style={styles.expiryRow}>
                  <Ionicons
                    name="time"
                    size={14}
                    color="rgba(255,255,255,0.9)"
                  />
                  <Text style={styles.expiryText}>
                    {activeMembership.remainingDays} days remaining
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.renewButton}
                onPress={() => router.push("/membership-history")}
              >
                <Text style={styles.renewText}>View Details</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </AnimatedCard>
        )}

        {/* Quick Actions */}
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={styles.section}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Quick Actions
          </Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <Animated.View
                key={index}
                entering={FadeInRight.delay(250 + index * 50).springify()}
              >
                <TouchableOpacity
                  onPress={() =>
                    action.route && router.push(action.route as any)
                  }
                  activeOpacity={0.7}
                >
                  <Card elevated style={styles.actionCard}>
                    <View
                      style={[
                        styles.actionIcon,
                        { backgroundColor: `${action.color}15` },
                      ]}
                    >
                      <Ionicons
                        name={action.icon as any}
                        size={24}
                        color={action.color}
                      />
                    </View>
                    <Text style={[styles.actionTitle, { color: colors.text }]}>
                      {action.title}
                    </Text>
                  </Card>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Stats Overview */}
        <Animated.View
          entering={FadeInDown.delay(400).springify()}
          style={styles.section}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Your Progress
          </Text>
          <View style={styles.statsRow}>
            {stats.map((stat, index) => (
              <AnimatedCard
                key={index}
                entering={FadeInDown.delay(450 + index * 50).springify()}
                elevated
                style={styles.statCard}
              >
                <View
                  style={[
                    styles.statIcon,
                    { backgroundColor: `${stat.color}15` },
                  ]}
                >
                  <Ionicons
                    name={stat.icon as any}
                    size={24}
                    color={stat.color}
                  />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {stat.value}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  {stat.label}
                </Text>
                <Text
                  style={[styles.statSubtext, { color: colors.textTertiary }]}
                >
                  {stat.subtext}
                </Text>
              </AnimatedCard>
            ))}
          </View>
        </Animated.View>

        {/* Recent Activity */}
        <Animated.View
          entering={FadeInDown.delay(600).springify()}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Recent Check-ins
            </Text>
            <TouchableOpacity onPress={() => router.push("/attendance")}>
              <Text style={[styles.viewAll, { color: colors.primary }]}>
                View All
              </Text>
            </TouchableOpacity>
          </View>

          {recentAttendance.map((record, index) => (
            <AnimatedCard
              key={record.id}
              entering={FadeInDown.delay(650 + index * 50).springify()}
              elevated
              style={styles.activityCard}
            >
              <View style={styles.activityContent}>
                <View
                  style={[
                    styles.activityDate,
                    { backgroundColor: `${colors.primary}15` },
                  ]}
                >
                  <Text style={[styles.activityDay, { color: colors.primary }]}>
                    {new Date(record.date).getDate()}
                  </Text>
                  <Text
                    style={[styles.activityMonth, { color: colors.primary }]}
                  >
                    {new Date(record.date).toLocaleDateString("en-US", {
                      month: "short",
                    })}
                  </Text>
                </View>

                <View style={styles.activityDetails}>
                  <Text style={[styles.activityTitle, { color: colors.text }]}>
                    {new Date(record.date).toLocaleDateString("en-US", {
                      weekday: "long",
                    })}
                  </Text>
                  <View style={styles.activityTime}>
                    <Ionicons
                      name="time"
                      size={14}
                      color={colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.activityTimeText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {record.checkInTime} - {record.checkOutTime}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.shiftBadge,
                    {
                      backgroundColor:
                        record.shiftType === "MORNING"
                          ? `${colors.warning}20`
                          : `${colors.info}20`,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.shiftText,
                      {
                        color:
                          record.shiftType === "MORNING"
                            ? colors.warning
                            : colors.info,
                      },
                    ]}
                  >
                    {record.shiftType}
                  </Text>
                </View>
              </View>
            </AnimatedCard>
          ))}
        </Animated.View>

        {/* Motivation Card */}
        <AnimatedCard
          entering={FadeInDown.delay(850).springify()}
          style={[
            styles.motivationCard,
            { backgroundColor: `${colors.primary}10` },
          ]}
        >
          <LinearGradient
            colors={[`${colors.primary}30`, `${colors.secondary}20`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.motivationGradient}
          >
            <Ionicons name="trophy" size={32} color={colors.primary} />
            <Text style={[styles.motivationTitle, { color: colors.text }]}>
              Keep Going! 💪
            </Text>
            <Text
              style={[styles.motivationText, { color: colors.textSecondary }]}
            >
              You're doing great! Stay consistent and you'll reach your goals.
            </Text>
          </LinearGradient>
        </AnimatedCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  greeting: {
    fontSize: 14,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  membershipCard: {
    margin: 20,
    marginTop: 16,
    padding: 20,
  },
  membershipContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  membershipLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 4,
  },
  membershipPlan: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  expiryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  expiryText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
  },
  renewButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  renewText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  viewAll: {
    fontSize: 14,
    fontWeight: "600",
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    width: (width - 56) / 2,
    padding: 16,
    alignItems: "center",
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    alignItems: "center",
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  statSubtext: {
    fontSize: 10,
  },
  activityCard: {
    padding: 16,
    marginBottom: 12,
  },
  activityContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  activityDate: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  activityDay: {
    fontSize: 16,
    fontWeight: "bold",
  },
  activityMonth: {
    fontSize: 10,
    textTransform: "uppercase",
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  activityTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  activityTimeText: {
    fontSize: 12,
  },
  shiftBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  shiftText: {
    fontSize: 10,
    fontWeight: "600",
  },
  motivationCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    overflow: "hidden",
    borderRadius: 16,
  },
  motivationGradient: {
    padding: 20,
    alignItems: "center",
  },
  motivationTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 8,
  },
  motivationText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
