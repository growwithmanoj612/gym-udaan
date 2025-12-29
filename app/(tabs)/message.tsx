import { Colors } from "@/constants/color";
import { PaginationPeriodReq } from "@/global/enums";
import { INotificationDetails } from "@/global/interfaces";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useNotificationStore } from "@/store/useNotificationStore";
import { Ionicons } from "@expo/vector-icons";
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
import MessageCard from "../component/message-card";
import MessageModal from "../component/message-card-modal";


export default function Messages() {

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const { notifications, isLoading, fetchPaginated, markAsRead, markAllAsRead, paginationPeriodReq, setPaginationPeriodReq, unreadCount } =
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
    fetchPaginated();
  }, [paginationPeriodReq]);

  const handleRefresh = () => {
    fetchPaginated();
  };

  const handleMarkAsRead = (id: number) => {
    markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handlePeriodChange = (period: PaginationPeriodReq) => {
    setPaginationPeriodReq(period);
    // fetchPaginated will be called via useEffect
  };

  const getPeriodLabel = (period: PaginationPeriodReq) => {
    switch (period) {
      case PaginationPeriodReq.RECENT_10_DATA:
        return 'Recent 10';
      case PaginationPeriodReq.PAST_3_DAYS:
        return 'Past 3 Days';
      case PaginationPeriodReq.PAST_7_DAYS:
        return 'Past 7 Days';
      case PaginationPeriodReq.PAST_15_DAYS:
        return 'Past 15 Days';
      case PaginationPeriodReq.PAST_30_DAYS:
        return 'Past 30 Days';
      case PaginationPeriodReq.ALL_TIME:
        return 'All Time';
      default:
        return period;
    }
  };



  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Animated.View
        entering={FadeInUp.springify()}
        style={[styles.header, { backgroundColor: colors.card }]}
      >
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Messages
        </Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllAsRead}>
            <Text style={[styles.markAllRead, { color: colors.primary }]}>
              Mark all read
            </Text>
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Period Filter */}
      <View style={[styles.filterContainer, { backgroundColor: colors.card }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {Object.values(PaginationPeriodReq).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.filterButton,
                { borderColor: colors.primary },
                paginationPeriodReq === period && { backgroundColor: colors.primary },
              ]}
              onPress={() => handlePeriodChange(period)}
              disabled={isLoading}
            >
              <Text style={[
                styles.filterText,
                { color: paginationPeriodReq === period ? 'white' : colors.text },
              ]}>
                {getPeriodLabel(period)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {isLoading && notifications.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : notifications.length === 0 ? (
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={styles.emptyContainer}
        >
          <Ionicons
            name="notifications-off-outline"
            size={80}
            color={colors.textTertiary}
          />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No Messages
          </Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            You don't have any messages yet
          </Text>
        </Animated.View>
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
            {notifications.map((notification, index) => (
              <MessageCard
                key={notification.id || index}
                notification={notification}
                onPress={openMessageModal}
              />
            ))}
          </View>
          {/* ================= MESSAGE MODAL ================= */}

          <MessageModal
            visible={isModalVisible}
            onClose={closeModal}
            selectedMessage={selectedMessage}
          />

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
    paddingHorizontal: 20,
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
  filterContainer: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterScroll: {
    paddingRight: 20,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
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
    backgroundColor: "#FFFFFF",
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
    color: "gray",
    marginTop: 8,
  },
});