import { Card } from "@/components/ui/card";
import { Colors } from "@/constants/color";
import { INotificationDetails } from "@/global/interfaces";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/store/useAuthStore";
import { useBiometricStore } from "@/store/useBiometricStore"; 
import { useNotificationStoreOwner } from "@/store/useNotificationStoreForOwner";
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
  Alert,
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
     const isFocused = useIsFocused();

  // Stores
  const appUser = useAuthStore((state) => state.appUser);
  const { notifications, unreadCount, isLoading, fetchPaginated, getUnreadCount ,markAsRead} = useNotificationStoreOwner();
  const { biometrics, getBiometrics, doorUnlock } = useBiometricStore();

  // Modal state
  const [selectedMessage, setSelectedMessage] = useState<INotificationDetails | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Unlock States
  const [unlockCountdown, setUnlockCountdown] = useState<number | null>(null);
  const [showUnlockOverlay, setShowUnlockOverlay] = useState(false);
  const [unlockMessage, setUnlockMessage] = useState<string>("");

 const openMessageModal = async(message: INotificationDetails) => {
    setSelectedMessage(message);
    setIsModalVisible(true);
 
    if (!message.isRead) {
     await markAsRead(message.id);
    }
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedMessage(null);
  };

  useEffect(() => {
 
    getBiometrics();
  }, []);


  // Re-fetch notifications and unread count on focus
  useEffect(() => {
    fetchPaginated(); 
    getUnreadCount();
  }, [isFocused]);

  // Unlock Countdown Effect
  useEffect(() => {
    let timer: number;
    if (unlockCountdown !== null && unlockCountdown > 0) {
      timer = setTimeout(() => setUnlockCountdown(unlockCountdown - 1), 1000);
    } else if (unlockCountdown === 0) {
      setUnlockMessage("Door unlocked!");
      setTimeout(() => {
        setShowUnlockOverlay(false);
        setUnlockCountdown(null);
        setUnlockMessage("");
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [unlockCountdown]);

  const getMessageIcon = (type: string, isRead: boolean) => {
    if (!isRead) return "mail-unread";
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
    if (!isRead) return colors.primary;
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

  const handleUnlockDoor = async () => {
    if (!biometrics || biometrics.length === 0) {
      Alert.alert("No Biometric Device", "No biometric devices available for unlocking.");
      return;
    }
    setShowUnlockOverlay(true);
    setUnlockCountdown(6);
    setUnlockMessage("Unlocking...");
    try {
      await doorUnlock(biometrics[0].deviceSN);
      // Optionally show a success message via Alert or another state
    } catch (error) {
      Alert.alert("Unlock Failed", "Failed to send unlock request.");
      setShowUnlockOverlay(false);
      setUnlockCountdown(null);
      setUnlockMessage("");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View
          entering={FadeInUp.springify()}
          style={[styles.header, { backgroundColor: colors.card }]}
        >
          <View style={styles.headerLeft}>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              Welcome back,
            </Text>
            <Text style={[styles.userName, { color: colors.text }]}>
              {appUser?.fullName?.split(" ")[0] || "Member"}! 👋

            
            </Text>
            {/* Unlock Door Button */}
            {biometrics && biometrics.length > 0 && (
              <TouchableOpacity
                style={styles.unlockButton}
                onPress={handleUnlockDoor}
                activeOpacity={0.8}
              >
                <Ionicons name="key" size={20} color="#FFFFFF" />
                <Text style={styles.unlockButtonText}>Unlock Door</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[styles.notificationButton, { backgroundColor: colors.backgroundSecondary }]}
            onPress={() => router.push("/(admin)/message")}
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
          ) : notifications.length === 0 ? (
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
            notifications.map((message, index) => (
              <AnimatedCard
                key={message?.id}
                entering={FadeInDown.delay(650 + index * 50).springify()}
                elevated
                style={[
                  styles.messageCard,
                  !message?.isRead && {
                    backgroundColor: `${colors.primary}05`,
                    borderLeftWidth: 3,
                    borderLeftColor: colors.primary,
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
                        name={getMessageIcon(message?.type, message?.isRead) as any}
                        size={24}
                        color={getMessageColor(message?.priority, message?.isRead)}
                      />
                    </View>

                    <View style={styles.messageDetails}>
                      <View style={styles.messageTitleRow}>
                        <Text
                          style={[
                            styles.messageTitle,
                            { color: colors.text },
                            !message?.isRead && styles.unreadTitle,
                          ]}
                          numberOfLines={1}
                        >
                          {message?.type}
                        </Text>
                        {!message?.isRead && (
                          <View
                            style={[
                              styles.unreadDot,
                              { backgroundColor: colors.primary },
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
                            minute: "2-digit",
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
                      color={colors.textTertiary}
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
            style={styles.motivationGradient}
          >
            <Ionicons name="trophy" size={32} color={colors.primary} />
            <Text style={[styles.motivationTitle, { color: colors.text }]}>
              Keep Going! 💪
            </Text>
            <Text
              style={[styles.motivationText, { color: colors.textSecondary }]}
            >
              Manage Your Business with ease
            </Text>
          </LinearGradient>
        </AnimatedCard>
      </ScrollView>

      {/* Unlock Overlay Modal */}
      <Modal
        visible={showUnlockOverlay}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.unlockOverlay}>
          <View style={[styles.unlockModal, { backgroundColor: colors.card }]}>
            <Ionicons name="key" size={64} color={colors.primary} />
            <Text style={[styles.unlockMessage, { color: colors.text }]}>
              {unlockMessage}
            </Text>
            {unlockCountdown !== null && unlockCountdown > 0 && (
              <Text style={[styles.unlockCountdown, { color: colors.primary }]}>
                {unlockCountdown}
              </Text>
            )}
          </View>
        </View>
      </Modal>

      {/* Message Modal */}
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
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
  },
  unlockButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10B981", // Green color
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  unlockButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
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
  unlockOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  unlockModal: {
    width: "80%",
    padding: 40,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  unlockMessage: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    textAlign: "center",
  },
  unlockCountdown: {
    fontSize: 48,
    fontWeight: "bold",
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    borderRadius: 12,
    padding: 20,
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
    marginTop: 8,
  },
});