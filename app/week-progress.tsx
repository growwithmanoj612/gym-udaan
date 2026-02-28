import { Card } from '@/components/ui/card';
import { Colors } from '@/constants/color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useWorkoutStore } from '@/store/useWorkoutStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const AnimatedCard = Animated.createAnimatedComponent(Card);
const { width } = Dimensions.get('window');

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function WeekProgressScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { weekProgress, isWeekLoading, weekError, fetchWeekProgress } = useWorkoutStore();

  React.useEffect(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startDate = startOfWeek.toISOString().split('T')[0];
    
    fetchWeekProgress(startDate);
  }, []);

  const progressPercentage = React.useMemo(() => {
    if (!weekProgress?.totalAssigned) return 0;
    return Math.round((weekProgress.totalCompleted / weekProgress.totalAssigned) * 100);
  }, [weekProgress]);

  const getCompletionColor = (completed: number, assigned: number) => {
    if (assigned === 0) return colors.backgroundSecondary;
    const percentage = (completed / assigned) * 100;
    if (percentage === 100) return colors.success;
    if (percentage >= 50) return colors.primary;
    return colors.error;
  };

  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    return DAY_LABELS[date.getDay()];
  };

  const getMonthDay = (dateString: string) => {
    const date = new Date(dateString);
    return date.getDate();
  };

  if (isWeekLoading && !weekProgress) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading week progress...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (weekError) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.text }]}>Failed to Load</Text>
          <Text style={[styles.errorSubtext, { color: colors.textSecondary }]}>{weekError}</Text>
          <TouchableOpacity
            onPress={() => fetchWeekProgress()}
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <Animated.View
        entering={FadeInUp.springify()}
        style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Week Progress</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {weekProgress?.weekStart} - {weekProgress?.weekEnd}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Overall Progress Card */}
        <AnimatedCard
          entering={FadeInDown.delay(100).springify()}
          gradient
          style={styles.overallCard}
        >
          <View style={styles.overallContent}>
            <View style={styles.overallLeft}>
              <View style={styles.trophyContainer}>
                <Ionicons name="trophy" size={40} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.overallLabel}>Overall Progress</Text>
                <Text style={styles.overallStats}>
                  {weekProgress?.totalCompleted} / {weekProgress?.totalAssigned} completed
                </Text>
              </View>
            </View>
            <View style={styles.overallRight}>
              <Text style={styles.overallPercentage}>{progressPercentage}%</Text>
            </View>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarBg, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
              <Animated.View
                style={[
                  styles.progressBarFill,
                  {
                    backgroundColor: '#FFFFFF',
                    width: `${progressPercentage}%`,
                  },
                ]}
              />
            </View>
          </View>
        </AnimatedCard>

        {/* Daily Breakdown */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Daily Breakdown</Text>

          {weekProgress?.days.map((day, index) => {
            const completionPercentage = day.assigned > 0
              ? Math.round((day.completed / day.assigned) * 100)
              : 0;
            const isToday = day.date === new Date().toISOString().split('T')[0];

            return (
              <AnimatedCard
                key={day.date}
                entering={FadeInDown.delay(200 + index * 50).springify()}
                elevated
                style={[
                  styles.dayCard,
                  isToday && { borderColor: colors.primary, borderWidth: 2 },
                ]}
              >
                {/* Day Header */}
                <View style={styles.dayHeader}>
                  <View style={styles.dayLeft}>
                    <View
                      style={[
                        styles.dayBadge,
                        { backgroundColor: getCompletionColor(day.completed, day.assigned) },
                      ]}
                    >
                      <Text style={styles.dayBadgeText}>{getDayName(day.date)}</Text>
                    </View>
                    <View>
                      <Text style={[styles.dayDate, { color: colors.text }]}>
                        {getMonthDay(day.date)}
                        {isToday && (
                          <Text style={[styles.todayBadge, { color: colors.primary }]}>
                            {' '}
                            • Today
                          </Text>
                        )}
                      </Text>
                      <Text style={[styles.dayStats, { color: colors.textSecondary }]}>
                        {day.completed} / {day.assigned} exercises
                      </Text>
                    </View>
                  </View>

                  <View style={styles.dayRight}>
                    <Text
                      style={[
                        styles.dayPercentage,
                        {
                          color:
                            completionPercentage === 100
                              ? colors.success
                              : completionPercentage >= 50
                              ? colors.primary
                              : colors.textSecondary,
                        },
                      ]}
                    >
                      {completionPercentage}%
                    </Text>
                    {completionPercentage === 100 && (
                      <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                    )}
                  </View>
                </View>

                {/* Day Progress Bar */}
                <View style={styles.dayProgressContainer}>
                  <View
                    style={[
                      styles.dayProgressBg,
                      { backgroundColor: colors.backgroundSecondary },
                    ]}
                  >
                    <Animated.View
                      style={[
                        styles.dayProgressFill,
                        {
                          backgroundColor: getCompletionColor(day.completed, day.assigned),
                          width: `${completionPercentage}%`,
                        },
                      ]}
                    />
                  </View>
                </View>
              </AnimatedCard>
            );
          })}
        </View>

        {/* Stats Summary */}
        <AnimatedCard
          entering={FadeInDown.delay(600).springify()}
          elevated
          style={styles.summaryCard}
        >
          <Text style={[styles.summaryTitle, { color: colors.text }]}>This Week's Summary</Text>

          <View style={styles.summaryStats}>
            <View style={styles.statItem}>
              <View
                style={[styles.statIconContainer, { backgroundColor: colors.success + '15' }]}
              >
                <Ionicons name="checkmark-circle" size={24} color={colors.success} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {weekProgress?.totalCompleted}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Completed</Text>
            </View>

            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="calendar" size={24} color={colors.primary} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {weekProgress?.totalAssigned}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Assigned</Text>
            </View>

            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: colors.error + '15' }]}>
                <Ionicons name="time" size={24} color={colors.error} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {(weekProgress?.totalAssigned || 0) - (weekProgress?.totalCompleted || 0)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Remaining</Text>
            </View>
          </View>
        </AnimatedCard>

        {/* Motivational Message */}
        {progressPercentage === 100 && (
          <AnimatedCard
            entering={FadeInDown.delay(700).springify()}
            style={[styles.motivationCard, { backgroundColor: colors.success + '15' }]}
          >
            <Ionicons name="trophy" size={48} color={colors.success} />
            <Text style={[styles.motivationTitle, { color: colors.text }]}>
              Perfect Week! 🎉
            </Text>
            <Text style={[styles.motivationText, { color: colors.textSecondary }]}>
              You've completed all exercises this week. Keep up the amazing work!
            </Text>
          </AnimatedCard>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 16,
  },
  errorText: {
    fontSize: 20,
    fontWeight: '700',
  },
  errorSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  overallCard: {
    margin: 20,
    padding: 20,
  },
  overallContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  overallLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  trophyContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overallLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  overallStats: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  overallRight: {
    alignItems: 'center',
  },
  overallPercentage: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  section: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  dayCard: {
    padding: 16,
    marginBottom: 12,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dayBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  dayDate: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  todayBadge: {
    fontSize: 14,
    fontWeight: '600',
  },
  dayStats: {
    fontSize: 13,
  },
  dayRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dayPercentage: {
    fontSize: 20,
    fontWeight: '700',
  },
  dayProgressContainer: {
    marginTop: 4,
  },
  dayProgressBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  dayProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  summaryCard: {
    margin: 20,
    padding: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 8,
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
  },
  motivationCard: {
    margin: 20,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  motivationTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  motivationText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
