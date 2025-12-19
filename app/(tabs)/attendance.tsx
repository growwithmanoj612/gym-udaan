import { Card } from "@/components/ui/card";
import { Colors } from "@/constants/color";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAttendanceStore } from "@/store/useAttendanceStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { IAttendanceDetails } from "@/global/interfaces";

const AnimatedCard = Animated.createAnimatedComponent(Card);

export default function Attendance() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Zustand store hooks
  const { search, attendances } = useAttendanceStore();

  // State for month selection
  const [selectedYearMonth, setSelectedYearMonth] = useState(format(new Date(), "yyyy-MM")); // Defaults to current month

  useEffect(() => {
    // Fetch attendance data for the selected month
    search(selectedYearMonth);
  }, [selectedYearMonth]);
  

   // Helper function to calculate the number of days in a month
  const getDaysInMonth = (month: string) => {
    const date = parseISO(`${month}-01`); // Parse input month string like "2025-12"
    const startDate = startOfMonth(date);
    const endDate = endOfMonth(date);

    return endDate.getDate(); // Total days in the month
  };
  // Calculate attendance stats
  const calculateStats = (attendanceList: IAttendanceDetails[]) => {
    const daysInMonth = getDaysInMonth(selectedYearMonth);
    const presentDays = attendanceList.filter((a) => a.checkInTime).length;
    const absentDays = daysInMonth - presentDays;
    const attendancePercentage = (presentDays / daysInMonth) * 100;

    return {
      totalDays: daysInMonth,
      presentDays,
      absentDays,
      attendancePercentage: isNaN(attendancePercentage) ? 0 : attendancePercentage.toFixed(2),
    };
  };

  const stats = calculateStats(attendances);

 

  const getShiftColor = (shiftType:any) => {
    switch (shiftType) {
      case "MORNING":
        return "#F59E0B";
      case "EVENING":
        return "#8B5CF6";
      default:
        return colors.primary;
    }
  };
  // Helper function to convert time to 12-hour format with AM/PM
  const formatToStandardTime = (time: string | null) => {
    if (!time) return "Not Available";
    const [hour, minute] = time.split(":");
    const hourInt = parseInt(hour, 10);
    const standardHour = hourInt % 12 || 12; // Converts 13 -> 1, etc.; handles 12 as is
    const amPm = hourInt >= 12 ? "PM" : "AM";
    return `${standardHour}:${minute} ${amPm}`;
  };
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Animated.View
        entering={FadeInUp.springify()}
        style={[styles.header, { backgroundColor: colors.card }]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Attendance History
        </Text>
        <View style={{ width: 40 }} />
      </Animated.View>

      {/* Month Selector */}
      <View style={styles.monthSelectorContainer}>
        <TouchableOpacity
          onPress={() =>
            setSelectedYearMonth(
              format(
                new Date(new Date(selectedYearMonth).setMonth(new Date(selectedYearMonth).getMonth() - 1)),
                "yyyy-MM"
              )
            )
          }
          style={styles.arrowButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.selectedYearMonth, { color: colors.text }]}>
          {format(new Date(`${selectedYearMonth}-01`), "MMMM yyyy")}
        </Text>
        <TouchableOpacity
          onPress={() =>
            setSelectedYearMonth(
              format(
                new Date(new Date(selectedYearMonth).setMonth(new Date(selectedYearMonth).getMonth() + 1)),
                "yyyy-MM"
              )
            )
          }
          style={styles.arrowButton}
        >
          <Ionicons name="arrow-forward" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Stats Overview */}
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={styles.statsContainer}
        >
          <Card gradient style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="calendar" size={32} color="#FFFFFF" />
                <Text style={styles.statValue}>{stats.totalDays}</Text>
                <Text style={styles.statLabel}>Total Days</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="checkmark-circle" size={32} color="#FFFFFF" />
                <Text style={styles.statValue}>{stats.presentDays}</Text>
                <Text style={styles.statLabel}>Present Days</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="close-circle" size={32} color="#FFFFFF" />
                <Text style={styles.statValue}>{stats.absentDays}</Text>
                <Text style={styles.statLabel}>Absent Days</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="analytics-circle" size={32} color="#FFFFFF" />
                <Text style={styles.statValue}>{stats.attendancePercentage}%</Text>
                <Text style={styles.statLabel}>Attendance %</Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Attendance List */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recent Check-ins
          </Text>

          {attendances.map((record, index) => (
            <AnimatedCard
              key={record.id}
              entering={FadeInDown.delay(200 + index * 50).springify()}
              elevated
              style={styles.attendanceCard}
            >
              <View style={styles.dateSection}>
                <View style={styles.dateIcon}>
                  <Text style={styles.dateDay}>
                    {new Date(record?.createdDate?.split('T')[0])?.getDate()}
                  </Text>
                  <Text style={styles.dateMonth}>
                    {new Date(record?.createdDate?.split('T')[0])?.toLocaleDateString("en-US", {
                      month: "short",
                    })}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.recordDate, { color: colors.text }]}>
                    {new Date(record?.createdDate?.split('T')[0])?.toLocaleDateString("en-US", {
                      weekday: "long",
                    })}
                  </Text>
               
                </View>
             
              </View>

              <View style={styles.timeRow}>
                <View style={styles.timeItem}>
                  <Ionicons name="log-in" size={16} color={colors.success} />
                  <Text
                    style={[styles.timeLabel, { color: colors.textSecondary }]}
                  >
                    Check In
                  </Text>
                  <Text style={[styles.timeValue, { color: colors.text }]}>

  {formatToStandardTime(
                      record?.checkInTime?.split("T")[1] || null
                    )}

                    
                  </Text>
                </View>
                <View style={styles.timeSeparator} />
                <View style={styles.timeItem}>
                  <Ionicons name="log-out" size={16} color={colors.error} />
                  <Text
                    style={[styles.timeLabel, { color: colors.textSecondary }]}
                  >
                    Check Out
                  </Text>
                  <Text style={[styles.timeValue, { color: colors.text }]}>
                    {formatToStandardTime(
                      record?.checkOutTime?.split("T")[1] || null
                    )}
                  </Text>
                </View>
              </View>
            </AnimatedCard>
          ))}
        </View>
      </ScrollView>
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
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  statsContainer: {
    padding: 20,
  },
  statsCard: {
    padding: 20,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  section: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  attendanceCard: {
    padding: 16,
    marginBottom: 12,
  },
  dateSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  dateIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#FF6B3515",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  dateDay: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF6B35",
  },
  dateMonth: {
    fontSize: 11,
    color: "#FF6B35",
    textTransform: "uppercase",
  },
  recordDate: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  recordNepDate: {
    fontSize: 12,
  },
  shiftBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  shiftText: {
    fontSize: 11,
    fontWeight: "600",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  timeLabel: {
    fontSize: 11,
  },
  timeValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  timeSeparator: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(0,0,0,0.1)",
    marginHorizontal: 16,
  },
  monthSelectorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  arrowButton: {
    padding: 10,
  },
  selectedYearMonth: {
    fontSize: 16,
    fontWeight: "bold",
  },
});