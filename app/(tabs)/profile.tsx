// app/(tabs)/profile.tsx
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Colors } from "@/constants/color";
import { balanceData, memberData, membershipHistory } from "@/data/members";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuth } from "@/store/useAuth";
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

const AnimatedCard = Animated.createAnimatedComponent(Card);
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function Profile() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { logout } = useAuth();

  const member = memberData.data;
  const activeMembership = membershipHistory.data.find(
    (m) => m.memberShipStatus === "ACTIVE"
  );
  const balance = balanceData.data;

  const handleLogout = () => {
    logout();
    router.replace("/(auth)/login");
  };

  const menuItems = [
    {
      icon: "time",
      title: "Membership History",
      subtitle: "View past memberships",
      route: "/membership-history",
      color: colors.primary,
    },
  ];

  const stats = [
    { label: "Weight", value: `${member.weight}kg`, icon: "barbell" },
    { label: "Height", value: `${member.height}cm`, icon: "resize" },
    { label: "Blood", value: member.bloodGroup || "N/A", icon: "water" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Card */}
        <AnimatedCard
          entering={FadeInUp.delay(100).springify()}
          gradient
          style={styles.headerCard}
        >
          <View style={styles.profileHeader}>
            <Animated.View
              entering={FadeInUp.delay(200).springify()}
              style={styles.avatarContainer}
            >
              <View style={styles.avatar}>
                <Ionicons name="person" size={40} color="#FFFFFF" />
              </View>
              <TouchableOpacity style={styles.editButton}>
                <Ionicons name="pencil" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </Animated.View>

            <Animated.Text
              entering={FadeInUp.delay(300).springify()}
              style={styles.userName}
            >
              {member.fullName}
            </Animated.Text>

            <Animated.View
              entering={FadeInUp.delay(400).springify()}
              style={styles.memberInfo}
            >
              <View style={styles.infoItem}>
                <Ionicons name="call" size={14} color="rgba(255,255,255,0.9)" />
                <Text style={styles.infoText}>{member.phone}</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="card" size={14} color="rgba(255,255,255,0.9)" />
                <Text style={styles.infoText}>#{member.cardNumber}</Text>
              </View>
            </Animated.View>

            <Animated.View
              entering={FadeInUp.delay(500).springify()}
              style={styles.statsRow}
            >
              {stats.map((stat, index) => (
                <View key={index} style={styles.statItem}>
                  <Ionicons
                    name={stat.icon as any}
                    size={18}
                    color="rgba(255,255,255,0.9)"
                  />
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </Animated.View>
          </View>
        </AnimatedCard>

        {/* Membership Card */}
        {activeMembership && (
          <Animated.View
            entering={FadeInDown.delay(300).springify()}
            style={styles.section}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Current Membership
            </Text>
            <Card elevated style={styles.membershipCard}>
              <View style={styles.membershipHeader}>
                <View style={{ flex: 1 }}>
                  <View style={styles.membershipBadge}>
                    <Text style={styles.membershipBadgeText}>ACTIVE</Text>
                  </View>
                  <Text
                    style={[styles.membershipTitle, { color: colors.text }]}
                  >
                    {activeMembership.planName}
                  </Text>
                  <Text
                    style={[
                      styles.membershipDate,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Expires on {activeMembership.endDateEng}
                  </Text>
                </View>
                <View style={styles.membershipPrice}>
                  <Text style={[styles.daysLeft, { color: colors.primary }]}>
                    {activeMembership.remainingDays}
                  </Text>
                  <Text
                    style={[styles.daysLabel, { color: colors.textSecondary }]}
                  >
                    Days Left
                  </Text>
                </View>
              </View>

              <View
                style={[styles.divider, { backgroundColor: colors.border }]}
              />

              <View style={styles.priceRow}>
                <Text
                  style={[styles.priceLabel, { color: colors.textSecondary }]}
                >
                  Membership Price
                </Text>
                <Text style={[styles.priceValue, { color: colors.text }]}>
                  ₹{activeMembership.price}
                </Text>
              </View>

              {activeMembership.facilities.length > 0 && (
                <>
                  <View
                    style={[styles.divider, { backgroundColor: colors.border }]}
                  />
                  <Text
                    style={[
                      styles.facilitiesTitle,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Facilities Included
                  </Text>
                  {activeMembership.facilities.map((facility, index) => (
                    <View key={index} style={styles.facilityItem}>
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color={colors.success}
                      />
                      <Text
                        style={[styles.facilityText, { color: colors.text }]}
                      >
                        {facility.facilityName}
                      </Text>
                    </View>
                  ))}
                </>
              )}
            </Card>
          </Animated.View>
        )}

        {/* Menu Items */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Quick Actions
          </Text>
          {menuItems.map((item, index) => (
            <AnimatedTouchable
              key={index}
              entering={FadeInDown.delay(400 + index * 50).springify()}
              layout={Layout.springify()}
              onPress={() => {
                // Handle navigation
              }}
              activeOpacity={0.7}
            >
              <Card elevated style={styles.menuCard}>
                <View style={styles.menuRow}>
                  <View
                    style={[
                      styles.menuIcon,
                      { backgroundColor: `${item.color}15` },
                    ]}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={24}
                      color={item.color}
                    />
                  </View>
                  <View style={styles.menuText}>
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
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.textTertiary}
                  />
                </View>
              </Card>
            </AnimatedTouchable>
          ))}
        </View>

        {/* Logout Button */}
        <Animated.View
          entering={FadeInDown.delay(900).springify()}
          style={styles.logoutSection}
        >
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="outline"
            size="large"
            style={[styles.logoutButton, { borderColor: colors.error }]}
            textStyle={{ color: colors.error }}
          />
        </Animated.View>
      </ScrollView>
    </View>
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
  },
  membershipHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  membershipBadge: {
    backgroundColor: "#10B981",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  membershipBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  membershipTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  membershipDate: {
    fontSize: 13,
  },
  membershipPrice: {
    alignItems: "flex-end",
  },
  daysLeft: {
    fontSize: 32,
    fontWeight: "bold",
  },
  daysLabel: {
    fontSize: 12,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  priceLabel: {
    fontSize: 14,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  facilitiesTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  facilityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  facilityText: {
    fontSize: 14,
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