// app/(tabs)/index.tsx
import { Card } from "@/components/ui/card";
import { Colors } from "@/constants/color";
import { INotificationDetails } from "@/global/interfaces";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/store/useAuthStore";
import { useMembershipStore } from "@/store/useMembershipStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useWorkoutStore } from "@/store/useWorkoutStore";

import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
} from "react-native-reanimated";
import MessageCard from "../component/message-card";
import MessageModal from "../component/message-card-modal";

const AnimatedCard = Animated.createAnimatedComponent(Card);
const { width } = Dimensions.get("window");

export default function Home() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // for re-fetching on focus
  const isFocused = useIsFocused();

  // Stores
  const appUser = useAuthStore((state) => state.appUser);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const selectedTenantDetails = useAuthStore((state) => state.selectedTenantDetails);
  const { notifications, unreadCount, isLoading, fetchPaginated, getUnreadCount, markAsRead } = useNotificationStore();
  const { currentMembership, fetchCurrentMembership } = useMembershipStore();
  const { today, isTodayLoading, fetchToday, markDone } = useWorkoutStore();

  // Modal state
  const [selectedMessage, setSelectedMessage] =
    useState<INotificationDetails | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const openMessageModal = async (message: INotificationDetails) => {
    setSelectedMessage(message);
    setIsModalVisible(true);

    // Optional: mark as read
    if (!message.isRead) {
      await markAsRead(message.id);
    }
  };
  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedMessage(null);
  };


  // Fetch current membership on mount
  useEffect(() => {

    fetchCurrentMembership();
    checkAuth()
  }, []);



  // Re-fetch notifications and unread count on focus
  useEffect(() => {
    fetchPaginated();
    getUnreadCount();
    fetchToday();
  }, [isFocused]);

  const handleCallGym = () => {
    // priority is for customercare if not than owner
    const phoneNumber = selectedTenantDetails?.customerCareNumber || selectedTenantDetails?.businessPhone;

    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    } else {
      // Fallback if no phone number available
      alert("No phone number available for this gym");
    }
  };

  const quickActions = [
    {
      icon: "call",
      title: "Call Gym",
      color: "#10B981",
      onPress: handleCallGym,
    },
    {
      icon: "barbell",
      title: "Gym Plans",
      color: "#3B82F6",
      route: "/services",
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
              {appUser?.fullName?.split(" ")[0] || "Member"}!  👋
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.notificationButton,
              { backgroundColor: colors.backgroundSecondary },
            ]}
            onPress={() => router.push("/(tabs)/message")}
          >
            <Ionicons name="notifications" size={24} color={colors.text} />
            {unreadCount > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.error }]}>
                <Text style={styles.badgeText}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Active Membership Card */}
        {currentMembership && (
          <AnimatedCard
            entering={FadeInDown.delay(100).springify()}
            gradient
            style={styles.membershipCard}
          >
            <View style={styles.membershipContent}>
              <View style={{ flex: 1 }}>
                <Text style={styles.membershipLabel}>{currentMembership?.memberShipStatus} Membership</Text>
                <Text style={styles.membershipPlan}>
                  {currentMembership.planName}
                </Text>
                <View style={styles.expiryRow}>
                  <Ionicons
                    name="time"
                    size={14}
                    color="rgba(255,255,255,0.9)"
                  />
                  <Text style={styles.expiryText}>
                    {currentMembership.remainingDays} days remaining
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.renewButton}
                onPress={() => router.push("/(tabs)/profile")}
              >
                <Text style={styles.renewText}>View Details</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </AnimatedCard>
        )}

        {/* Today's Workout */}
        <Animated.View
          entering={FadeInDown.delay(150).springify()}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Today's Workout
            </Text>
            <TouchableOpacity onPress={() => router.push("/workout-details")}>
              <Text style={[styles.viewAll, { color: colors.primary }]}>
                View Details
              </Text>
            </TouchableOpacity>
          </View>

          {isTodayLoading ? (
            <Card elevated style={styles.loadingCard}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Loading workout...
              </Text>
            </Card>
          ) : !today || today.items.length === 0 ? (
            <Card elevated style={styles.emptyCard}>
              <Ionicons
                name="barbell-outline"
                size={40}
                color={colors.textTertiary}
              />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No workout scheduled for today
              </Text>
              <TouchableOpacity
                style={[styles.viewDetailsButton, { backgroundColor: colors.primary }]}
                onPress={() => router.push("/(tabs)/workout-history")}
              >
                <Text style={styles.viewDetailsButtonText}>Manage Workouts</Text>
              </TouchableOpacity>
            </Card>
          ) : (
            <>
              <AnimatedCard
                entering={FadeInDown.delay(200).springify()}
                elevated
                style={styles.workoutCard}
              >
                <View style={styles.workoutHeader}>
                  <View style={[styles.workoutIconBadge, { backgroundColor: colors.primary + '15' }]}>
                    <Ionicons name="barbell" size={24} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.workoutTitle, { color: colors.text }]}>
                      {today.planTitle}
                    </Text>
                    <Text style={[styles.workoutSubtitle, { color: colors.textSecondary }]}>
                      {today.items.length} exercise{today.items.length !== 1 ? 's' : ''} • {today.items.filter(i => i.completed).length} completed
                    </Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View style={[styles.progressBarContainer, { backgroundColor: colors.backgroundSecondary }]}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        backgroundColor: colors.primary,
                        width: `${(today.items.filter(i => i.completed).length / today.items.length) * 100}%`,
                      },
                    ]}
                  />
                </View>

                {/* Exercise List (First 3) */}
                <View style={styles.exerciseList}>
                  {today.items.slice(0, 3).map((item, idx) => (
                    <TouchableOpacity
                      key={item.subTitleId}
                      style={styles.exerciseItem}
                      onPress={async () => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        await markDone({
                          subTitleId: item.subTitleId,
                          completed: !item.completed,
                        });
                      }}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          {
                            backgroundColor: item.completed ? colors.primary : colors.backgroundSecondary,
                            borderColor: item.completed ? colors.primary : colors.border,
                          },
                        ]}
                      >
                        {item.completed && (
                          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.exerciseName,
                          {
                            color: item.completed ? colors.textSecondary : colors.text,
                            textDecorationLine: item.completed ? 'line-through' : 'none',
                          },
                        ]}
                      >
                        {item.subTitle}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  {today.items.length > 3 && (
                    <TouchableOpacity
                      style={styles.viewMoreButton}
                      onPress={() => router.push("/workout-details")}
                    >
                      <Text style={[styles.viewMoreText, { color: colors.primary }]}>
                        +{today.items.length - 3} more exercises
                      </Text>
                      <Ionicons name="arrow-forward" size={16} color={colors.primary} />
                    </TouchableOpacity>
                  )}
                </View>
              </AnimatedCard>
            </>
          )}
        </Animated.View>

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
                  onPress={() => action.onPress ? action.onPress() : router.push(action.route as any)}
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

        {/* Recent Messages */}
        <Animated.View
          entering={FadeInDown.delay(600).springify()}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Recent Messages
            </Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/message")}>
              <Text style={[styles.viewAll, { color: colors.primary }]}>
                View All
              </Text>
            </TouchableOpacity>
          </View>

          {isLoading && notifications.length === 0 ? (
            <Card elevated style={styles.loadingCard}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Loading messages...
              </Text>
            </Card>
          ) : notifications?.length === 0 ? (
            <Card elevated style={styles.emptyCard}>
              <Ionicons
                name="chatbubbles-outline"
                size={40}
                color={colors.textTertiary}
              />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No messages yet
              </Text>
            </Card>
          ) : (
            notifications
              ?.slice(0, 10)
              ?.map((notification, index) => (
                <MessageCard
                  key={notification.id || index}
                  notification={notification}
                  onPress={openMessageModal}
                />
              ))
          )}
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
              Keep Going!  💪
            </Text>
            <Text
              style={[styles.motivationText, { color: colors.textSecondary }]}
            >
              You are doing great!  Stay consistent and you will reach your
              goals.
            </Text>
          </LinearGradient>
        </AnimatedCard>
      </ScrollView>
      {/* ================= MESSAGE MODAL ================= */}
      <MessageModal
        visible={isModalVisible}
        onClose={closeModal}
        selectedMessage={selectedMessage}
      />

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
    top: 6,
    right: 6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#FFFFFF",
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
  loadingCard: {
    padding: 40,
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  emptyCard: {
    padding: 40,
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
  },
  messageCard: {
    padding: 16,
    marginBottom: 12,
  },
  messageContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  messageIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  messageDetails: {
    flex: 1,
  },
  messageTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  messageTitle: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  unreadTitle: {
    fontWeight: "700",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  messageTime: {
    fontSize: 11,
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
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


  // Add these styles for the Modal component to the existing `styles` object.
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)", // Semi-transparent black background
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    borderRadius: 12,
    padding: 20,
    backgroundColor: "#FFFFFF", // Replace with colors.card if dynamic styling is necessary
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalMessage: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  modalTime: {
    fontSize: 12,
    color: "gray", // Replace with `colors.textTertiary` if dynamic styling is necessary
    marginTop: 8,
  },

  // Workout section styles
  workoutCard: {
    padding: 16,
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  workoutIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workoutTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  workoutSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  progressBarContainer: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  exerciseList: {
    gap: 12,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseName: {
    fontSize: 14,
    flex: 1,
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    marginTop: 4,
  },
  viewMoreText: {
    fontSize: 13,
    fontWeight: '600',
  },
  viewDetailsButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewDetailsButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});