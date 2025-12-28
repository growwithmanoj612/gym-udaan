import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Colors } from "@/constants/color";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/store/useAuthStore";
import { useMembershipStore } from "@/store/useMembershipStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect, Fragment } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import MembershipCard from "../component/membership-card";

const AnimatedCard = Animated.createAnimatedComponent(Card);

export default function Profile() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { logout, appUser, changePassword } = useAuthStore();
  const { currentMembership, fetchAll, memberships } = useMembershipStore();

  const [showHistory, setShowHistory] = useState(false); // Membership history toggle
  const [showChangePassword, setShowChangePassword] = useState(false); // Change password modal toggle
  const [oldPassword, setOldPassword] = useState(""); // Old password input
  const [newPassword, setNewPassword] = useState(""); // New password input
  const [isSubmitting, setIsSubmitting] = useState(false); // Track submission state

  useEffect(() => {
    if (showHistory) {
      fetchAll(); // Fetch membership history if toggled
    }
  }, [showHistory]);

  const handleLogout = () => {
    logout();
    router.replace("/(auth)/login");
  };

  const handlePasswordChange = async () => {
    if (!oldPassword || !newPassword) {
      alert("Please fill in both current and new password.");
      return;
    }
    setIsSubmitting(true);
    try {
      await changePassword(oldPassword, newPassword); // Call the changePassword function
      setShowChangePassword(false); // Close the modal after successful password change
    } catch (error: any) {
      console.error("Error changing password:", error?.message);
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
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setShowChangePassword(true)}
              >
                <Ionicons name="pencil" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.userName}>{appUser?.fullName}</Text>
            <View style={styles.infoItem}>
              <Ionicons name="call" size={14} color="rgba(255,255,255,0.9)" />
              <Text style={styles.infoText}>{appUser?.phone}</Text>
            </View>
          </View>
        </AnimatedCard>

        {/* Membership Section */}
        {!showHistory && currentMembership && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Current Membership
            </Text>
            <MembershipCard membership={currentMembership} />
          </>
        )}

        {/* View Membership History Button */}
        <View style={styles.section}>
          <Button
            title={showHistory ? "Hide History" : "View Membership History"}
            onPress={() => setShowHistory(!showHistory)}
            variant="primary"
            size="large"
            style={[
              styles.toggleHistoryButton,
              { backgroundColor: colors.primary },
            ]}
            textStyle={{ color: "#FFFFFF" }}
          />
        </View>

        {/* Membership History List */}
        {showHistory &&
          memberships?.length > 0 &&
          memberships.map((membership) => (
            <Fragment key={membership.id}>
              <MembershipCard membership={membership} />
            </Fragment>
          ))}

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="outline"
            size="large"
            style={[styles.logoutButton, { borderColor: colors.error }]}
            textStyle={{ color: colors.error }}
          />
        </View>
      </ScrollView>

      {/* Change Password Modal */}
      <Modal
        visible={showChangePassword}
        animationType="slide"
        transparent
        onRequestClose={() => setShowChangePassword(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
          <Text
            style={[styles.modalTitle, { color: colors.text }]}
          >
            Change Password
          </Text>
          <TextInput
            secureTextEntry
            placeholder="Current Password"
            placeholderTextColor={colors.textSecondary}
            value={oldPassword}
            onChangeText={setOldPassword}
            style={[
              styles.input,
              { borderColor: colors.textSecondary, color: colors.text },
            ]}
          />
          <TextInput
            secureTextEntry
            placeholder="New Password"
            placeholderTextColor={colors.textSecondary}
            value={newPassword}
            onChangeText={setNewPassword}
            style={[
              styles.input,
              { borderColor: colors.textSecondary, color: colors.text },
            ]}
          />
          <View style={styles.actionRow}>
            <Button
              title="Cancel"
              onPress={() => setShowChangePassword(false)}
              variant="outline"
              size="large"
              style={[
                styles.cancelButton,
                { borderColor: colors.textSecondary },
              ]}
              textStyle={{
                color: colors.textSecondary,
              }}
            />
            <Button
              title={isSubmitting ? "Changing..." : "Confirm"}
              onPress={handlePasswordChange}
              disabled={isSubmitting}
              variant="primary"
              size="large"
              style={{
                backgroundColor: isSubmitting
                  ? colors.textSecondary
                  : colors.primary,
              }}
              textStyle={{
                color: "#FFFFFF",
              }}
            />
          </View>
        </View>
      </Modal>
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
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 10, // Added for proper spacing
  },
  infoText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
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
  changePasswordCard: {
    padding: 16,
    borderRadius: 10,
    backgroundColor: "#FFFFFF", // Ensures contrast with text
    elevation: 3, // Adds shadow effect
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Background overlay with transparency
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontSize: 22, // Slightly larger title font
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
    color: "#FFFFFF", // Ensures visibility on dark backgrounds
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%", // Ensures buttons align properly
  },
  toggleHistoryButton: {
    paddingVertical: 10,
    borderRadius: 6,
    marginBottom: 16,
    elevation: 2, // Adds slight shadow effect on the button
  },
  cancelButton: {
    borderWidth: 2,
    flex: 1,
    marginRight: 8,
    borderRadius: 8, // Rounded corners for consistent design
  },
  logoutSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  logoutButton: {
    borderWidth: 2,
    borderRadius: 8,
  },
});