 
import { Card } from "@/components/ui/card";
import { Colors } from "@/constants/color";
import { INotificationDetails } from "@/global/interfaces";
import { useColorScheme } from "@/hooks/use-color-scheme"; 
import { useNotificationStore } from "@/store/useNotificationStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

const AnimatedCard = Animated.createAnimatedComponent(Card);

export default function DietPlan() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const { dietPlans, isLoading, getDietPlansNoti, markAsRead } =
    useNotificationStore();


      // Modal state
      const [selectedMessage, setSelectedMessage] =
        useState<INotificationDetails | null>(null);
      const [isModalVisible, setIsModalVisible] = useState(false);
      const openMessageModal = (message: INotificationDetails) => {
        setSelectedMessage(message);
        setIsModalVisible(true);
    
       
        if (!message.isRead) {
          markAsRead(message.id);
        }
      };
      const closeModal = () => {
        setIsModalVisible(false);
        setSelectedMessage(null);
      };
    

  useEffect(() => {
    getDietPlansNoti();
  }, []);

  const handleRefresh = () => {
    getDietPlansNoti();
  };

  const handleMarkAsRead = (id: number) => {
    markAsRead(id);
  };

  

  const getNotificationIcon = (type: string) => {
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
        return "dietPlans";
    }
  };

  const getNotificationColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return colors.error;
      case "NORMAL":
        return colors.primary;
      case "LOW": 
        return colors.textSecondary;
      default: 
        return colors.primary;
    }
  };

  const unreadNotifications = dietPlans.filter((n) => !n.isRead);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Animated.View
        entering={FadeInUp.springify()}
        style={[styles.header, { backgroundColor: colors.card }]}
      >
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Diet Plans
        </Text>
       
      </Animated.View>

      {isLoading && dietPlans.length === 0 ? (
        <View style={styles. loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : dietPlans.length === 0 ? (
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={styles.emptyContainer}
        >
          <Ionicons
            name="dietPlans-off-outline"
            size={80}
            color={colors.textTertiary}
          />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No Diet Plans
          </Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            You don't have any diet plans yet
          </Text>
        </Animated. View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        >
          <View style={styles.section}>
            {dietPlans.map((notification, index) => (
              <AnimatedCard
                key={notification.id}
                entering={FadeInDown.delay(100 + index * 30).springify()}
                elevated
                style={[
                  styles.notificationCard,
                  ! notification.isRead && {
                    backgroundColor: `${colors.primary}05`,
                  },
                ]}
              >
                <TouchableOpacity
                  onPress={() => openMessageModal(notification)}
                  activeOpacity={0.7}
                >
                  <View style={styles.notificationContent}>
                    <View
                      style={[
                        styles.iconContainer,
                        {
                          backgroundColor: `${getNotificationColor(
                            notification.priority
                          )}15`,
                        },
                      ]}
                    >
                      <Ionicons
                        name={getNotificationIcon(notification.type) as any}
                        size={24}
                        color={getNotificationColor(notification.priority)}
                      />
                    </View>

                    <View style={styles. textContainer}>
                      <View style={styles.headerRow}>
                        <Text
                          style={[
                            styles.title,
                            { color: colors.text },
                            ! notification.isRead && styles.unreadTitle,
                          ]}
                          numberOfLines={1}
                        >
                          {notification.type}
                        </Text>
                        {!notification.isRead && (
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
                          styles.message,
                          { color: colors.textSecondary },
                        ]}
                        numberOfLines={2}
                      >
                        {notification.message}
                      </Text>

                      <View style={styles.footer}>
                        <Text
                          style={[styles.date, { color: colors. textTertiary }]}
                        >
                          {new Date(notification.createdDate).toLocaleString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute:  "2-digit",
                            }
                          )}
                        </Text>

                        {notification.isHighPriority && (
                          <View
                            style={[
                              styles.priorityBadge,
                              { backgroundColor: `${colors.error}20` },
                            ]}
                          >
                            <Text
                              style={[
                                styles.priorityText,
                                { color: colors.error },
                              ]}
                            >
                              High Priority
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              </AnimatedCard>
            ))}
          </View>
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
        </ScrollView>
      )}
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal:  20,
    paddingTop: 60,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  markAllRead: {
    fontSize: 14,
    fontWeight: "600",
  },
  loadingContainer: {
    flex:  1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },
  section: {
    padding: 20,
  },
  notificationCard: {
    marginBottom: 12,
    padding: 16,
  },
  notificationContent: {
    flexDirection: "row",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  title:  {
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
  message:  {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  date: {
    fontSize: 11,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "600",
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