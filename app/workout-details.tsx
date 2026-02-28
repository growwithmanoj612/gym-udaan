import { Card } from '@/components/ui/card';
import { Colors } from '@/constants/color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useWorkoutStore } from '@/store/useWorkoutStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  BounceIn,
  FadeIn,
  FadeInDown,
  FadeInUp
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const AnimatedCard = Animated.createAnimatedComponent(Card);

export default function WorkoutDetailsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const { today, isTodayLoading, fetchToday, markDone } = useWorkoutStore();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchToday();
  }, []);

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchToday();
    setRefreshing(false);
  };

  // Get today's day name
  const getTodayName = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  // Sort exercises by sortOrder
  const sortedExercises = React.useMemo(() => {
    if (!today?.items) return [];
    return [...today.items].sort(
      (a, b) => a.sortOrder - b.sortOrder
    );
  }, [today]);

  // Calculate completion
  const completedCount = sortedExercises.filter(item => item.completed).length;
  const totalCount = sortedExercises.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleToggle = (subTitleId: number, currentStatus: boolean) => {
    markDone({
      subTitleId,
      completed: !currentStatus,
    });
  };

  const handleOpenTutorial = (tutorialLink: string | null) => {
    if (tutorialLink) {
      Linking.openURL(tutorialLink);
    }
  };

  // Loading state
  if (isTodayLoading && !today) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading your workout...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Empty state
  if (!today || today.items.length === 0) {
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
            <Text style={[styles.headerTitle, { color: colors.text }]}>Today's Workout</Text>
          </View>
          <View style={{ width: 40 }} />
        </Animated.View>

        <View style={styles.emptyContainer}>
          <Animated.View entering={BounceIn.delay(200)} style={styles.emptyIconContainer}>
            <Ionicons name="fitness-outline" size={80} color={colors.primary} />
          </Animated.View>
          <Animated.Text 
            entering={FadeIn.delay(400)}
            style={[styles.emptyTitle, { color: colors.text }]}
          >
            Rest Day! 😌
          </Animated.Text>
          <Animated.Text 
            entering={FadeIn.delay(500)}
            style={[styles.emptyText, { color: colors.textSecondary }]}
          >
            No workout scheduled for today.{'\n'}
            Check back tomorrow or customize your plan!
          </Animated.Text>
          <Animated.View entering={FadeIn.delay(600)}>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/(tabs)/workout-manager')}
            >
              <Ionicons name="calendar" size={20} color="#FFFFFF" />
              <Text style={styles.emptyButtonText}>Manage Workouts</Text>
            </TouchableOpacity>
          </Animated.View>
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
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {today.planTitle || 'Today\'s Workout'}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {getTodayName()} • {today.dayOfWeek}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </Animated.View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Progress Card */}
        <AnimatedCard
          entering={FadeInDown.delay(100).springify()}
          gradient
          style={styles.progressCard}
        >
          <View style={styles.progressContent}>
            <View style={styles.progressLeft}>
              <View style={styles.progressIconContainer}>
                <Ionicons name="trophy" size={32} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.progressLabel}>Your Progress</Text>
                <Text style={styles.progressText}>
                  {completedCount} of {totalCount} completed
                </Text>
              </View>
            </View>
            <View style={styles.progressRight}>
              <Text style={styles.progressPercentage}>{completionPercentage}%</Text>
            </View>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarBg, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
              <Animated.View
                style={[
                  styles.progressBarFill,
                  { 
                    backgroundColor: '#FFFFFF',
                    width: `${completionPercentage}%`,
                  },
                ]}
              />
            </View>
          </View>
        </AnimatedCard>

        {/* Exercise List */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Exercise Plan ({totalCount})
          </Text>

          {sortedExercises.map((exercise, index) => {
            const isCompleted = exercise?.completed;
            const imageUrl = exercise?.imageName;

            return (
              <AnimatedCard
                key={exercise?.subTitleId}
                entering={FadeInDown.delay(200 + index * 80).springify()}
                elevated
                style={[
                  styles.exerciseCard,
                  {
                    borderLeftWidth: 4,
                    borderLeftColor: isCompleted ? colors.success : colors.primary,
                    backgroundColor: colors.card,
                  },
                ]}
              >
                {/* Completion Badge Overlay */}
                {isCompleted && (
                  <Animated.View 
                    entering={BounceIn}
                    style={[styles.completionBadge, { backgroundColor: colors.success }]}
                  >
                    <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                    <Text style={styles.completionBadgeText}>Done</Text>
                  </Animated.View>
                )}

                {/* Exercise Header */}
                <View style={styles.exerciseHeader}>
                  <View style={styles.exerciseHeaderLeft}>
                    <TouchableOpacity
                      onPress={() => handleToggle(exercise?.subTitleId, exercise?.completed)}
                      style={[
                        styles.checkbox,
                        {
                          backgroundColor: isCompleted ? colors.success : 'transparent',
                          borderColor: isCompleted ? colors.success : colors.border,
                          shadowColor: isCompleted ? colors.success : 'transparent',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.3,
                          shadowRadius: 4,
                          elevation: isCompleted ? 3 : 0,
                        },
                      ]}
                      activeOpacity={0.7}
                    >
                      {isCompleted && (
                        <Animated.View entering={BounceIn}>
                          <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                        </Animated.View>
                      )}
                    </TouchableOpacity>
                    <View style={styles.exerciseHeaderText}>
                      <Text
                        style={[
                          styles.exerciseTitle,
                          { color: colors.text },
                          isCompleted && styles.completedText,
                        ]}
                        numberOfLines={2}
                      >
                        {exercise?.subTitle}
                      </Text>
                      <View style={styles.exerciseMeta}>
                        <View style={[styles.orderBadge, { backgroundColor: colors.primary + '15' }]}>
                          <Text style={[styles.orderText, { color: colors.primary }]}>
                            #{exercise?.sortOrder}
                          </Text>
                        </View>
                        <View style={[styles.statusBadge, { 
                          backgroundColor: isCompleted ? colors.success + '15' : colors.warning + '15' 
                        }]}>
                          <Ionicons 
                            name={isCompleted ? "checkmark-circle" : "time-outline"} 
                            size={12} 
                            color={isCompleted ? colors.success : colors.warning} 
                          />
                          <Text style={[styles.statusText, { 
                            color: isCompleted ? colors.success : colors.warning 
                          }]}>
                            {isCompleted ? 'Completed' : 'Pending'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Exercise Image */}
                {imageUrl && (
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: imageUrl }}
                      style={styles.exerciseImage}
                      resizeMode="cover"
                    />
                    {/* Image Overlay for Completed */}
                    {isCompleted && (
                      <View style={styles.imageOverlay}>
                        <View style={styles.imageOverlayIcon}>
                          <Ionicons name="checkmark-circle" size={48} color="#FFFFFF" />
                        </View>
                      </View>
                    )}
                  </View>
                )}

                {/* Exercise Actions */}
                <View style={styles.exerciseActions}>
                  {/* Tutorial Link */}
                  {exercise?.tutorialLink && (
                    <TouchableOpacity
                      onPress={() => handleOpenTutorial(exercise?.tutorialLink)}
                      style={[styles.tutorialButton, { 
                        backgroundColor: colors.primary + '10',
                        borderColor: colors.primary + '30',
                        borderWidth: 1,
                      }]}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="play-circle" size={20} color={colors.primary} />
                      <Text style={[styles.tutorialButtonText, { color: colors.primary }]}>
                        Watch Tutorial
                      </Text>
                      <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                    </TouchableOpacity>
                  )}

                  {/* Toggle Button */}
                  <TouchableOpacity
                    onPress={() => handleToggle(exercise?.subTitleId, exercise?.completed)}
                    style={[
                      styles.actionButton,
                      {
                        backgroundColor: isCompleted 
                          ? colors.backgroundSecondary 
                          : colors.primary,
                        borderWidth: isCompleted ? 1 : 0,
                        borderColor: colors.border,
                      },
                    ]}
                    activeOpacity={0.8}
                  >
                    <Ionicons 
                      name={isCompleted ? "refresh" : "checkmark-circle"} 
                      size={22} 
                      color={isCompleted ? colors.text : "#FFFFFF"} 
                    />
                    <Text
                      style={[
                        styles.actionButtonText,
                        { color: isCompleted ? colors.text : "#FFFFFF" },
                      ]}
                    >
                      {isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </AnimatedCard>
            );
          })}
        </View>

        {/* Motivational Footer */}
        {completionPercentage === 100 && (
          <AnimatedCard
            entering={FadeInDown.delay(400).springify()}
            style={[styles.motivationCard, { backgroundColor: colors.success + '15' }]}
          >
            <Ionicons name="trophy" size={48} color={colors.success} />
            <Text style={[styles.motivationTitle, { color: colors.text }]}>
              Workout Complete! 🎉
            </Text>
            <Text style={[styles.motivationText, { color: colors.textSecondary }]}>
              Great job! You've completed all exercises for today.
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
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    fontWeight: '500',
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
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  progressCard: {
    margin: 20,
    padding: 20,
  },
  progressContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressRight: {
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBarBg: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  section: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  exerciseCard: {
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  exerciseHeaderLeft: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseHeaderText: {
    flex: 1,
    gap: 8,
  },
  exerciseTitle: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  orderBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  orderText: {
    fontSize: 12,
    fontWeight: '700',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#F3F4F6',
  },
  exerciseImage: {
    width: '100%',
    height: '100%',
  },
  exerciseDetails: {
    gap: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tutorialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: 4,
  },
  tutorialButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  completionBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  completionBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  exerciseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  imageOverlayIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 50,
    padding: 8,
  },
  exerciseActions: {
    flexDirection: 'column',
    gap: 10,
    marginTop: 12,
  },
  motivationCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 24,
    alignItems: 'center',
    borderRadius: 16,
  },
  motivationTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 8,
  },
  motivationText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
