// app/(tabs)/profile.tsx
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Colors } from "@/constants/color";
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

export default function Profile() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace("/(auth)/login");
  };

  const menuItems = [
    {
      icon: "time",
      title: "Membership History",
      subtitle: "View past plans",
      route: "/membership-history",
    },
    {
      icon: "wallet",
      title: "Balance & Payments",
      subtitle: "Manage billing",
      route: "/payments",
    },
    {
      icon: "information-circle",
      title: "Contact Information",
      subtitle: "Update details",
      route: "/contact-info",
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Card */}
        <Card gradient style={styles.headerCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={40} color="#FFFFFF" />
              </View>
              <TouchableOpacity style={styles.editButton}>
                <Ionicons name="pencil" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.userName}>Abhishek Soni</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>72.5kg</Text>
                <Text style={styles.statLabel}>Weight</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>175cm</Text>
                <Text style={styles.statLabel}>Height</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>28</Text>
                <Text style={styles.statLabel}>Age</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Membership Card */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Current Membership
          </Text>
          <Card elevated style={styles.membershipCard}>
            <View style={styles.membershipHeader}>
              <View>
                <View style={styles.membershipBadge}>
                  <Text style={styles.membershipBadgeText}>ACTIVE</Text>
                </View>
                <Text style={[styles.membershipTitle, { color: colors.text }]}>
                  Premium Plan
                </Text>
                <Text
                  style={[
                    styles.membershipDate,
                    { color: colors.textSecondary },
                  ]}
                >
                  Expires 1 Month from now
                </Text>
              </View>
              <View style={styles.membershipPrice}>
                <Text style={[styles.daysLeft, { color: colors.text }]}>
                  29
                </Text>
                <Text
                  style={[styles.daysLabel, { color: colors.textSecondary }]}
                >
                  Days Remaining
                </Text>
              </View>
            </View>

            <View style={styles.priceRow}>
              <Text
                style={[styles.priceLabel, { color: colors.textSecondary }]}
              >
                Membership Price
              </Text>
              <Text style={[styles.priceValue, { color: colors.text }]}>
                ₹2500
              </Text>
            </View>
          </Card>
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
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
                      { backgroundColor: `${colors.primary}15` },
                    ]}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={24}
                      color={colors.primary}
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
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="outline"
            size="large"
            style={styles.logoutButton}
          />
        </View>
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
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.3)",
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
    marginBottom: 20,
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
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  priceLabel: {
    fontSize: 14,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: "bold",
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
    borderColor: "#EF4444",
  },
});
