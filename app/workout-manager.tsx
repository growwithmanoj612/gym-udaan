import { Card } from '@/components/ui/card';
import { Colors } from '@/constants/color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ISubTitleRes, IWorkOutPlanRes } from '@/interfaces/workout.interface';
import { useWorkoutStore } from '@/store/useWorkoutStore';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

const AnimatedCard = Animated.createAnimatedComponent(Card);

const DAYS_OF_WEEK = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
] as const;

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type DayOfWeek = typeof DAYS_OF_WEEK[number];

export default function WorkoutManagerScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { rawPlans, isAllPlansLoading, fetchAllPlans, updatePlanDay, updateSubTitle, createSubTitle } = useWorkoutStore();

  const [selectedPlan, setSelectedPlan] = useState<IWorkOutPlanRes | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('MONDAY');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Exercise edit modal state
  const [selectedExercise, setSelectedExercise] = useState<ISubTitleRes | null>(null);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [exerciseName, setExerciseName] = useState('');
  const [tutorialLink, setTutorialLink] = useState('');
  const [exerciseOrder, setExerciseOrder] = useState('0');

  // Add exercise modal state
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [addExercisePlan, setAddExercisePlan] = useState<IWorkOutPlanRes | null>(null);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newTutorialLink, setNewTutorialLink] = useState('');
  const [newExerciseOrder, setNewExerciseOrder] = useState('0');

  // Fetch data when tab is focused
  useFocusEffect(
    React.useCallback(() => {
      fetchAllPlans();
    }, [fetchAllPlans])
  );

  const handleOpenEdit = (plan: IWorkOutPlanRes) => {
    setSelectedPlan(plan);
    setSelectedDay(plan.dayOfWeek as DayOfWeek);
    setShowEditModal(true);
  };

  const validateDaySelection = (planId: number, day: string): boolean => {
    if (!rawPlans) return true;

    // Check if another plan is already assigned to this day
    const existingPlan = rawPlans.find(p => p.dayOfWeek === day && p.id !== planId);

    if (existingPlan) {
      Toast.show({
        type: 'error',
        text1: 'Day Already Taken',
        text2: `"${existingPlan.title}" is already assigned to ${day}`,
        position: 'top',
      });
      return false;
    }

    return true;
  };

  const handleSaveChanges = async () => {
    if (!selectedPlan) return;

    // Validate day selection
    if (!validateDaySelection(selectedPlan.id, selectedDay)) {
      return;
    }

    setIsSubmitting(true);
    try {
      await updatePlanDay(selectedPlan.id, selectedDay);
      setShowEditModal(false);
      setSelectedPlan(null);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: `"${selectedPlan.title}" moved to ${selectedDay}`,
        position: 'top',
      });
    } catch (error) {
      console.error('Failed to update plan:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed',
        text2: 'Could not update workout plan',
        position: 'top',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Exercise edit handlers
  const handleOpenExerciseEdit = (exercise: ISubTitleRes) => {
    setSelectedExercise(exercise);
    setExerciseName(exercise.subTitle);
    setTutorialLink(exercise.tutorialLink || '');
    setExerciseOrder(exercise.sortOrder.toString());
    setShowExerciseModal(true);
  };

  const handleSaveExercise = async () => {
    if (!selectedExercise) return;

    if (!exerciseName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Exercise name is required',
        position: 'top',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await updateSubTitle(selectedExercise.id, {
        subTitle: exerciseName.trim(),
        tutorialLink: tutorialLink.trim(),
        sortOrder: parseInt(exerciseOrder) || 0,
      });
      setShowExerciseModal(false);
      setSelectedExercise(null);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Exercise updated successfully',
        position: 'top',
      });
    } catch (error) {
      console.error('Failed to update exercise:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed',
        text2: 'Could not update exercise',
        position: 'top',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add exercise handlers
  const handleOpenAddExercise = (plan: IWorkOutPlanRes) => {
    setAddExercisePlan(plan);
    // Set default order to be after the last exercise
    const maxOrder = plan.subTitles.length > 0
      ? Math.max(...plan.subTitles.map(s => s.sortOrder))
      : -1;
    setNewExerciseOrder((maxOrder + 1).toString());
    setNewExerciseName('');
    setNewTutorialLink('');
    setShowAddExerciseModal(true);
  };

  const handleSaveNewExercise = async () => {
    if (!addExercisePlan) return;

    if (!newExerciseName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Exercise name is required',
        position: 'top',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createSubTitle({
        planId: addExercisePlan.id,
        subTitle: newExerciseName.trim(),
        tutorialLink: newTutorialLink.trim() || undefined,
        sortOrder: parseInt(newExerciseOrder) || 0,
      });
      setShowAddExerciseModal(false);
      setAddExercisePlan(null);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Exercise added successfully',
        position: 'top',
      });
    } catch (error) {
      console.error('Failed to add exercise:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed',
        text2: 'Could not add exercise',
        position: 'top',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group plans by day
  const plansByDay = React.useMemo(() => {
    if (!rawPlans) return {};

    const grouped: Record<string, IWorkOutPlanRes[]> = {};

    DAYS_OF_WEEK.forEach(day => {
      grouped[day] = [];
    });

    rawPlans.forEach(plan => {
      const day = plan.dayOfWeek;
      if (grouped[day]) {
        grouped[day].push(plan);
      }
    });

    return grouped;
  }, [rawPlans]);

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
          <Text style={[styles.headerTitle, { color: colors.text }]}>Workout Manager</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Customize your workout schedule
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <View style={[styles.infoWrapper, { backgroundColor: colors.infoLight }]}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="information" size={20} color={colors.info} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: colors.text }]}>Manage Routine</Text>
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                Tap the calendar icon to swap days. Tap any exercise underneath to customize its details.
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Current Plan */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            All Workout Plans
          </Text>

          {isAllPlansLoading ? (
            <Animated.View
              entering={FadeInDown.delay(200).springify()}
              style={styles.emptyContainer}
            >
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.emptySubtitle, { color: colors.text }]}>Loading workout plans...</Text>
            </Animated.View>
          ) : !rawPlans || rawPlans.length === 0 ? (
            <Animated.View
              entering={FadeInDown.delay(200).springify()}
              style={styles.emptyContainer}
            >
              <View style={[styles.emptyIconWrapper, { backgroundColor: colors.background }]}>
                <Ionicons name="barbell-outline" size={48} color={colors.textTertiary} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No Workout Plans</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                You haven&apos;t added any workout plans yet.
              </Text>
            </Animated.View>
          ) : (
            DAYS_OF_WEEK.map((day, dayIndex) => {
              const dayPlans = plansByDay[day] || [];

              if (dayPlans.length === 0) return null;

              return (
                <View key={day} style={styles.daySection}>
                  <Text style={[styles.dayHeader, { color: colors.text }]}>
                    {DAY_LABELS[dayIndex]} - {day}
                  </Text>

                  {dayPlans.map((plan, index) => (
                    <AnimatedCard
                      key={plan.id}
                      entering={FadeInDown.delay(200 + dayIndex * 50 + index * 30).springify()}
                      elevated
                      style={styles.planCard}
                    >
                      <View style={styles.planHeader}>
                        <View style={styles.planLeft}>
                          <View
                            style={[
                              styles.planIconBadge,
                              { backgroundColor: colors.primary + '15' },
                            ]}
                          >
                            <Ionicons name="barbell-outline" size={24} color={colors.primary} />
                          </View>
                          <View style={styles.planInfo}>
                            <Text style={[styles.planName, { color: colors.text }]} numberOfLines={1}>
                              {plan.title}
                            </Text>
                            <Text style={[styles.planExerciseCount, { color: colors.textSecondary }]}>
                              {plan.subTitles.length} exercise{plan.subTitles.length !== 1 ? 's' : ''}
                            </Text>
                          </View>
                        </View>

                        <TouchableOpacity
                          onPress={() => handleOpenEdit(plan)}
                          style={[styles.editButton, { backgroundColor: colors.backgroundSecondary }]}
                        >
                          <Ionicons name="swap-horizontal" size={20} color={colors.primary} />
                        </TouchableOpacity>
                      </View>

                      {/* Exercise List Preview */}
                      <View style={styles.exerciseList}>
                        {plan.subTitles.slice(0, 3).map((subTitle, idx) => (
                          <TouchableOpacity
                            key={subTitle.id}
                            style={styles.exercisePreviewItem}
                            onPress={() => handleOpenExerciseEdit(subTitle)}
                          >
                            <Text style={[styles.exercisePreviewNumber, { color: colors.textTertiary }]}>
                              {String(subTitle.sortOrder).padStart(2, '0')}
                            </Text>
                            <Text style={[styles.exercisePreviewName, { color: colors.text }]} numberOfLines={1}>
                              {subTitle.subTitle}
                            </Text>
                            <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
                          </TouchableOpacity>
                        ))}
                        {plan.subTitles.length > 3 && (
                          <Text style={[styles.moreExercises, { color: colors.primary }]}>
                            +{plan.subTitles.length - 3} more exercises
                          </Text>
                        )}

                        {/* Add Exercise Button */}
                        <TouchableOpacity
                          style={[styles.addExerciseButton, { backgroundColor: colors.background }]}
                          onPress={() => handleOpenAddExercise(plan)}
                        >
                          <Ionicons name="add" size={20} color={colors.primary} />
                          <Text style={[styles.addExerciseText, { color: colors.primary }]}>
                            Add Exercise
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </AnimatedCard>
                  ))}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconWrap, { backgroundColor: colors.primary + "15" }]}>
                <Ionicons name="calendar-outline" size={24} color={colors.primary} />
              </View>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Change Workout Day</Text>
              <TouchableOpacity
                onPress={() => setShowEditModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Workout Plan Name */}
            <View style={[styles.selectedExercise, { backgroundColor: colors.backgroundSecondary }]}>
              <Ionicons name="barbell" size={20} color={colors.primary} />
              <Text style={[styles.selectedExerciseName, { color: colors.text }]}>
                {selectedPlan?.title}
              </Text>
              <View style={[styles.exerciseCountBadge, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.exerciseCountText, { color: colors.primary }]}>
                  {selectedPlan?.subTitles.length} exercises
                </Text>
              </View>
            </View>

            {/* Day Selection */}
            <View style={styles.inputSection}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Select New Day</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.daySelector}
              >
                {DAYS_OF_WEEK.map((day, idx) => {
                  const isAssigned = rawPlans?.some(p => p.dayOfWeek === day && p.id !== selectedPlan?.id);
                  const isSelected = selectedDay === day;

                  return (
                    <TouchableOpacity
                      key={day}
                      onPress={() => setSelectedDay(day)}
                      disabled={isAssigned}
                      style={[
                        styles.dayButton,
                        {
                          backgroundColor: isSelected
                            ? colors.primary
                            : isAssigned
                              ? colors.border
                              : colors.backgroundSecondary,
                          borderColor: isSelected
                            ? colors.primary
                            : isAssigned
                              ? colors.border
                              : colors.border,
                          opacity: isAssigned ? 0.5 : 1,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayButtonText,
                          {
                            color: isSelected
                              ? '#FFFFFF'
                              : isAssigned
                                ? colors.textTertiary
                                : colors.text,
                            fontWeight: isSelected ? '600' : '500',
                          },
                        ]}
                      >
                        {DAY_LABELS[idx]}
                      </Text>
                      {isAssigned && (
                        <Ionicons name="lock-closed" size={12} color={colors.textTertiary} style={{ marginLeft: 4 }} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              <Text style={[styles.inputHint, { color: colors.textSecondary }]}>
                Days with 🔒 are already assigned to other workouts
              </Text>
            </View>

            {/* Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setShowEditModal(false)}
                style={[styles.resetButton, { backgroundColor: colors.backgroundSecondary }]}
              >
                <Ionicons name="close" size={20} color={colors.text} />
                <Text style={[styles.resetButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveChanges}
                disabled={isSubmitting || selectedDay === selectedPlan?.dayOfWeek}
                style={[
                  styles.saveButton,
                  {
                    backgroundColor: selectedDay === selectedPlan?.dayOfWeek
                      ? colors.border
                      : colors.primary,
                    opacity: (isSubmitting || selectedDay === selectedPlan?.dayOfWeek) ? 0.6 : 1,
                  }
                ]}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Exercise Edit Modal */}
      <Modal
        visible={showExerciseModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowExerciseModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Exercise</Text>
                  <TouchableOpacity
                    onPress={() => setShowExerciseModal(false)}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>

                {/* Exercise Name Input */}
                <View style={styles.inputSection}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Exercise Name *</Text>
                  <TextInput
                    value={exerciseName}
                    onChangeText={setExerciseName}
                    placeholder="e.g., Push-ups | 10 reps x 3 sets"
                    placeholderTextColor={colors.textTertiary}
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.backgroundSecondary,
                        color: colors.text,
                        borderColor: colors.borderLight,
                      },
                    ]}
                  />
                  <Text style={[styles.inputHint, { color: colors.textSecondary }]}>
                    Include details like sets &amp; reps (e.g., &quot;Squats | 12x4&quot;)
                  </Text>
                </View>

                {/* Tutorial Link Input */}
                <View style={styles.inputSection}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Tutorial Video Link</Text>
                  <TextInput
                    value={tutorialLink}
                    onChangeText={setTutorialLink}
                    placeholder="https://youtube.com/..."
                    placeholderTextColor={colors.textTertiary}
                    autoCapitalize="none"
                    keyboardType="url"
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.backgroundSecondary,
                        color: colors.text,
                        borderColor: colors.border,
                      },
                    ]}
                  />
                  <Text style={[styles.inputHint, { color: colors.textSecondary }]}>
                    YouTube, Vimeo, or any video URL
                  </Text>
                </View>

                {/* Order Input */}
                <View style={styles.inputSection}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Order Position</Text>
                  <TextInput
                    value={exerciseOrder}
                    onChangeText={setExerciseOrder}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor={colors.textTertiary}
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.backgroundSecondary,
                        color: colors.text,
                        borderColor: colors.border,
                      },
                    ]}
                  />
                  <Text style={[styles.inputHint, { color: colors.textSecondary }]}>
                    Lower numbers appear first (0, 1, 2...)
                  </Text>
                </View>

                {/* Actions */}
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    onPress={() => setShowExerciseModal(false)}
                    style={[styles.resetButton, { backgroundColor: colors.backgroundSecondary }]}
                  >
                    <Ionicons name="close" size={20} color={colors.text} />
                    <Text style={[styles.resetButtonText, { color: colors.text }]}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleSaveExercise}
                    disabled={isSubmitting || !exerciseName.trim()}
                    style={[
                      styles.saveButton,
                      {
                        backgroundColor: !exerciseName.trim() ? colors.border : colors.primary,
                        opacity: (isSubmitting || !exerciseName.trim()) ? 0.6 : 1,
                      }
                    ]}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                        <Text style={styles.saveButtonText}>Save Exercise</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add Exercise Modal */}
      <Modal
        visible={showAddExerciseModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddExerciseModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Exercise</Text>
                  <TouchableOpacity
                    onPress={() => setShowAddExerciseModal(false)}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>

                {/* Plan Info */}
                {addExercisePlan && (
                  <View style={[styles.selectedExercise, { backgroundColor: colors.backgroundSecondary }]}>
                    <Ionicons name="barbell" size={20} color={colors.primary} />
                    <Text style={[styles.selectedExerciseName, { color: colors.text }]}>
                      {addExercisePlan.title}
                    </Text>
                    <View style={[styles.exerciseCountBadge, { backgroundColor: colors.primary + '20' }]}>
                      <Text style={[styles.exerciseCountText, { color: colors.primary }]}>
                        {addExercisePlan.dayOfWeek}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Exercise Name Input */}
                <View style={styles.inputSection}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Exercise Name *</Text>
                  <TextInput
                    value={newExerciseName}
                    onChangeText={setNewExerciseName}
                    placeholder="e.g., Push-ups | 10 reps x 3 sets"
                    placeholderTextColor={colors.textTertiary}
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.backgroundSecondary,
                        color: colors.text,
                        borderColor: colors.borderLight,
                      },
                    ]}
                  />
                  <Text style={[styles.inputHint, { color: colors.textSecondary }]}>
                    Include details like sets &amp; reps (e.g., &quot;Squats | 12x4&quot;)
                  </Text>
                </View>

                {/* Tutorial Link Input */}
                <View style={styles.inputSection}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Tutorial Video Link</Text>
                  <TextInput
                    value={newTutorialLink}
                    onChangeText={setNewTutorialLink}
                    placeholder="https://youtube.com/..."
                    placeholderTextColor={colors.textTertiary}
                    autoCapitalize="none"
                    keyboardType="url"
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.backgroundSecondary,
                        color: colors.text,
                        borderColor: colors.border,
                      },
                    ]}
                  />
                  <Text style={[styles.inputHint, { color: colors.textSecondary }]}>
                    YouTube, Vimeo, or any video URL
                  </Text>
                </View>

                {/* Order Input */}
                <View style={styles.inputSection}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Order Position</Text>
                  <TextInput
                    value={newExerciseOrder}
                    onChangeText={setNewExerciseOrder}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor={colors.textTertiary}
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.backgroundSecondary,
                        color: colors.text,
                        borderColor: colors.border,
                      },
                    ]}
                  />
                  <Text style={[styles.inputHint, { color: colors.textSecondary }]}>
                    Lower numbers appear first (0, 1, 2...)
                  </Text>
                </View>

                {/* Actions */}
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    onPress={() => setShowAddExerciseModal(false)}
                    style={[styles.resetButton, { backgroundColor: colors.backgroundSecondary }]}
                  >
                    <Ionicons name="close" size={20} color={colors.text} />
                    <Text style={[styles.resetButtonText, { color: colors.text }]}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleSaveNewExercise}
                    disabled={isSubmitting || !newExerciseName.trim()}
                    style={[
                      styles.saveButton,
                      {
                        backgroundColor: !newExerciseName.trim() ? colors.border : colors.primary,
                        opacity: (isSubmitting || !newExerciseName.trim()) ? 0.6 : 1,
                      }
                    ]}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons name="add" size={20} color="#FFFFFF" />
                        <Text style={styles.saveButtonText}>Add Exercise</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  infoWrapper: {
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: 4,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
  },
  section: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: -0.4,
  },
  daySection: {
    marginBottom: 24,
  },
  dayHeader: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
    paddingHorizontal: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  emptyIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  planCard: {
    marginBottom: 16,
    borderRadius: 20,
    padding: 20,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  planLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  planIconBadge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planInfo: {
    flex: 1,
    gap: 4,
    justifyContent: 'center',
    paddingRight: 12,
  },
  planName: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  planExerciseCount: {
    fontSize: 13,
    fontWeight: '500',
  },
  editButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseList: {
    gap: 0,
    paddingTop: 16,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  exercisePreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  exercisePreviewNumber: {
    fontSize: 13,
    fontWeight: '700',
    width: 24,
    textAlign: 'center',
  },
  exercisePreviewName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  moreExercises: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
    paddingLeft: 36,
  },
  exerciseCard: {
    padding: 16,
    marginBottom: 12,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exerciseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  orderBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderText: {
    fontSize: 14,
    fontWeight: '700',
  },
  exerciseInfo: {
    flex: 1,
    gap: 4,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: '600',
  },
  planTitle: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 12,
  },

  exerciseFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  tutorialText: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    flex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedExercise: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  selectedExerciseName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  exerciseCountBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  exerciseCountText: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  daySelector: {
    marginHorizontal: -4,
  },
  dayButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    marginHorizontal: 6,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayButtonText: {
    fontSize: 15,
  },
  input: {
    height: 54,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  inputHint: {
    fontSize: 12,
    marginTop: 6,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  resetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 12,
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 52,
    borderRadius: 16,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  addExerciseText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
