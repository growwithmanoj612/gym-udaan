import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Colors } from "@/constants/color";
import { balanceData, memberData, membershipHistory } from "@/data/members";
import { IMemberShipDetails } from "@/global/interfaces";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/store/useAuthStore";
import { useMembershipStore } from "@/store/useMembershipStore";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  Layout,
} from "react-native-reanimated";

export default function MembershipCard({ membership }: { membership: IMemberShipDetails }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <Animated.View
      entering={FadeInDown.delay(300).springify()}
      style={styles.section}
    >
      <Card elevated style={styles.membershipCard}>
        <View style={styles.membershipHeader}>
          <View style={{ flex: 1 }}>
            <View style={styles.membershipBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" />
              <Text style={styles.membershipBadgeText}>{membership?.memberShipStatus}</Text>
            </View>
            <Text style={[styles.membershipTitle, { color: colors.text }]}>
              {membership.planName}
            </Text>
            <View style={styles.dateContainer}>
              <Ionicons name="calendar-outline" size={16} color={colors.primary} />
              <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                Started: {membership?.membershipStartDate}
              </Text>
            </View>
            <View style={styles.dateContainer}>
              <Ionicons name="time-outline" size={16} color={colors.error || '#FF6B6B'} />
              <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                Expires: {membership.membershipEndDate}
              </Text>
            </View>
          </View>
          <View style={styles.membershipPrice}>
            <Text style={[styles.daysLeft, { color: colors.primary }]}>
              {membership.remainingDays}
            </Text>
            <Text style={[styles.daysLabel, { color: colors.textSecondary }]}>
              Days Left
            </Text>
            {/* Optional: Add a progress indicator */}
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.max(0, (membership.remainingDays / 30) * 100)}%`, // Assuming 30-day cycle, adjust as needed
                    backgroundColor: colors.primary,
                  },
                ]}
              />
            </View>
          </View>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerCard: {
    margin: 20,
    marginTop: 60,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 20,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  editButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  memberInfo: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  statItem: {
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.8)",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  membershipCard: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  membershipHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  membershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#10B981",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 12,
    gap: 4,
  },
  membershipBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  membershipTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    lineHeight: 24,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
  },
  membershipPrice: {
    alignItems: "center",
  },
  daysLeft: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 4,
  },
  daysLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  progressBar: {
    width: 80,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  divider: {
    height: 1,
    marginVertical: 20,
  },
  menuCard: {
    marginBottom: 12,
    padding: 16,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 13,
  },
  logoutSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  logoutButton: {
    borderWidth: 2,
  },
});