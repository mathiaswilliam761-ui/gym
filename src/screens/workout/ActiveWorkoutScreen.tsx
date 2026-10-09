import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { useActiveWorkout, formatElapsed } from '../../hooks/useActiveWorkout';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface ActiveWorkoutScreenProps {
  route: {
    params: {
      sessionId: string;
    };
  };
  navigation: NavigationProp<RootStackParamList, 'ActiveWorkout'>;
}

export function ActiveWorkoutScreen({ route, navigation }: ActiveWorkoutScreenProps) {
  const { sessionId } = route.params;
  
  const {
    session,
    restTimer,
    remainingRest,
    elapsedTime,
    totalVolume,
    startRestTimer,
    cancelRestTimer,
    completeSet,
    completeWorkout,
    updateSet,
  } = useActiveWorkout(sessionId);

  const [editingWeight, setEditingWeight] = useState<string | null>(null);
  const [editingReps, setEditingReps] = useState<string | null>(null);
  const restOverlayAnim = useRef(new Animated.Value(0)).current;

  // Animate rest overlay in/out
  React.useEffect(() => {
    if (restTimer) {
      Animated.timing(restOverlayAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(restOverlayAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [restTimer]);

  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No active workout session</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Build sections for SectionList
  const sections = session.exercises.map((exercise) => ({
    title: exercise.exercise?.name || exercise.exerciseId,
    data: exercise.sets,
    exerciseId: exercise.id,
    restSeconds: exercise.restSeconds || 90,
  }));

  const renderSetRow = useCallback((
    { item, index, section }: { item: any; index: number; section: { exerciseId: string; restSeconds: number } }
  ) => {
    const set = item;
    const isCompleted = set.completed;
    const isEditingWeight = editingWeight === `${section.exerciseId}-${set.setNumber}-weight`;
    const isEditingReps = editingReps === `${section.exerciseId}-${set.setNumber}-reps`;

    return (
      <View style={styles.setRow}>
        <View style={styles.setNumberContainer}>
          <Text style={styles.setNumber}>{set.setNumber}</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.inputContainer,
            isEditingWeight && styles.inputContainerFocused,
          ]}
          onPress={() => setEditingWeight(`${section.exerciseId}-${set.setNumber}-weight`)}
          activeOpacity={1}
        >
          <TextInput
            style={styles.weightInput}
            value={set.weight ? String(set.weight) : ''}
            placeholder="Weight"
            placeholderTextColor="#94A3B8"
            keyboardType="decimal-pad"
            editable={!isCompleted}
            onChangeText={(val) => updateSet(section.exerciseId, set.setNumber, { weight: val ? parseFloat(val) : undefined })}
            onFocus={() => setEditingWeight(`${section.exerciseId}-${set.setNumber}-weight`)}
            onBlur={() => setEditingWeight(null)}
            maxLength={6}
          />
          <Text style={styles.unitLabel}>{session.exercises[0]?.sets[0]?.weight ? 'kg' : 'kg'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.inputContainer,
            isEditingReps && styles.inputContainerFocused,
          ]}
          onPress={() => setEditingReps(`${section.exerciseId}-${set.setNumber}-reps`)}
          activeOpacity={1}
        >
          <TextInput
            style={styles.repsInput}
            value={set.reps ? String(set.reps) : ''}
            placeholder="Reps"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
            editable={!isCompleted}
            onChangeText={(val) => updateSet(section.exerciseId, set.setNumber, { reps: val ? parseInt(val, 10) : undefined })}
            onFocus={() => setEditingReps(`${section.exerciseId}-${set.setNumber}-reps`)}
            onBlur={() => setEditingReps(null)}
            maxLength={3}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.completeButton,
            isCompleted && styles.completeButtonDone,
            !isCompleted && styles.completeButtonPending,
          ]}
          onPress={() => {
            if (!isCompleted) {
              const weight = set.weight || 0;
              const reps = set.reps || 0;
              completeSet(section.exerciseId, set.setNumber, weight, reps);
              startRestTimer(section.exerciseId, set.setNumber, section.restSeconds);
            } else {
              cancelRestTimer();
              updateSet(section.exerciseId, set.setNumber, { completed: false });
            }
          }}
          activeOpacity={0.8}
          disabled={false}
        >
          <Text style={[
            styles.completeButtonText,
            isCompleted && styles.completeButtonTextDone,
          ]}>
            {isCompleted ? '✓' : '○'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }, [editingWeight, editingReps, completeSet, startRestTimer, cancelRestTimer, updateSet, session]);

  const renderSectionHeader = useCallback(({ section }: { section: any }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <Text style={styles.sectionSubtitle}>
        {section.data.length} sets • {section.restSeconds}s rest
      </Text>
    </View>
  ), []);

  const handleEndWorkout = useCallback(() => {
    const completed = completeWorkout();
    if (completed) {
      navigation.navigate('WorkoutDetail', { id: completed.id });
    }
  }, [completeWorkout, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoiding}
        keyboardVerticalOffset={100}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <View>
              <Text style={styles.workoutName}>{session.name}</Text>
              <Text style={styles.elapsedTime}>
                {formatElapsed(elapsedTime)}
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.endButton}
              onPress={handleEndWorkout}
              activeOpacity={0.8}
            >
              <Text style={styles.endButtonText}>End</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Volume indicator */}
        <View style={styles.volumeBar}>
          <Text style={styles.volumeLabel}>Total Volume</Text>
          <Text style={styles.volumeValue}>
            {Math.round(totalVolume).toLocaleString()} kg
          </Text>
        </View>

        {/* Exercise List */}
        <SectionList
          sections={sections}
          renderItem={renderSetRow}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={(item, index) => item.id || String(index)}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={true}
          showsVerticalScrollIndicator={false}
        />

        {/* Rest Timer Overlay */}
        <Animated.View
          style={[
            styles.restOverlay,
            {
              transform: [
                { translateY: restOverlayAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [120, 0],
                }) },
              ],
              opacity: restOverlayAnim,
            },
          ]}
          pointerEvents={restTimer ? 'auto' : 'none'}
        >
          <View style={styles.restOverlayContent}>
            <View style={styles.restOverlayTop}>
              <Text style={styles.restOverlayLabel}>REST TIMER</Text>
              <TouchableOpacity
                style={styles.cancelRestButton}
                onPress={cancelRestTimer}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelRestText}>Cancel</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.restOverlayTime}>
              {formatTime(remainingRest)}
            </Text>
            <Text style={styles.restOverlayExercise}>
              Exercise {restTimer?.exerciseId?.slice(-4)} • Set {restTimer?.setNumber}
            </Text>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Helper to format milliseconds as MM:SS
function formatTime(ms: number): string {
  if (ms <= 0) return '0:00';
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardAvoiding: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    color: '#64748B',
    marginBottom: 16,
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563EB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerRight: {
    paddingRight: 4,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  elapsedTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
    fontFamily: 'monospace',
  },
  endButton: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  endButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },
  volumeBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  volumeLabel: {
    fontSize: 13,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  volumeValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: 'monospace',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 120, // Space for rest overlay
  },
  sectionHeader: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    backgroundColor: '#F8FAFC',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 56,
  },
  setNumberContainer: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
    fontFamily: 'monospace',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 8,
  },
  inputContainerFocused: {
    borderColor: '#2563EB',
  },
  weightInput: {
    flex: 1,
    minWidth: 80,
    minHeight: 48,
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  repsInput: {
    width: 70,
    minHeight: 48,
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  unitLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#94A3B8',
    minWidth: 36,
  },
  completeButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  completeButtonPending: {
    backgroundColor: '#DBEAFE',
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  completeButtonDone: {
    backgroundColor: '#D1FAE5',
    borderWidth: 2,
    borderColor: '#059669',
  },
  completeButtonText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2563EB',
  },
  completeButtonTextDone: {
    color: '#059669',
  },
  restOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 32,
    zIndex: 100,
  },
  restOverlayContent: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1E293B',
    ...{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  restOverlayTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  restOverlayLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cancelRestButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#1E293B',
    borderRadius: 8,
  },
  cancelRestText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  restOverlayTime: {
    fontSize: 56,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'monospace',
    textAlign: 'center',
    lineHeight: 64,
  },
  restOverlayExercise: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: -4,
  },
});