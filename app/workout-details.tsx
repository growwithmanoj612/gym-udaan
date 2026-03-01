import { Colors } from '@/constants/color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useWorkoutStore } from '@/store/useWorkoutStore';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Linking,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, {
  BounceIn,
  Extrapolation,
  FadeInDown,
  FadeInUp,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export default function WorkoutDetailsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const { today, isTodayLoading, fetchToday, markDone } = useWorkoutStore();
  const [refreshing, setRefreshing] = useState(false);

  // Scroll animations
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, 50], [0, 1], Extrapolation.CLAMP);
    return {
      opacity,
    };
  });

  useEffect(() => {
    fetchToday();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchToday();
    setRefreshing(false);
  };

  const getTodayName = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  const sortedExercises = React.useMemo(() => {
    if (!today?.items) return [];
    return [...today.items].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [today]);

  const completedCount = sortedExercises.filter(item => item.completed).length;
  const totalCount = sortedExercises.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleToggle = (subTitleId: number, currentStatus: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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

  if (isTodayLoading && !today) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Preparing your session...
          </Text>
        </View>
      </View>
    );
  }

  if (!today || today.items.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SafeAreaView edges={['top']} style={{ zIndex: 1 }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        <View style={styles.emptyContainer}>
          <Animated.View entering={BounceIn.delay(200)} style={styles.emptyIconWrapper}>
            <LinearGradient
              colors={[colors.primaryLight, colors.primary]}
              style={styles.emptyIconBg}
            >
              <Ionicons name="leaf" size={48} color="#FFF" />
            </LinearGradient>
          </Animated.View>
          <Animated.Text entering={FadeInDown.delay(300)} style={[styles.emptyTitle, { color: colors.text }]}>
            Rest Day
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(400)} style={[styles.emptyText, { color: colors.textSecondary }]}>
            Your muscles are recovering.{'\n'}Take a break and stay hydrated.
          </Animated.Text>
          <Animated.View entering={FadeInDown.delay(500).springify()}>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/(tabs)/workout-history')}
            >
              <Text style={styles.primaryButtonText}>View Schedule</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Sticky Header */}
      <AnimatedBlurView
        tint={colorScheme === 'dark' ? 'dark' : 'light'}
        intensity={80}
        style={[
          styles.stickyHeader,
          { paddingTop: insets.top },
          headerStyle
        ]}
      >
        <View style={styles.headerContent}>
          <Text style={[styles.stickyHeaderTitle, { color: colors.text }]}>
            {today.planTitle || 'Workout'}
          </Text>
        </View>
      </AnimatedBlurView>

      {/* Back Button */}
      <View style={[styles.floatingBackButton, { top: insets.top + 8 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButtonCircle, { backgroundColor: colors.card, shadowColor: colors.shadowDark }]}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
            progressViewOffset={insets.top + 60}
          />
        }
      >
        {/* Main Hero Section */}
        <Animated.View entering={FadeInUp.duration(600).springify()} style={[styles.heroSection, { marginTop: insets.top + 50 }]}>
          <Text style={[styles.heroDate, { color: colors.primary }]}>
            {getTodayName().toUpperCase()} • {today.dayOfWeek.toUpperCase()}
          </Text>
          <Text style={[styles.heroTitle, { color: colors.text }]}>
            {today.planTitle || "Today's Plan"}
          </Text>
          <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
            {totalCount} carefully crafted exercises for maximum results
          </Text>
        </Animated.View>

        {/* Minimal Progress Ring Card */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.progressSection}>
          <LinearGradient
            colors={[colors.card, colors.backgroundSecondary]}
            style={[styles.progressCardOuter, { borderColor: colors.borderLight, borderWidth: 1 }]}
          >
            <View style={styles.progressCardContent}>
              <View style={styles.progressInfo}>
                <Text style={[styles.progressTitle, { color: colors.text }]}>Daily Progress</Text>
                <Text style={[styles.progressSubtitle, { color: colors.textSecondary }]}>
                  {completedCount} of {totalCount} exercises done
                </Text>
              </View>
              <View style={styles.progressPercentageCircle}>
                <Ionicons
                  name={completionPercentage === 100 ? "trophy" : "flame"}
                  size={20}
                  color={completionPercentage === 100 ? colors.warning : colors.primary}
                />
                <Text style={[styles.progressPercentageText, { color: colors.text }]}>
                  {completionPercentage}%
                </Text>
              </View>
            </View>
            <View style={styles.progressBarWrapper}>
              <View
                style={[
                  styles.progressBarTrack,
                  { backgroundColor: colors.border },
                ]}
              />

              <AnimatedLinearGradient
                colors={[colors.gradientStart, colors.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.progressBarFill,
                  { width: `${completionPercentage}%` }

                ]}
              />
            </View>

          </LinearGradient>
        </Animated.View>

        {/* Exercises List */}
        <View style={styles.exercisesContainer}>
          {sortedExercises.map((exercise, index) => {
            const isCompleted = exercise?.completed;
            const imageUrl = exercise?.imageName;

            return (
              <Animated.View
                key={exercise?.subTitleId}
                entering={FadeInDown.delay(200 + index * 100).springify()}
                style={[
                  styles.exerciseWrapper,
                  { backgroundColor: colors.card, shadowColor: colors.shadow },
                  isCompleted && { opacity: 0.8 }
                ]}
              >
                {imageUrl && (
                  <View style={styles.exerciseImageContainer}>
                    <Image source={{ uri: imageUrl }} style={styles.exerciseImage} />
                    {/* Dark gradient for text readability if over image, or just style */}
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.6)']}
                      style={styles.imageGradient}
                    />

                    {exercise?.tutorialLink && (
                      <TouchableOpacity
                        style={styles.playButton}
                        onPress={() => handleOpenTutorial(exercise.tutorialLink)}
                        activeOpacity={0.8}
                      >
                        <BlurView intensity={60} tint="dark" style={styles.playButtonBlur}>
                          <Ionicons name="play" size={24} color="#FFF" style={{ marginLeft: 3 }} />
                        </BlurView>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                <View style={styles.exerciseContent}>
                  <View style={styles.exerciseTextRow}>
                    <View style={[
                      styles.orderBadgeSmall,
                      { backgroundColor: isCompleted ? colors.success + '20' : colors.primaryLight + '20' }
                    ]}>
                      <Text style={[
                        styles.orderBadgeSmallText,
                        { color: isCompleted ? colors.success : colors.primaryDark }
                      ]}>
                        {exercise.sortOrder < 10 ? `0${exercise.sortOrder}` : exercise.sortOrder}
                      </Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[styles.exerciseTitle, { color: colors.text }, isCompleted && styles.completedTextTitle]}>
                        {exercise?.subTitle}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleToggle(exercise?.subTitleId, isCompleted)}
                      activeOpacity={0.7}
                      style={[
                        styles.checkCircle,
                        { borderColor: isCompleted ? colors.success : colors.borderLight },
                        isCompleted && { backgroundColor: colors.success, borderColor: colors.success }
                      ]}
                    >
                      {isCompleted && <Ionicons name="checkmark" size={16} color="#FFF" />}
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleToggle(exercise?.subTitleId, isCompleted)}
                    activeOpacity={0.8}
                    style={[
                      styles.toggleBtnFullWidth,
                      { backgroundColor: isCompleted ? colors.borderLight + '60' : colors.primary }
                    ]}
                  >
                    <Ionicons
                      name={isCompleted ? "checkmark-circle" : "ellipse-outline"}
                      size={20}
                      color={isCompleted ? colors.textSecondary : '#FFF'}
                      style={{ marginRight: 8 }}
                    />
                    <Text style={[
                      styles.toggleBtnTextFullWidth,
                      { color: isCompleted ? colors.textSecondary : '#FFF' }
                    ]}>
                      {isCompleted ? 'Completed' : 'Mark as Done'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            );
          })}
        </View>

        {completionPercentage === 100 && (
          <Animated.View entering={BounceIn.delay(300)} style={styles.celebrationContainer}>
            <LinearGradient
              colors={[colors.successLight, colors.background]}
              style={styles.celebrationCard}
            >
              <View style={styles.celebrationIcon}>
                <Ionicons name="star" size={32} color={colors.warning} />
              </View>
              <Text style={[styles.celebrationTitle, { color: colors.text }]}>Amazing Job!</Text>
              <Text style={[styles.celebrationText, { color: colors.textSecondary }]}>
                You've crushed today's routine. Rest well!
              </Text>
            </LinearGradient>
          </Animated.View>
        )}
      </Animated.ScrollView>
    </View>
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
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  floatingBackButton: {
    position: 'absolute',
    left: 16,
    zIndex: 10,
  },
  backButtonCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 5,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150,150,150,0.2)',
  },
  headerContent: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickyHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  heroSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  heroDate: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 40,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
  },
  progressSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  progressCardOuter: {
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
  },
  progressCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressInfo: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  progressSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressPercentageCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(120,120,120,0.05)',
  },
  progressPercentageText: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  progressBarWrapper: {
    height: 8,
    borderRadius: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  progressBarTrack: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  exercisesContainer: {
    paddingHorizontal: 20,
    gap: 20,
  },
  exerciseWrapper: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  exerciseImageContainer: {
    height: 220,
    width: '100%',
    position: 'relative',
    backgroundColor: '#F0F0F0',
  },
  exerciseImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  exerciseOrderBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  badgeBlur: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  exerciseOrderBadgeText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -30 }, { translateY: -30 }],
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  playButtonBlur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseContent: {
    padding: 20,
  },
  exerciseTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  exerciseTitle: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
  },
  completedTextTitle: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  toggleBtnFullWidth: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 8,
  },
  toggleBtnTextFullWidth: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  orderBadgeSmall: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderBadgeSmallText: {
    fontSize: 15,
    fontWeight: '800',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    marginTop: -40,
  },
  emptyIconWrapper: {
    marginBottom: 24,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  emptyIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  primaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  celebrationContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 20,
  },
  celebrationCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  celebrationIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  celebrationTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  celebrationText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  }
});
