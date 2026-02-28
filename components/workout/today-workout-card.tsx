import { Card } from '@/components/ui/card';
import { Colors } from '@/constants/color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ITodayWorkoutItemRes } from '@/interfaces/workout.interface';
import { useWorkoutStore } from '@/store/useWorkoutStore';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const AnimatedCard = Animated.createAnimatedComponent(Card);

export function TodayWorkoutCard() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isFocused = useIsFocused();

  const { today, isTodayLoading, todayError, fetchToday, markDone } =
    useWorkoutStore();

  useEffect(() => {
    if (isFocused) fetchToday();
  }, [isFocused, fetchToday]);

  const completedCount = today?.items.filter((i) => i.completed).length ?? 0;
  const totalCount = today?.items.length ?? 0;
  const progressPct = totalCount > 0 ? completedCount / totalCount : 0;

  const handleToggle = (item: ITodayWorkoutItemRes) => {
    markDone({
      subTitleId: item.subTitleId,
      completed: !item.completed,
    });
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isTodayLoading && !today) {
    return (
      <AnimatedCard
        entering={FadeInDown.delay(400).springify()}
        elevated
        style={styles.card}
      >
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading today's workout...
        </Text>
      </AnimatedCard>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (todayError) {
    return (
      <AnimatedCard
        entering={FadeInDown.delay(400).springify()}
        elevated
        style={styles.card}
      >
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
        <Text style={[styles.errorTitle, { color: colors.text }]}>
          Failed to Load
        </Text>
        <Text style={[styles.errorSub, { color: colors.textSecondary }]}>
          {todayError}
        </Text>
        <TouchableOpacity
          onPress={fetchToday}
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </AnimatedCard>
    );
  }

  // ── Rest day ───────────────────────────────────────────────────────────────
  if (!isTodayLoading && (!today?.items || today.items.length === 0)) {
    return null; // Hide card completely on rest days
  }

  // ── Workout Card ───────────────────────────────────────────────────────────
  return (
    <Animated.View
      entering={FadeInDown.delay(400).springify()}
      style={styles.container}
    >
      {/* Header row */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Today's Workout
          </Text>
          {today?.planTitle && (
            <Text style={[styles.planTitle, { color: colors.textSecondary }]}>
              {today.planTitle}
            </Text>
          )}
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => router.push('/week-progress' as any)}>
            <Ionicons name="bar-chart-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/workout-manager' as any)}>
            <Ionicons name="settings-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress bar */}
      <View style={[styles.progressTrack, { backgroundColor: colors.backgroundSecondary }]}>
        <View
          style={[
            styles.progressFill,
            { width: `${progressPct * 100}%`, backgroundColor: colors.primary },
          ]}
        />
      </View>
      <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
        {completedCount}/{totalCount} completed
      </Text>

      {/* Exercise list (first 4 only) */}
      {today?.items.slice(0, 4).map((item) => (
        <TouchableOpacity
          key={item.subTitleId}
          style={[styles.exerciseRow, { backgroundColor: colors.backgroundSecondary }]}
          onPress={() => handleToggle(item)}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.checkbox,
              {
                borderColor: item.completed ? colors.primary : colors.border,
                backgroundColor: item.completed ? colors.primary : 'transparent',
              },
            ]}
          >
            {item.completed && (
              <Ionicons name="checkmark" size={14} color="#fff" />
            )}
          </View>
          <Text
            style={[
              styles.exerciseName,
              {
                color: item.completed ? colors.textSecondary : colors.text,
                textDecorationLine: item.completed ? 'line-through' : 'none',
              },
            ]}
          >
            {item.subTitle}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={colors.textTertiary}
          />
        </TouchableOpacity>
      ))}

      {/* Show "+N more" if > 4 exercises */}
      {totalCount > 4 && (
        <TouchableOpacity
          onPress={() => router.push('/workout-details' as any)}
          style={styles.moreRow}
        >
          <Text style={[styles.moreText, { color: colors.primary }]}>
            +{totalCount - 4} more exercises
          </Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { 
    paddingHorizontal: 20, 
    marginBottom: 24 
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: { 
    fontSize: 14, 
    marginTop: 8 
  },
  errorTitle: { 
    fontSize: 18, 
    fontWeight: '700',
    marginTop: 8,
  },
  errorSub: { 
    fontSize: 13, 
    textAlign: 'center',
    paddingHorizontal: 20,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '600' 
  },
  planTitle: { 
    fontSize: 13, 
    marginTop: 2 
  },
  viewAll: { 
    fontSize: 14, 
    fontWeight: '600' 
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressFill: { 
    height: '100%', 
    borderRadius: 3 
  },
  progressLabel: { 
    fontSize: 12, 
    marginBottom: 12 
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseName: { 
    flex: 1, 
    fontSize: 14, 
    fontWeight: '500' 
  },
  moreRow: { 
    alignItems: 'center', 
    paddingVertical: 8 
  },
  moreText: { 
    fontSize: 13, 
    fontWeight: '600' 
  },
});
