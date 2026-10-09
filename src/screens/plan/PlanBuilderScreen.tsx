import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Modal,
  Alert,
} from 'react-native';
import { usePlanBuilderStore, DraftPlan, DraftDay, DraftExercise, ValidationError } from '../../store/planBuilder';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation';
import { GOAL_TYPES, DIFFICULTY_LEVELS, MuscleGroup } from '../../constants';

interface PlanBuilderScreenProps {
  navigation: NavigationProp<RootStackParamList, 'PlanBuilder'>;
  route: {
    params?: {
      planId?: string;
    };
  };
}

const MUSCLE_GROUPS: MuscleGroup[] = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms', 'abs', 'obliques', 'lower_back', 'glutes', 'quadriceps', 'hamstrings', 'calves', 'traps', 'lats', 'cardio'];

export function PlanBuilderScreen({ navigation, route }: PlanBuilderScreenProps) {
  const { planId } = route.params || {};
  
  const {
    draft,
    isDirty,
    startNewPlan,
    loadPlanForEditing,
    discardDraft,
    updatePlanMeta,
    addDay,
    removeDay,
    reorderDays,
    updateDay,
    addExerciseToDay,
    removeExerciseFromDay,
    reorderExercises,
    updateExerciseInDay,
    getAllExercises,
    getExercisesByMuscleGroup,
    searchExercises,
    validateDraft,
    getValidationWarnings,
    savePlan,
  } = usePlanBuilderStore();

  const [editingPlanName, setEditingPlanName] = useState(false);
  const [editingPlanDescription, setEditingPlanDescription] = useState(false);
  const [showExercisePicker, setShowExercisePicker] = useState<string | null>(null);
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroup | null>(null);

  useEffect(() => {
    startNewPlan();
  }, [startNewPlan]);

  const warnings = getValidationWarnings();
  const hasWarnings = warnings.length > 0;

  if (!draft) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingState}>
          <Text style={styles.loadingText}>Loading plan builder...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Action handlers
  const handleSave = useCallback(async () => {
    const errors = validateDraft();
    const hasErrors = errors.some(e => e.type === 'error');
    
    if (hasErrors) {
      Alert.alert(
        'Validation Error',
        errors.filter(e => e.type === 'error').map(e => e.message).join('\n'),
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      const userId = 'current-user';
      await savePlan(userId);
      Alert.alert('Success', 'Plan saved successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save plan');
    }
  }, [validateDraft, savePlan, navigation]);

  const handleGoalSelect = useCallback((goalId: string) => {
    updatePlanMeta({ goal: goalId as any });
  }, [updatePlanMeta]);

  const handleDifficultySelect = useCallback((difficulty: string) => {
    updatePlanMeta({ difficulty: difficulty as any });
  }, [updatePlanMeta]);

  const handleDurationSelect = useCallback((weeks: number) => {
    updatePlanMeta({ durationWeeks: weeks });
  }, [updatePlanMeta]);

  const handleDaysPerWeekSelect = useCallback((days: number) => {
    updatePlanMeta({ daysPerWeek: days });
    const currentDays = draft.days.length;
    if (days > currentDays) {
      for (let i = currentDays; i < days; i++) addDay();
    } else if (days < currentDays) {
      for (let i = currentDays - 1; i >= days; i--) removeDay(draft.days[i].id);
    }
  }, [draft.days.length, draft.days, addDay, removeDay, updatePlanMeta]);

  const handleAddFocus = useCallback((dayId: string, muscleId: MuscleGroup) => {
    const day = draft.days.find(d => d.id === dayId);
    if (day && !day.focus.includes(muscleId)) {
      updateDay(dayId, { focus: [...day.focus, muscleId] });
    }
  }, [draft.days, updateDay]);

  const handleClearFocus = useCallback((dayId: string) => {
    updateDay(dayId, { focus: [] });
  }, [updateDay]);

  // Alert handlers
  const handleGoalSelectAlert = () => {
    Alert.alert('Select Goal', '', [
      ...GOAL_TYPES.map(g => ({
        text: g.name,
        onPress: () => handleGoalSelect(g.id),
      })),
      { text: 'Cancel', style: 'cancel' as const },
    ]);
  };

  const handleDifficultySelectAlert = () => {
    Alert.alert('Select Difficulty', '', [
      ...['beginner', 'intermediate', 'advanced'].map(d => ({
        text: d.charAt(0).toUpperCase() + d.slice(1),
        onPress: () => handleDifficultySelect(d),
      })),
      { text: 'Cancel', style: 'cancel' as const },
    ]);
  };

  const handleDurationSelectAlert = () => {
    Alert.alert('Duration', '', [
      ...Array.from({ length: 16 }, (_, i) => i + 1).map(w => ({
        text: `${w} week${w !== 1 ? 's' : ''}`,
        onPress: () => handleDurationSelect(w),
      })),
      { text: 'Cancel', style: 'cancel' as const },
    ]);
  };

  const handleDaysPerWeekSelectAlert = () => {
    Alert.alert('Days Per Week', '', [
      ...Array.from({ length: 7 }, (_, i) => i + 1).map(d => ({
        text: `${d} day${d !== 1 ? 's' : ''}`,
        onPress: () => handleDaysPerWeekSelect(d),
      })),
      { text: 'Cancel', style: 'cancel' as const },
    ]);
  };

  const handleFocusSelectAlert = (dayId: string) => {
    const dayItem = draft.days.find(d => d.id === dayId);
    Alert.alert('Focus', '', [
      ...MUSCLE_GROUPS.map(m => ({
        text: m,
        onPress: () => {
          if (dayItem && !dayItem.focus.includes(m)) {
            updateDay(dayItem.id, { focus: [...dayItem.focus, m] });
          }
        },
      })),
      { text: 'Clear Focus', onPress: () => handleClearFocus(dayId) },
      { text: 'Cancel', style: 'cancel' as const },
    ]);
  };

  const renderExerciseRow = useCallback((exercise: DraftExercise, dayId: string, index: number) => {
    const exercises = getAllExercises();
    const exerciseInfo = exercises.find(e => e.id === exercise.exerciseId);
    
    return (
      <View style={styles.exerciseRow}>
        <TouchableOpacity
          style={styles.dragHandle}
          onPress={() => {}}
          activeOpacity={0.5}
        >
          <Text style={styles.dragHandleText}>☰</Text>
        </TouchableOpacity>

        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseName}>{exerciseInfo?.name || exercise.exerciseId}</Text>
          <View style={styles.exerciseMeta}>
            <Text style={styles.exerciseMetaItem}>{exercise.sets} × {exercise.reps}</Text>
            {exercise.restSeconds && (
              <Text style={styles.exerciseMetaItem}>{exercise.restSeconds}s rest</Text>
            )}
            {exercise.rpe && (
              <Text style={styles.exerciseMetaItem}>RPE {exercise.rpe}</Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.exerciseDeleteButton}
          onPress={() => removeExerciseFromDay(dayId, exercise.id)}
          activeOpacity={0.8}
        >
          <Text style={styles.deleteButtonText}>🗑</Text>
        </TouchableOpacity>
      </View>
    );
  }, [getAllExercises, removeExerciseFromDay]);

  const renderDay = useCallback(({ item: day }: { item: DraftDay }) => (
    <TouchableOpacity
      style={styles.dayCard}
      onPress={() => {}}
      activeOpacity={0.9}
    >
      <View>
        <View style={styles.dayHeader}>
          <View style={styles.dayHeaderLeft}>
            <View style={styles.dayNumberBadge}>
              <Text style={styles.dayNumberText}>Day {day.dayIndex + 1}</Text>
            </View>
            <View style={styles.dayHeaderInfo}>
              <TextInput
                style={styles.dayNameInput}
                value={day.name}
                placeholder="Day Name"
                placeholderTextColor="#94A3B8"
                onChangeText={(val) => updateDay(day.id, { name: val })}
                editable={true}
                maxLength={30}
              />
              <View style={styles.focusTags}>
                {day.focus.map((muscle, idx) => (
                  <View key={idx} style={styles.focusTag}>
                    <Text style={styles.focusTagText}>{muscle}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.dayDeleteButton}
            onPress={() => Alert.alert('Delete Day', 'Remove this workout day?', [
              { text: 'Cancel' },
              { text: 'Delete', onPress: () => removeDay(day.id), style: 'destructive' },
            ])}
          >
            <Text style={styles.deleteButtonText}>🗑</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.focusPickerButton}
          onPress={() => handleFocusSelectAlert(day.id)}
        >
          <Text style={styles.focusPickerText}>+ Add Focus</Text>
        </TouchableOpacity>

        {day.exercises.length === 0 ? (
          <TouchableOpacity
            style={styles.addExerciseButtonEmpty}
            onPress={() => setShowExercisePicker(day.id)}
            activeOpacity={0.8}
          >
            <Text style={styles.addExerciseButtonText}>+ Add First Exercise</Text>
          </TouchableOpacity>
        ) : (
          <View>
            <FlatList
              data={day.exercises}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => renderExerciseRow(item, day.id, index)}
              ItemSeparatorComponent={() => <View style={styles.exerciseSeparator} />}
              ListFooterComponent={
                <TouchableOpacity
                  style={styles.addExerciseButton}
                  onPress={() => setShowExercisePicker(day.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.addExerciseButtonText}>+ Add Exercise</Text>
                </TouchableOpacity>
              }
            />
          </View>
        )}

        <TouchableOpacity
          style={styles.reorderHandle}
          onPress={() => {}}
          activeOpacity={0.5}
        >
          <Text style={styles.reorderHandleText}>☰</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  ), [draft.days, updateDay, removeDay, addDay, setShowExercisePicker]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoiding}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Plan Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Plan Name *</Text>
              <TouchableOpacity
                style={[styles.textInput, editingPlanName && styles.textInputFocused]}
                onPress={() => setEditingPlanName(true)}
              >
                <TextInput
                  style={styles.textInputInner}
                  value={draft.name}
                  placeholder="e.g., 8-Week Upper/Lower Hypertrophy"
                  placeholderTextColor="#94A3B8"
                  editable={editingPlanName}
                  onChangeText={(val) => updatePlanMeta({ name: val })}
                  onFocus={() => setEditingPlanName(true)}
                  onBlur={() => setEditingPlanName(false)}
                  maxLength={60}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TouchableOpacity
                style={[styles.textInput, editingPlanDescription && styles.textInputFocused]}
                onPress={() => setEditingPlanDescription(true)}
              >
                <TextInput
                  style={[styles.textInputInner, styles.textInputMultiline]}
                  value={draft.description}
                  placeholder="Optional description of the plan..."
                  placeholderTextColor="#94A3B8"
                  editable={editingPlanDescription}
                  onChangeText={(val) => updatePlanMeta({ description: val })}
                  onFocus={() => setEditingPlanDescription(true)}
                  onBlur={() => setEditingPlanDescription(false)}
                  multiline
                  numberOfLines={3}
                  maxLength={500}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.pickerRow}>
              <View style={styles.pickerItem}>
                <Text style={styles.label}>Goal *</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={handleGoalSelectAlert}
                >
                  <View style={styles.pickerButtonContent}>
                    <Text style={styles.pickerButtonText}>
                      {GOAL_TYPES.find(g => g.id === draft.goal)?.name || 'Select Goal'}
                    </Text>
                    <Text style={styles.pickerChevron}>▼</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.pickerItem}>
                <Text style={styles.label}>Difficulty *</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={handleDifficultySelectAlert}
                >
                  <View style={styles.pickerButtonContent}>
                    <Text style={styles.pickerButtonText}>
                      {draft.difficulty.charAt(0).toUpperCase() + draft.difficulty.slice(1)}
                    </Text>
                    <Text style={styles.pickerChevron}>▼</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.pickerRow}>
              <View style={styles.pickerItem}>
                <Text style={styles.label}>Duration (Weeks) *</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={handleDurationSelectAlert}
                >
                  <View style={styles.pickerButtonContent}>
                    <Text style={styles.pickerButtonText}>{draft.durationWeeks} week{draft.durationWeeks !== 1 ? 's' : ''}</Text>
                    <Text style={styles.pickerChevron}>▼</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.pickerItem}>
                <Text style={styles.label}>Days/Week *</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={handleDaysPerWeekSelectAlert}
                >
                  <View style={styles.pickerButtonContent}>
                    <Text style={styles.pickerButtonText}>{draft.daysPerWeek} day{draft.daysPerWeek !== 1 ? 's' : ''}</Text>
                    <Text style={styles.pickerChevron}>▼</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {hasWarnings && (
            <View style={styles.warningBanner}>
              <Text style={styles.warningTitle}>⚠ Validation Warnings</Text>
              {warnings.map((warning, index) => (
                <View key={index} style={styles.warningItem}>
                  <Text style={styles.warningText}>{warning.message}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Workout Days ({draft.days.length}/{draft.daysPerWeek})</Text>
              {draft.days.length < draft.daysPerWeek && (
                <TouchableOpacity
                  style={styles.addDayButton}
                  onPress={() => addDay()}
                  activeOpacity={0.8}
                >
                  <Text style={styles.addDayButtonText}>+ Add Day</Text>
                </TouchableOpacity>
              )}
            </View>

            {draft.days.length === 0 ? (
              <View style={styles.emptyDays}>
                <Text style={styles.emptyDaysText}>No workout days yet</Text>
                <Text style={styles.emptyDaysSubtext}>Add your first workout day to get started</Text>
              </View>
            ) : (
              <FlatList
                data={draft.days}
                keyExtractor={(item) => item.id}
                renderItem={renderDay}
                ItemSeparatorComponent={() => <View style={styles.daySeparator} />}
                ListHeaderComponent={<View style={{ height: 8 }} />}
                ListFooterComponent={<View style={{ height: 100 }} />}
              />
            )}
          </View>

          <TouchableOpacity
            style={[styles.saveButton, isDirty && styles.saveButtonDirty]}
            onPress={handleSave}
            activeOpacity={0.8}
            disabled={!isDirty}
          >
            <Text style={[
              styles.saveButtonText,
              isDirty ? styles.saveButtonTextActive : styles.saveButtonTextDisabled,
            ]}>
              {isDirty ? 'Save Plan' : 'No Changes to Save'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {showExercisePicker && (
        <Modal
          visible={true}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowExercisePicker(null)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Exercise</Text>
              <TouchableOpacity onPress={() => setShowExercisePicker(null)} style={styles.modalClose}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalFilter}>
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search exercises..."
                placeholderTextColor="#94A3B8"
                value={exerciseSearchQuery}
                onChangeText={setExerciseSearchQuery}
              />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.muscleGroupScroll}>
                <TouchableOpacity
                  style={[styles.muscleGroupChip, !selectedMuscleGroup && styles.muscleGroupChipSelected]}
                  onPress={() => setSelectedMuscleGroup(null)}
                >
                  <Text style={[styles.muscleGroupChipText, !selectedMuscleGroup && styles.muscleGroupChipTextSelected]}>All</Text>
                </TouchableOpacity>
                {MUSCLE_GROUPS.map((group) => (
                  <TouchableOpacity
                    key={group}
                    style={[styles.muscleGroupChip, selectedMuscleGroup === group && styles.muscleGroupChipSelected]}
                    onPress={() => setSelectedMuscleGroup(group)}
                  >
                    <Text style={[styles.muscleGroupChipText, selectedMuscleGroup === group && styles.muscleGroupChipTextSelected]}>
                      {group}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <FlatList
              data={selectedMuscleGroup 
                ? getExercisesByMuscleGroup(selectedMuscleGroup)
                : exerciseSearchQuery
                  ? searchExercises(exerciseSearchQuery)
                  : getAllExercises()
              }
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.exercisePickerItem}
                  onPress={() => {
                    if (showExercisePicker) {
                      addExerciseToDay(showExercisePicker, item.id);
                      setShowExercisePicker(null);
                      setExerciseSearchQuery('');
                    }
                  }}
                >
                  <View style={styles.exercisePickerItemLeft}>
                    <Text style={styles.exercisePickerName}>{item.name}</Text>
                    <Text style={styles.exercisePickerMeta}>
                      {item.muscleGroup} • {item.equipment.join(', ')} • {item.difficulty}
                    </Text>
                  </View>
                  <Text style={styles.exercisePickerDifficulty}>+</Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.modalListContent}
            />
          </SafeAreaView>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardAvoiding: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 56,
  },
  textInputFocused: {
    borderColor: '#2563EB',
    backgroundColor: '#FFFFFF',
  },
  textInputInner: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  textInputMultiline: {
    minHeight: 100,
    paddingTop: 14,
    textAlignVertical: 'top',
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  pickerItem: {
    flex: 1,
  },
  pickerButton: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'center',
  },
  pickerButtonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#0F172A',
  },
  pickerChevron: {
    fontSize: 12,
    color: '#94A3B8',
  },
  addDayButton: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addDayButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  warningBanner: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 8,
  },
  warningItem: {
    paddingVertical: 4,
    paddingLeft: 4,
  },
  warningText: {
    fontSize: 13,
    color: '#92400E',
  },
  dayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dayNumberBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayNumberText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  dayHeaderInfo: {
    flex: 1,
  },
  dayNameInput: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  focusTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  focusTag: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  focusTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7C3AED',
  },
  dayDeleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 18,
  },
  focusPickerButton: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  focusPickerText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#2563EB',
  },
  emptyDays: {
    padding: 32,
    alignItems: 'center',
  },
  emptyDaysText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  emptyDaysSubtext: {
    fontSize: 14,
    color: '#64748B',
  },
  daySeparator: {
    height: 16,
  },
  exerciseSeparator: {
    height: 8,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  dragHandle: {
    padding: 12,
  },
  dragHandleText: {
    fontSize: 20,
    color: '#94A3B8',
  },
  exerciseInfo: {
    flex: 1,
    marginHorizontal: 8,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  exerciseMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  exerciseMetaItem: {
    fontSize: 12,
    color: '#64748B',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  exerciseDeleteButton: {
    padding: 8,
  },
  addExerciseButton: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  addExerciseButtonEmpty: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    marginTop: 8,
  },
  addExerciseButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  reorderHandle: {
    padding: 12,
    alignSelf: 'center',
    marginTop: 8,
  },
  reorderHandleText: {
    fontSize: 20,
    color: '#94A3B8',
  },
  saveButton: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 32,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
  },
  saveButtonDirty: {
    backgroundColor: '#2563EB',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#94A3B8',
  },
  saveButtonTextActive: {
    color: '#FFFFFF',
  },
  saveButtonTextDisabled: {
    color: '#94A3B8',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalClose: {
    padding: 8,
  },
  modalCloseText: {
    fontSize: 24,
    color: '#94A3B8',
  },
  modalFilter: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalSearchInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  muscleGroupScroll: {
    gap: 8,
  },
  muscleGroupChip: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  muscleGroupChipSelected: {
    backgroundColor: '#DBEAFE',
    borderColor: '#2563EB',
  },
  muscleGroupChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#475569',
  },
  muscleGroupChipTextSelected: {
    color: '#2563EB',
    fontWeight: '600',
  },
  modalListContent: {
    padding: 16,
    paddingBottom: 32,
  },
  exercisePickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  exercisePickerItemLeft: {
    flex: 1,
  },
  exercisePickerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  exercisePickerMeta: {
    fontSize: 13,
    color: '#64748B',
  },
  exercisePickerDifficulty: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2563EB',
  },
});