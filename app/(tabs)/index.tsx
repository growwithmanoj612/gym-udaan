// app/(tabs)/index.tsx
import { Card } from "@/components/ui/card";
import { Colors } from "@/constants/color";
import { INotificationDetails } from "@/global/interfaces";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/store/useAuthStore";
import { useMembershipStore } from "@/store/useMembershipStore";
import { useNotificationStore } from "@/store/useNotificationStore";
 
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
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
  const colors = Colors[colorScheme ??  "light"];

  // for re-fetching on focus
    const isFocused = useIsFocused();

  // Stores
  const appUser = useAuthStore. use.appUser();
  const { notifications, unreadCount, isLoading, fetchPaginated,getUnreadCount ,markAsRead} = useNotificationStore();
  const { currentMembership, fetchCurrentMembership } = useMembershipStore();

  // Modal state
  const [selectedMessage, setSelectedMessage] =
    useState<INotificationDetails | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const openMessageModal = async(message: INotificationDetails) => {
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
  }, []);



  // Re-fetch notifications and unread count on focus
  useEffect(() => {
    fetchPaginated(); 
    getUnreadCount();
  }, [isFocused]);

 

  const quickActions = [
    {
      icon: "restaurant",
      title: "Diet Plan",
      color: "#10B981",
      route: "/(tabs)/diet-plans",
    },
    {
      icon: "checkmark-circle",
      title: "Check-in",
      color: "#3B82F6",
      route: "/(tabs)/attendance",
    },
  ];

  const getMessageIcon = (type: string, isRead: boolean) => {
    if (! isRead) return "mail-unread";
    
    switch (type) {
      case "INFO":
        return "information-circle";
      case "WARNING":
        return "warning";
      case "ALERT":
        return "alert-circle";
      case "PROMOTION":
        return "gift";
      case "REMINDER":
        return "time";
      default:
        return "mail-open";
    }
  };

  const getMessageColor = (priority: string, isRead: boolean) => {
    if (!  isRead) return colors.primary;
    
    switch (priority) {
      case "HIGH":
        return colors.error;
      case "NORMAL":
        return colors.info;
      case "LOW":
        return colors.textSecondary;
      default: 
        return colors.textSecondary;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View
          entering={FadeInUp. springify()}
          style={[styles.header, { backgroundColor: colors.card }]}
        >
          <View>
            <Text style={[styles.greeting, { color: colors. textSecondary }]}>
              Welcome back,
            </Text>
            <Text style={[styles.userName, { color: colors. text }]}>
              {appUser?. fullName?. split(" ")[0] || "Member"}!  👋
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.notificationButton,
              { backgroundColor: colors. backgroundSecondary },
            ]}
            onPress={() => router.push("/(tabs)/message")}
          >
            <Ionicons name="notifications" size={24} color={colors.text} />
            {unreadCount > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.error }]}>
                <Text style={styles.badgeText}>
                  {unreadCount > 9 ? "9+" :  unreadCount}
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
              <View style={{ flex:  1 }}>
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

        {/* Quick Actions */}
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={styles.section}
        >
          <Text style={[styles.sectionTitle, { color: colors. text }]}>
            Quick Actions
          </Text>
          <View style={styles.quickActionsGrid}>
            {quickActions. map((action, index) => (
              <Animated.View
                key={index}
                entering={FadeInRight.delay(250 + index * 50).springify()}
              >
                <TouchableOpacity
                  onPress={() => router.push(action.route as any)}
                  activeOpacity={0.7}
                >
                  <Card elevated style={styles.actionCard}>
                    <View
                      style={[
                        styles.actionIcon,
                        { backgroundColor:  `${action.color}15` },
                      ]}
                    >
                      <Ionicons
                        name={action.icon as any}
                        size={24}
                        color={action. color}
                      />
                    </View>
                    <Text style={[styles.actionTitle, { color: colors.text }]}>
                      {action. title}
                    </Text>
                  </Card>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Recent Messages */}
        <Animated. View
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
              <Text style={[styles.emptyText, { color: colors. textSecondary }]}>
                No messages yet
              </Text>
            </Card>
          ) : (
            notifications?.map((message, index) => (
              <AnimatedCard
                key={message?.id}
                entering={FadeInDown.delay(650 + index * 50).springify()}
                elevated
                style={[
                  styles.messageCard,
                  ! message?.isRead && {
                    backgroundColor: `${colors.primary}05`,
                    borderLeftWidth: 3,
                    borderLeftColor:  colors.primary,
                  },
                ]}
              >
                  <TouchableOpacity
                  onPress={() => openMessageModal(message)}

                  activeOpacity={0.7}
                >
                  <View style={styles.messageContent}>
                    <View
                      style={[
                        styles.messageIcon,
                        {
                          backgroundColor: `${getMessageColor(
                            message?.priority,
                            message?.isRead
                          )}15`,
                        },
                      ]}
                    >
                      <Ionicons
                        name={getMessageIcon(message?. type, message?.isRead) as any}
                        size={24}
                        color={getMessageColor(message?.priority, message?.isRead)}
                      />
                    </View>

                    <View style={styles. messageDetails}>
                      <View style={styles.messageTitleRow}>
                        <Text
                          style={[
                            styles.messageTitle,
                            { color: colors.text },
                            ! message?.isRead && styles.unreadTitle,
                          ]}
                          numberOfLines={1}
                        >
                          {message?.type}
                        </Text>
                        {!message?.isRead && (
                          <View
                            style={[
                              styles.unreadDot,
                              { backgroundColor:  colors.primary },
                            ]}
                          />
                        )}
                      </View>

                      <Text
                        style={[
                          styles.messageText,
                          { color: colors.textSecondary },
                        ]}
                        numberOfLines={2}
                      >
                        {message?.message}
                      </Text>

                      <View style={styles.messageFooter}>
                        <Text
                          style={[styles.messageTime, { color: colors.textTertiary }]}
                        >
                          {new Date(message?.createdDate).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute:  "2-digit",
                          })}
                        </Text>

                        {message?.isHighPriority && (
                          <View
                            style={[
                              styles.priorityBadge,
                              { backgroundColor: `${colors.error}15` },
                            ]}
                          >
                            <Ionicons name="alert-circle" size={12} color={colors.error} />
                            <Text style={[styles.priorityText, { color: colors.error }]}>
                              Urgent
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={colors. textTertiary}
                    />
                  </View>
                </TouchableOpacity>
              </AnimatedCard>
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
            style={styles. motivationGradient}
          >
            <Ionicons name="trophy" size={32} color={colors.primary} />
            <Text style={[styles.motivationTitle, { color: colors. text }]}>
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
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.card },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {selectedMessage?.type.replaceAll("_", " ")}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <Text
                style={[
                  styles.modalMessage,
                  { color: colors.textSecondary },
                ]}
              >
                {selectedMessage?.message}
              </Text>

              <Text
                style={[
                  styles.modalTime,
                  { color: colors.textTertiary },
                ]}
              >
                {selectedMessage &&
                  new Date(selectedMessage.createdDate).toLocaleString()}
              </Text>
            </ScrollView>
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
  greeting:  {
    fontSize: 14,
    marginBottom: 4,
  },
  userName:  {
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
    top:  6,
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
    fontSize:  10,
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
  expiryRow:  {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  expiryText: {
    fontSize:  12,
    color: "rgba(255,255,255,0.9)",
  },
  renewButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor:  "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  renewText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  section:  {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent:  "space-between",
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
    width:  8,
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
    flexDirection:  "row",
    alignItems:  "center",
    justifyContent: "space-between",
  },
  messageTime:  {
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
});