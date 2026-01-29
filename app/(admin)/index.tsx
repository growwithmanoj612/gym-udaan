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
  Linking,
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
import MessageModal from "../component/message-card-modal";
import MessageCard from "../component/message-card";

const AnimatedCard = Animated.createAnimatedComponent(Card);
const softwareLink = 'https://www.gymudaan.com/tenant/add';

export default function Home() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const isFocused = useIsFocused();

  // Stores
  const appUser = useAuthStore((state) => state.appUser);
  const checkAuth = useAuthStore((state) => state.checkAuth);
 
  const { notifications, unreadCount, isLoading, fetchPaginated, getUnreadCount, markAsRead } = useNotificationStoreOwner();
  const { biometrics, getBiometrics, doorUnlock } = useBiometricStore();

  // Modal state
  const [selectedMessage, setSelectedMessage] = useState<INotificationDetails | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

 

  const openMessageModal = async (message: INotificationDetails) => {
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
    checkAuth();
  }, []);

  // Re-fetch notifications and unread count on focus
  useEffect(() => {
    fetchPaginated(); 
    getUnreadCount();
  }, [isFocused]);

 

  // Handle Manage Business button press - opens link in browser
  const handleManageBusiness = async () => {
    try {
      const supported = await Linking.canOpenURL(softwareLink);
      if (supported) {
        await Linking.openURL(softwareLink);
      } else {
        Alert.alert("Error", "Unable to open the link. Please try again later.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to open the browser.");
    }
  };

  const handleUnlockDoor = async () => {
    if (!biometrics || biometrics.length === 0) {
      Alert.alert("No Biometric Device", "No biometric devices available for unlocking.");
      return;
    }
 
    try {
      await doorUnlock(biometrics[0].deviceSN);
      // Optionally show a success message via Alert or another state
    } catch (error) {
      Alert.alert("Unlock Failed", "Failed to send unlock request.");
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
            
            {/* Button Row for Unlock Door and Manage Business */}
            <View style={styles.buttonRow}>
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

              {/* Manage Business Button */}
              <TouchableOpacity
                style={styles.manageBusinessButton}
                onPress={handleManageBusiness}
                activeOpacity={0.8}
              >
                <Ionicons name="business" size={20} color="#FFFFFF" />
                <Text style={styles.manageBusinessButtonText}>Manage Business</Text>
              </TouchableOpacity>
            </View>
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
            <TouchableOpacity onPress={() => router.push("/(admin)/message")}>
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
            notifications
              ?.slice(0, 10)
              ?.map((message, index) => (
                <MessageCard
                  key={message.id || index}
                  notification={message}
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

    

      {/* Message Modal */}
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
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  unlockButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10B981", // Green color
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  unlockButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  manageBusinessButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6366F1", // Indigo/Purple color
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  manageBusinessButtonText: {
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