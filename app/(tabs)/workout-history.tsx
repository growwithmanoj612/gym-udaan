import { Card } from "@/components/ui/card";
import { Colors } from "@/constants/color";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useWorkoutStore } from "@/store/useWorkoutStore";
import { Ionicons } from "@expo/vector-icons";
import { endOfMonth, format, parseISO } from "date-fns";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

const AnimatedCard = Animated.createAnimatedComponent(Card);

export default function WorkoutHistory() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const { searchLogs, workOutLogs, isLoading } = useWorkoutStore();
  const [selectedYearMonth, setSelectedYearMonth] = useState(format(new Date(), "yyyy-MM"));

  useEffect(() => {
    searchLogs(selectedYearMonth);
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

  const calculateStats = () => {
    const daysInMonth = getDaysInMonth(selectedYearMonth);
    const workoutDays = workOutLogs.length;
    const totalExercises = workOutLogs.reduce((sum, log) => sum + log.items.length, 0);
    const completedExercises = workOutLogs.reduce(
      (sum, log) => sum + log.items.filter((item) => item.completed).length,
      0
    );
    const workoutPercentage = (workoutDays / daysInMonth) * 100;
    const completionRate = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;
    const isCurrentMonth = selectedYearMonth === format(new Date(), "yyyy-MM");

    let motivationMessage = "";
    let motivationIcon: any = "star";
    if (workoutPercentage >= 90) {
      motivationMessage = "Beast Mode! 💪🔥";
      motivationIcon = "trophy";
    } else if (workoutPercentage >= 75) {
      motivationMessage = "Crushing it! Keep going! 🚀";
      motivationIcon = "flame";
    } else if (workoutPercentage >= 60) {
      motivationMessage = "Strong progress! 💪";
      motivationIcon = "thumbs-up";
    } else if (workoutPercentage >= 40) {
      motivationMessage = "Good start! Push harder! 💪";
      motivationIcon = "barbell";
    } else {
      motivationMessage = "Time to get back in action! 🎯";
      motivationIcon = "rocket";
    }

    return {
      totalDays: daysInMonth,
      workoutDays,
      totalExercises,
      completedExercises,
      workoutPercentage: isNaN(workoutPercentage) ? 0 : Number(workoutPercentage.toFixed(1)),
      completionRate: isNaN(completionRate) ? 0 : Number(completionRate.toFixed(1)),
      isCurrentMonth,
      motivationMessage,
      motivationIcon,
    };
  };

  const stats = calculateStats();

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      {/* Header */}
      <Animated.View
        entering={FadeInUp.springify()}
        style={[styles.header, { backgroundColor: colors.card }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <View style={[styles.iconContainer, { backgroundColor: colors.backgroundSecondary }]}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </View>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Workout History</Text>
        <TouchableOpacity onPress={() => router.push("/workout-manager")} style={styles.headerButton}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + "15" }]}>
            <Ionicons name="settings-outline" size={20} color={colors.primary} />
          </View>
        </TouchableOpacity>
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

        {/* Stats Overview Grid */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Card gradient style={styles.statsCardWrapper}>
            <View style={styles.statsHeader}>
              <View style={styles.statsHeaderIcon}>
                <Ionicons name="stats-chart" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.statsHeaderTitle}>Activity Summary</Text>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statCell}>
                <Text style={styles.statCellLabel}>Workouts</Text>
                <Text style={styles.statCellValue}>{stats.workoutDays}</Text>
              </View>
              <View style={styles.statDividerVertical} />
              <View style={styles.statCell}>
                <Text style={styles.statCellLabel}>Exercises</Text>
                <Text style={styles.statCellValue}>{stats.totalExercises}</Text>
              </View>
              <View style={styles.statDividerHorizontal} />
              <View style={[styles.statDividerHorizontal, { left: "50%" }]} />
              <View style={styles.statCell}>
                <Text style={styles.statCellLabel}>Completed</Text>
                <Text style={styles.statCellValue}>{stats.completedExercises}</Text>
              </View>
              <View style={styles.statDividerVerticalBottom} />
              <View style={styles.statCell}>
                <Text style={styles.statCellLabel}>Tackle Rate</Text>
                <Text style={styles.statCellValue}>{stats.completionRate}%</Text>
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

        {/* Workout History Logs */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Workout Sessions</Text>
          <View style={[styles.badgeContainer, { backgroundColor: colors.primary + "15" }]}>
            <Text style={[styles.badgeText, { color: colors.primary }]}>{workOutLogs.length}</Text>
          </View>
        </View>

        {isLoading ? (
          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading workouts...</Text>
          </Animated.View>
        ) : workOutLogs.length === 0 ? (
          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.emptyContainer}>
            <View style={[styles.emptyIconWrapper, { backgroundColor: colors.background }]}>
              <Ionicons name="barbell-outline" size={48} color={colors.textTertiary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Workouts Found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              You have no tracked workouts for {format(new Date(`${selectedYearMonth}-01`), "MMMM yyyy")} yet.
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/workout-manager")}
              style={[styles.emptyButton, { backgroundColor: colors.primary }]}
            >
              <Ionicons name="add-circle" size={20} color="#FFFFFF" />
              <Text style={styles.emptyButtonText}>Manage Workouts</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <View style={styles.listContainer}>
            {workOutLogs.map((workout, index) => {
              const workoutDate = new Date(workout.date || new Date());
              const totalCompleted = workout.items.filter((i) => i.completed).length;
              const isFullyCompleted = totalCompleted === workout.items.length && workout.items.length > 0;

              return (
                <AnimatedCard
                  key={`${workout.date}-${index}`}
                  entering={FadeInDown.delay(200 + index * 50).springify()}
                  style={styles.workoutCard}
                  elevated
                >
                  {/* Left Status Indicator */}
                  <View style={[styles.statusIndicator, { backgroundColor: isFullyCompleted ? colors.success : colors.warning }]} />

                  <View style={styles.cardContent}>
                    {/* Date Block & Overview */}
                    <View style={styles.dateSection}>
                      <View style={[styles.dateBox, { backgroundColor: colors.primary + "15" }]}>
                        <Text style={[styles.dateDay, { color: colors.primary }]}>{workoutDate.getDate()}</Text>
                        <Text style={[styles.dateMonth, { color: colors.primary }]}>
                          {workoutDate.toLocaleDateString("en-US", { month: "short" })}
                        </Text>
                      </View>
                      <View style={styles.dateInfo}>
                        <Text style={[styles.workoutTitleName, { color: colors.text }]} numberOfLines={1}>
                          {workout.planTitle || "Workout Session"}
                        </Text>
                        <Text style={[styles.recordDayName, { color: colors.textSecondary }]}>
                          {workout.dayOfWeek}
                        </Text>
                      </View>

                      <View style={[styles.completionPill, { backgroundColor: isFullyCompleted ? colors.success + "15" : colors.primary + "15" }]}>
                        <Ionicons name={isFullyCompleted ? "checkmark-done-circle" : "sync-circle"} size={16} color={isFullyCompleted ? colors.success : colors.primary} />
                        <Text style={[styles.completionText, { color: isFullyCompleted ? colors.success : colors.primary }]}>
                          {totalCompleted}/{workout.items.length}
                        </Text>
                      </View>
                    </View>

                    {/* Progress Bar Mini */}
                    {workout.items.length > 0 && (
                      <View style={[styles.miniProgressWrap, { backgroundColor: colors.backgroundSecondary }]}>
                        <View style={[styles.miniProgressFill, {
                          width: `${(totalCompleted / workout.items.length) * 100}%`,
                          backgroundColor: isFullyCompleted ? colors.success : colors.primary
                        }]} />
                      </View>
                    )}

                    {/* Exercise Mini-Items */}
                    <View style={styles.exerciseList}>
                      {workout.items.map((exercise, idx) => (
                        <View
                          key={exercise.subTitleId}
                          style={[
                            styles.exerciseItemRow,
                            idx !== workout.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.borderLight }
                          ]}
                        >
                          <View style={styles.exerciseLeft}>
                            <Ionicons
                              name={exercise.completed ? "checkmark-circle" : "ellipse-outline"}
                              size={20}
                              color={exercise.completed ? colors.success : colors.textTertiary}
                            />
                            <Text
                              style={[
                                styles.exerciseNameText,
                                { color: exercise.completed ? colors.textSecondary : colors.text },
                                exercise.completed && styles.completedExerciseText
                              ]}
                              numberOfLines={1}
                            >
                              {exercise.subTitle}
                            </Text>
                          </View>
                          {exercise.imageName && (
                            <Image
                              source={{ uri: exercise.imageName }}
                              style={styles.exerciseThumbnailImg}
                            />
                          )}
                        </View>
                      ))}
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
  headerButton: {
    padding: 0,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
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
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    marginTop: 24,
  },
  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  workoutCard: {
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
    padding: 18,
    paddingLeft: 24,
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
    marginRight: 14,
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
    justifyContent: "center",
    paddingRight: 10,
  },
  workoutTitleName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  recordDayName: {
    fontSize: 13,
    fontWeight: "600",
  },
  completionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  completionText: {
    fontSize: 13,
    fontWeight: "700",
  },
  miniProgressWrap: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 16,
  },
  miniProgressFill: {
    height: "100%",
    borderRadius: 3,
  },
  exerciseList: {
    backgroundColor: "rgba(0,0,0,0.01)",
    borderRadius: 12,
  },
  exerciseItemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  exerciseLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  exerciseNameText: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  completedExerciseText: {
    textDecorationLine: "line-through",
    opacity: 0.5,
  },
  exerciseThumbnailImg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
    marginLeft: 12,
  },
});
