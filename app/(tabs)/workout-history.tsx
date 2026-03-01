import { Card } from "@/components/ui/card";
import { Colors } from "@/constants/color";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useWorkoutStore } from "@/store/useWorkoutStore";
import { Ionicons } from "@expo/vector-icons";
import { endOfMonth, format, parseISO, startOfMonth } from "date-fns";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
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

  // Zustand store hooks
  const { searchLogs, workOutLogs, isLoading } = useWorkoutStore();

  // State for month selection
  const [selectedYearMonth, setSelectedYearMonth] = useState(
    format(new Date(), "yyyy-MM")
  );

  useEffect(() => {
    // Fetch workout logs for the selected month
    searchLogs(selectedYearMonth);
  }, [selectedYearMonth]);

  // Helper function to calculate the number of days in a month
  const getDaysInMonth = (month: string) => {
    const date = parseISO(`${month}-01`);
    const startDate = startOfMonth(date);
    const endDate = endOfMonth(date);
    return endDate.getDate();
  };

  // Calculate workout stats
  const calculateStats = () => {
    const daysInMonth = getDaysInMonth(selectedYearMonth);
    const workoutDays = workOutLogs.length;
    const totalExercises = workOutLogs.reduce(
      (sum, log) => sum + log.items.length,
      0
    );
    const completedExercises = workOutLogs.reduce(
      (sum, log) => sum + log.items.filter((item) => item.completed).length,
      0
    );
    const workoutPercentage = (workoutDays / daysInMonth) * 100;
    const completionRate =
      totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

    // Check if selected month is current month
    const isCurrentMonth =
      selectedYearMonth === format(new Date(), "yyyy-MM");

    // Motivational message based on workout percentage
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
      motivationIcon = "fitness";
    } else {
      motivationMessage = "Time to get back in action! 🎯";
      motivationIcon = "rocket";
    }

    return {
      totalDays: daysInMonth,
      workoutDays,
      totalExercises,
      completedExercises,
      workoutPercentage: isNaN(workoutPercentage)
        ? 0
        : workoutPercentage.toFixed(1),
      completionRate: isNaN(completionRate) ? 0 : completionRate.toFixed(1),
      isCurrentMonth,
      motivationMessage,
      motivationIcon,
    };
  };

  const stats = calculateStats();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Animated.View
        entering={FadeInUp.springify()}
        style={[styles.header, { backgroundColor: colors.card }]}
      >
        <View style={{ width: 40 }} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Workout History
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/workout-manager")}
          style={styles.settingsButton}
        >
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </Animated.View>

      {/* Month Selector */}
      <View style={[styles.monthSelectorContainer, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          onPress={() =>
            setSelectedYearMonth(
              format(
                new Date(
                  new Date(selectedYearMonth).setMonth(
                    new Date(selectedYearMonth).getMonth() - 1
                  )
                ),
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
                new Date(
                  new Date(selectedYearMonth).setMonth(
                    new Date(selectedYearMonth).getMonth() + 1
                  )
                ),
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
                <Ionicons name="calendar" size={28} color="#FFFFFF" />
                <Text style={styles.statValue}>{stats.workoutDays}</Text>
                <Text style={styles.statLabel}>Workouts</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="barbell" size={28} color="#FFFFFF" />
                <Text style={styles.statValue}>{stats.totalExercises}</Text>
                <Text style={styles.statLabel}>Exercises</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="checkmark-circle" size={28} color="#FFFFFF" />
                <Text style={styles.statValue}>{stats.completedExercises}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="analytics" size={28} color="#FFFFFF" />
                <Text style={styles.statValue}>{stats.completionRate}%</Text>
                <Text style={styles.statLabel}>Rate</Text>
              </View>
            </View>

            {/* Motivational Message */}
            <View style={styles.motivationContainer}>
              <Ionicons
                name={stats.motivationIcon}
                size={20}
                color="#FFFFFF"
              />
              <Text style={styles.motivationText}>
                {stats.motivationMessage}
              </Text>
            </View>
          </Card>
        </Animated.View>

        {/* Workout Logs List */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Workout Sessions
          </Text>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Loading workouts...
              </Text>
            </View>
          ) : workOutLogs.length === 0 ? (
            <AnimatedCard
              entering={FadeInDown.delay(200).springify()}
              elevated
              style={styles.emptyCard}
            >
              <Ionicons
                name="fitness-outline"
                size={64}
                color={colors.textTertiary}
              />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No Workouts Yet
              </Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Start your fitness journey today!
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/workout-manager")}
                style={[styles.emptyButton, { backgroundColor: colors.primary }]}
              >
                <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                <Text style={styles.emptyButtonText}>Manage Workouts</Text>
              </TouchableOpacity>
            </AnimatedCard>
          ) : (
            workOutLogs.map((workout, index) => (
              <AnimatedCard
                key={`${workout.date}-${index}`}
                entering={FadeInDown.delay(200 + index * 50).springify()}
                elevated
                style={styles.workoutCard}
              >
                {/* Date Header */}
                <View style={styles.dateSection}>
                  <View style={[styles.dateIcon, { backgroundColor: `${colors.primary}15` }]}>
                    <Text style={[styles.dateDay, { color: colors.primary }]}>
                      {new Date(workout.date).getDate()}
                    </Text>
                    <Text style={[styles.dateMonth, { color: colors.primary }]}>
                      {new Date(workout.date).toLocaleDateString("en-US", {
                        month: "short",
                      })}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.workoutTitle, { color: colors.text }]}>
                      {workout.planTitle || "Workout Session"}
                    </Text>
                    <Text
                      style={[styles.workoutDay, { color: colors.textSecondary }]}
                    >
                      {workout.dayOfWeek}
                    </Text>
                  </View>
                  <View style={styles.completionBadge}>
                    <Text style={[styles.completionText, { color: colors.primary }]}>
                      {workout.items.filter((item) => item.completed).length}/
                      {workout.items.length}
                    </Text>
                  </View>
                </View>

                {/* Exercise List */}
                <View style={styles.exerciseList}>
                  {workout.items.map((exercise, idx) => (
                    <View
                      key={exercise.subTitleId}
                      style={[
                        styles.exerciseItem,
                        { borderBottomColor: colors.border },
                        idx === workout.items.length - 1 && styles.lastExerciseItem,
                      ]}
                    >
                      <View style={styles.exerciseLeft}>
                        <Ionicons
                          name={
                            exercise.completed
                              ? "checkmark-circle"
                              : "ellipse-outline"
                          }
                          size={20}
                          color={
                            exercise.completed ? colors.success : colors.textTertiary
                          }
                        />
                        <Text
                          style={[
                            styles.exerciseName,
                            { color: colors.text },
                            exercise.completed && styles.completedExercise,
                          ]}
                        >
                          {exercise.subTitle}
                        </Text>
                      </View>
                      {exercise.imageName && (
                        <Image
                          source={{ uri: exercise.imageName }}
                          style={styles.exerciseThumbnail}
                        />
                      )}
                    </View>
                  ))}
                </View>
              </AnimatedCard>
            ))
          )}
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  settingsButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  monthSelectorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  arrowButton: {
    padding: 10,
  },
  selectedYearMonth: {
    fontSize: 16,
    fontWeight: "bold",
  },
  statsContainer: {
    padding: 20,
  },
  statsCard: {
    padding: 16,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  statLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    height: 35,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  motivationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
  },
  motivationText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
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
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 12,
  },
  emptyCard: {
    padding: 40,
    alignItems: "center",
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 12,
  },
  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  workoutCard: {
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
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  dateDay: {
    fontSize: 18,
    fontWeight: "bold",
  },
  dateMonth: {
    fontSize: 11,
    textTransform: "uppercase",
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  workoutDay: {
    fontSize: 12,
  },
  completionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  completionText: {
    fontSize: 13,
    fontWeight: "700",
  },
  exerciseList: {
    gap: 0,
  },
  exerciseItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  lastExerciseItem: {
    borderBottomWidth: 0,
  },
  exerciseLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  completedExercise: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  exerciseThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
});
