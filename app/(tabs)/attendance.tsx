import { Card } from "@/components/ui/card";
import { Colors } from "@/constants/color";
import { IAttendanceDetails } from "@/global/interfaces";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAttendanceStore } from "@/store/useAttendanceStore";
import { Ionicons } from "@expo/vector-icons";
import { endOfMonth, format, parseISO } from "date-fns";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

const AnimatedCard = Animated.createAnimatedComponent(Card);

export default function Attendance() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const { search, attendances, isLoading } = useAttendanceStore();
  const [selectedYearMonth, setSelectedYearMonth] = useState(format(new Date(), "yyyy-MM"));

  useEffect(() => {
    search(selectedYearMonth);
  }, [selectedYearMonth]);

  const handlePrevMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const prev = new Date(selectedYearMonth);
    prev.setMonth(prev.getMonth() - 1);
    setSelectedYearMonth(format(prev, "yyyy-MM"));
  };

  const handleNextMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = new Date(selectedYearMonth);
    next.setMonth(next.getMonth() + 1);
    setSelectedYearMonth(format(next, "yyyy-MM"));
  };

  const getDaysInMonth = (month: string) => {
    const date = parseISO(`${month}-01`);
    return endOfMonth(date).getDate();
  };

  const calculateStats = (attendanceList: IAttendanceDetails[]) => {
    const daysInMonth = getDaysInMonth(selectedYearMonth);
    const presentDays = attendanceList.filter((a) => a.checkInTime).length;
    const absentDays = daysInMonth - presentDays;
    const attendancePercentage = (presentDays / daysInMonth) * 100;
    const isCurrentMonth = selectedYearMonth === format(new Date(), "yyyy-MM");

    let motivationMessage = "";
    let motivationIcon: any = "star";
    if (attendancePercentage >= 90) {
      motivationMessage = "Excellent! Keep it up! 💪";
      motivationIcon = "trophy";
    } else if (attendancePercentage >= 75) {
      motivationMessage = "Great progress! 🔥";
      motivationIcon = "flame";
    } else if (attendancePercentage >= 60) {
      motivationMessage = "Good! Keep pushing! 👍";
      motivationIcon = "thumbs-up";
    } else if (attendancePercentage >= 40) {
      motivationMessage = "You can do better! 💪";
      motivationIcon = "fitness";
    } else {
      motivationMessage = "Let's get back on track! 🎯";
      motivationIcon = "rocket";
    }

    return {
      totalDays: daysInMonth,
      presentDays,
      absentDays,
      attendancePercentage: isNaN(attendancePercentage) ? 0 : Number(attendancePercentage.toFixed(1)),
      isCurrentMonth,
      motivationMessage,
      motivationIcon,
    };
  };

  const stats = calculateStats(attendances);

  const formatToStandardTime = (time: string | null) => {
    if (!time) return "--:--";
    const [hour, minute] = time.split(":");
    const hourInt = parseInt(hour, 10);
    const standardHour = hourInt % 12 || 12;
    const amPm = hourInt >= 12 ? "PM" : "AM";
    return `${standardHour}:${minute} ${amPm}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      {/* Header */}
      <Animated.View
        entering={FadeInUp.springify()}
        style={[styles.header, { backgroundColor: colors.card }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <View style={[styles.iconContainer, { backgroundColor: colors.backgroundSecondary }]}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </View>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Attendance History</Text>
        <View style={{ width: 44 }} />
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Month Selector Pill */}
        <Animated.View entering={FadeInDown.delay(50).springify()} style={styles.monthSelectorWrapper}>
          <View style={[styles.monthPill, { backgroundColor: colors.card }]}>
            <TouchableOpacity onPress={handlePrevMonth} style={styles.monthPillButton}>
              <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <View style={styles.monthPillTextContainer}>
              <Ionicons name="calendar-outline" size={16} color={colors.primary} style={styles.calendarIcon} />
              <Text style={[styles.monthPillText, { color: colors.text }]}>
                {format(new Date(`${selectedYearMonth}-01`), "MMMM yyyy")}
              </Text>
            </View>
            <TouchableOpacity onPress={handleNextMonth} style={styles.monthPillButton}>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Stats Overview */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Card gradient style={styles.statsCardWrapper}>
            <View style={styles.statsHeader}>
              <View style={styles.statsHeaderIcon}>
                <Ionicons name="analytics" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.statsHeaderTitle}>Monthly Summary</Text>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statCell}>
                <Text style={styles.statCellLabel}>Total Days</Text>
                <Text style={styles.statCellValue}>{stats.totalDays}</Text>
              </View>
              <View style={styles.statDividerVertical} />
              <View style={styles.statCell}>
                <Text style={styles.statCellLabel}>Rate</Text>
                <Text style={styles.statCellValue}>{stats.attendancePercentage}%</Text>
              </View>
              <View style={styles.statDividerHorizontal} />
              <View style={[styles.statDividerHorizontal, { left: "50%" }]} />
              <View style={styles.statCell}>
                <Text style={styles.statCellLabel}>Present</Text>
                <Text style={styles.statCellValue}>{stats.presentDays}</Text>
              </View>
              <View style={styles.statDividerVerticalBottom} />
              <View style={styles.statCell}>
                <Text style={styles.statCellLabel}>{stats.isCurrentMonth ? "Remaining" : "Absent"}</Text>
                <Text style={styles.statCellValue}>{stats.absentDays}</Text>
              </View>
            </View>

            <View style={styles.motivationContainer}>
              <View style={styles.motivationIconBadge}>
                <Ionicons name={stats.motivationIcon} size={16} color={colors.primary} />
              </View>
              <Text style={styles.motivationText}>{stats.motivationMessage}</Text>
            </View>
          </Card>
        </Animated.View>

        {/* Recent Check-ins */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Check-ins</Text>
          <View style={[styles.badgeContainer, { backgroundColor: colors.primary + "15" }]}>
            <Text style={[styles.badgeText, { color: colors.primary }]}>{attendances.length}</Text>
          </View>
        </View>

        {isLoading ? (
          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading attendance...</Text>
          </Animated.View>
        ) : attendances.length === 0 ? (
          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.emptyContainer}>
            <View style={[styles.emptyIconWrapper, { backgroundColor: colors.background }]}>
              <Ionicons name="calendar-clear-outline" size={48} color={colors.textTertiary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Records Found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              You haven't checked in during {format(new Date(`${selectedYearMonth}-01`), "MMMM yyyy")} yet.
            </Text>
          </Animated.View>
        ) : (
          <View style={styles.listContainer}>
            {attendances.map((record, index) => {
              const recordDate = new Date(record?.createdDate?.split('T')[0] || new Date());
              return (
                <AnimatedCard
                  key={record.id || index.toString()}
                  entering={FadeInDown.delay(200 + index * 50).springify()}
                  style={styles.attendanceCard}
                  elevated
                >
                  {/* Left Status Indicator */}
                  <View style={[styles.statusIndicator, { backgroundColor: record.checkOutTime ? colors.success : colors.warning }]} />

                  <View style={styles.cardContent}>
                    <View style={styles.dateSection}>
                      <View style={[styles.dateBox, { backgroundColor: colors.primary + "15" }]}>
                        <Text style={[styles.dateDay, { color: colors.primary }]}>{recordDate.getDate()}</Text>
                        <Text style={[styles.dateMonth, { color: colors.primary }]}>
                          {recordDate.toLocaleDateString("en-US", { month: "short" })}
                        </Text>
                      </View>
                      <View style={styles.dateInfo}>
                        <Text style={[styles.recordDayName, { color: colors.text }]}>
                          {recordDate.toLocaleDateString("en-US", { weekday: "long" })}
                        </Text>
                        <Text style={[styles.recordSub, { color: colors.textSecondary }]}>
                          {record.checkOutTime ? "Completed Session" : "In Progress"}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.timeSection}>
                      <View style={[styles.timeBlock, { backgroundColor: colors.background }]}>
                        <View style={styles.timeIconWrap}>
                          <Ionicons name="log-in-outline" size={16} color={colors.success} />
                        </View>
                        <View>
                          <Text style={[styles.timeTitle, { color: colors.textSecondary }]}>Check-in</Text>
                          <Text style={[styles.timeValue, { color: colors.text }]}>
                            {formatToStandardTime(record?.checkInTime?.split("T")[1] || null)}
                          </Text>
                        </View>
                      </View>

                      <View style={[styles.timeBlock, { backgroundColor: colors.background }]}>
                        <View style={styles.timeIconWrap}>
                          <Ionicons name="log-out-outline" size={16} color={colors.warning} />
                        </View>
                        <View>
                          <Text style={[styles.timeTitle, { color: colors.textSecondary }]}>Check-out</Text>
                          <Text style={[styles.timeValue, { color: colors.text }]}>
                            {formatToStandardTime(record?.checkOutTime?.split("T")[1] || null)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </AnimatedCard>
              );
            })}
          </View>
        )}

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
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    zIndex: 10,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    padding: 0,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  monthSelectorWrapper: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
    alignItems: "center",
  },
  monthPill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 30,
    paddingHorizontal: 8,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  monthPillButton: {
    padding: 10,
    borderRadius: 20,
  },
  monthPillTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 140,
    justifyContent: "center",
    gap: 6,
  },
  calendarIcon: {
    marginTop: -2,
  },
  monthPillText: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: -0.3,
  },
  statsCardWrapper: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 24,
    overflow: "hidden",
  },
  statsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  statsHeaderIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  statsHeaderTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    padding: 16,
    position: "relative",
  },
  statCell: {
    width: "50%",
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  statCellLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 6,
  },
  statCellValue: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
  },
  statDividerVertical: {
    position: "absolute",
    top: 16,
    bottom: "50%",
    left: "50%",
    width: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  statDividerVerticalBottom: {
    position: "absolute",
    top: "50%",
    bottom: 16,
    left: "50%",
    width: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  statDividerHorizontal: {
    position: "absolute",
    top: "50%",
    left: 16,
    right: 16,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  motivationContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginTop: 20,
    gap: 12,
  },
  motivationIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,107,53,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  motivationText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 28,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
  badgeContainer: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "500",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  emptyIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  attendanceCard: {
    padding: 0,
    marginBottom: 16,
    borderRadius: 20,
    overflow: "hidden",
  },
  statusIndicator: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    zIndex: 1,
  },
  cardContent: {
    padding: 16,
    paddingLeft: 22,
  },
  dateSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  dateBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  dateDay: {
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 24,
  },
  dateMonth: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dateInfo: {
    flex: 1,
  },
  recordDayName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  recordSub: {
    fontSize: 13,
    fontWeight: "500",
  },
  timeSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  timeBlock: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  timeIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.03)",
    alignItems: "center",
    justifyContent: "center",
  },
  timeTitle: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  timeValue: {
    fontSize: 14,
    fontWeight: "700",
  },
});