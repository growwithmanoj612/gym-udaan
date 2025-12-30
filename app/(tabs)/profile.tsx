import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Colors } from "@/constants/color";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/store/useAuthStore";
import { useMembershipStore } from "@/store/useMembershipStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInUp, Layout } from "react-native-reanimated";
import { toast } from "@/providers/toast-provider"; // Adjust if your toast import differs
import MembershipCard from "../component/membership-card"; 
import ChangePasswordModal from "../component/change-password-modal";

const AnimatedCard = Animated.createAnimatedComponent(Card);

export default function Profile() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { logout, appUser, changePassword, selectedTenantName } = useAuthStore();
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
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={40} color="#FFFFFF" />
              </View>
            </View>
      
            <Text style={styles.userName}>{appUser?.fullName}</Text>
            <View style={styles.infoItem}>
              <Ionicons name="call" size={14} color="rgba(255,255,255,0.9)" />
              <Text style={styles.infoText}>{appUser?.phone}</Text>
            </View>
            {selectedTenantName && (
              <View style={styles.infoItem}>
                <Ionicons name="business" size={14} color="rgba(255,255,255,0.9)" />
                <Text style={styles.infoText}>{selectedTenantName}</Text>
              </View>
            )}
          </View>
        </AnimatedCard>

        {/* Account Section */}
        <Animated.View
          entering={FadeInUp.delay(200).springify()}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Ionicons name="person-circle" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Account
            </Text>
          </View>
          <Card elevated style={styles.accountCard}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setShowChangePassword(true)}
            >
              <View style={styles.menuIcon}>
                <Ionicons name="key" size={20} color={colors.primary} />
              </View>
              <View style={styles.menuContent}>
                <Text style={[styles.menuTitle, { color: colors.text }]}>
                  Change Password
                </Text>
                <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>
                  Update your account security
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </Card>
        </Animated.View>

        {/* Membership Section */}
        <Animated.View
          entering={FadeInUp.delay(300).springify()}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Ionicons name="card" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Membership
            </Text>
          </View>

          {!showHistory && currentMembership && (
            <MembershipCard membership={currentMembership} />
          )}

          <Button
            title={showHistory ? "Hide History" : "View History"}
            onPress={() => setShowHistory(!showHistory)}
            variant="outline"
            size="medium"
            style={[styles.historyButton, { borderColor: colors.primary }]}
            textStyle={{ color: colors.primary }}
          />

          {showHistory && (
            <Animated.View
              entering={FadeInUp.springify()}
              layout={Layout.springify()}
              style={styles.historyContainer}
            >
              {memberships?.length > 0 ? (
                memberships.map((membership) => (
                  <MembershipCard key={membership.id} membership={membership} />
                ))
              ) : (
                <Text style={[styles.noHistory, { color: colors.textSecondary }]}>
                  No membership history available.
                </Text>
              )}
            </Animated.View>
          )}
        </Animated.View>

        {/* Actions Section */}
        <Animated.View
          entering={FadeInUp.delay(400).springify()}
          style={styles.actionsSection}
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
  headerCard: {
    margin: 20,
    marginTop: 60,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 20,
  },
  avatarContainer: {
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
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
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
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  accountCard: {
    padding: 0,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
  },
  historyButton: {
    marginTop: 12,
  },
  historyContainer: {
    marginTop: 16,
  },
  noHistory: {
    textAlign: "center",
    fontSize: 14,
    marginTop: 20,
  },
  actionsSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    marginTop: 20,
  },
  logoutButton: {
    borderWidth: 2,
    borderRadius: 10,
  },
});