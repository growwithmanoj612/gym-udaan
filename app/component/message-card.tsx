import { Card } from "@/components/ui/card";
import { Colors } from "@/constants/color";
import { MessageType } from "@/global/enums";
import { INotificationDetails } from "@/global/interfaces";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface MessageCardProps {
  notification: INotificationDetails;
  onPress: (notification: INotificationDetails) => void;
}

export default function MessageCard({ notification, onPress }: MessageCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const getNotificationIcon = (type: MessageType) => {
    switch (type) {
      case "BIRTHDAY_WISH":
        return "gift";
      case "ANNIVERSARY":
        return "heart";
      case "MEMBERSHIP_EXPIRY":
        return "time";
      case "MEMBERSHIP_EXPIRED":
        return "alert-circle";
      case "STOCK_ALERT":
        return "warning";
      case "WELCOME":
        return "person-add";
      case "ANNOUNCEMENT":
        return "megaphone";
      case "HOLIDAY":
        return "sunny";
      case "OFFER":
        return "pricetag";
      case "OCCASION":
        return "calendar";
      case "THANK_YOU_FOR_PURCHASE":
        return "checkmark-circle";
      case "DAY_END_CLOSING":
        return "moon";
      case "ALERT":
        return "alert-circle";
      case "DAILY_REPORT":
        return "document-text";
      case "QR_CODE":
        return "qr-code";
      case "MOTIVATIONAL_FOLLOWUP":
        return "fitness";
      case "DIET_PLAN":
        return "restaurant";
      case "FACILITY_EXPIRED":
        return "alert-circle";
      default:
        return "notifications";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "BIRTHDAY_WISH":
        return "#FF69B4"; // Pink
      case "ANNIVERSARY":
        return "#FF1493"; // Deep pink
      case "MEMBERSHIP_EXPIRY":
        return "#FFA500"; // Orange
      case "MEMBERSHIP_EXPIRED":
        return colors.error;
      case "STOCK_ALERT":
        return "#FFA500";
      case "WELCOME":
        return "#10B981"; // Green
      case "ANNOUNCEMENT":
        return colors.primary;
      case "HOLIDAY":
        return "#FFD700"; // Gold
      case "OFFER":
        return "#8B5CF6"; // Purple
      case "OCCASION":
        return "#FF6347"; // Tomato
      case "THANK_YOU_FOR_PURCHASE":
        return "#32CD32"; // Lime green
      case "DAY_END_CLOSING":
        return "#4682B4"; // Steel blue
      case "ALERT":
        return colors.error;
      case "DAILY_REPORT":
        return "#708090"; // Slate gray
      case "QR_CODE":
        return "#000000"; // Black
      case "MOTIVATIONAL_FOLLOWUP":
        return "#FF4500"; // Orange red
      case "DIET_PLAN":
        return "#228B22"; // Forest green
      case "FACILITY_EXPIRED":
        return colors.error;
      default:
        return colors.primary;
    }
  };

  return (
    <Card
      elevated
      style={[
        styles.notificationCard,
        !notification.isRead && {
          backgroundColor: `${colors.primary}08`,
          borderLeftWidth: 4,
          borderLeftColor: colors.primary,
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => onPress(notification)}
        activeOpacity={0.7}
      >
        <View style={styles.notificationContent}>
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: `${getTypeColor(notification.type)}20`,
              },
            ]}
          >
            <Ionicons
              name={getNotificationIcon(notification.type) as any}
              size={24}
              color={getTypeColor(notification.type)}
            />
          </View>

          <View style={styles.textContainer}>
            <View style={styles.headerRow}>
              <Text
                style={[
                  styles.title,
                  { color: colors.text },
                  !notification.isRead && styles.unreadTitle,
                ]}
                numberOfLines={1}
              >
                {notification.type.replace(/_/g, ' ')}
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
              numberOfLines={3}
            >
              {notification.message}
            </Text>

            <View style={styles.footer}>
              <Text
                style={[styles.date, { color: colors.textTertiary }]}
              >
                {new Date(notification.createdDate).toLocaleString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  notificationCard: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
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
  title: {
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
  message: {
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
});