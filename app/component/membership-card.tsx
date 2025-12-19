// app/(tabs)/profile.tsx
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
 

export default function MembershipCard({membership}:{membership:IMemberShipDetails}) {
  
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  
 

  {/* Membership Card */}
  return (
    
          <Animated.View
            entering={FadeInDown.delay(300).springify()}
            style={styles.section}
          >
       
            <Card elevated style={styles.membershipCard}>
              <View style={styles.membershipHeader}>
                <View style={{ flex: 1 }}>
                  <View style={styles.membershipBadge}>
                    <Text style={styles.membershipBadgeText}>{membership?.memberShipStatus}</Text>
                  </View>
                  <Text
                    style={[styles.membershipTitle, { color: colors.text }]}
                  >
                    {membership.planName}
                  </Text>

                  <Text>
                    Started on: {membership?.membershipStartDate}
                  </Text>
                  <Text
                    style={[
                      styles.membershipDate,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Expires on {membership.membershipEndDate}
                  </Text>
                </View>
                <View style={styles.membershipPrice}>
                  <Text style={[styles.daysLeft, { color: colors.primary }]}>
                    {membership.remainingDays}
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
                  ₹{membership.price}
                </Text>
              </View>

             
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