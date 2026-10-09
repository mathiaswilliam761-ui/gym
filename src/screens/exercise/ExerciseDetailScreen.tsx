import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation';
import { useExerciseStore } from '../../store';
import { formatDate, formatVolume } from '../../hooks';
import { getExerciseById } from '../../db';

interface ExerciseDetailScreenProps {
  navigation: NavigationProp<RootStackParamList, 'ExerciseDetail'>;
  route: {
    params: {
      id: string;
    };
  };
}

export function ExerciseDetailScreen({ navigation, route }: ExerciseDetailScreenProps) {
  const { id } = route.params;
  const { exercises, getExerciseById: getExerciseByIdStore } = useExerciseStore();
  
  const [exercise, setExercise] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadExercise = async () => {
      const ex = getExerciseByIdStore(id) || exercises.find((e: any) => e.id === id) || null;
      setExercise(ex);
      setLoading(false);
    };
    loadExercise();
  }, [id, exercises, getExerciseByIdStore]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingState}>
          <Text style={styles.loadingText}>Loading exercise...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!exercise) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Exercise not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerCard}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <View style={styles.exerciseIcon}>
              <Text style={styles.exerciseIconText}>{getMuscleIcon(exercise.muscleGroup)}</Text>
            </View>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            <View style={styles.exerciseTags}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{exercise.muscleGroup}</Text>
              </View>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{exercise.difficulty}</Text>
              </View>
              {exercise.equipment.length > 0 && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{exercise.equipment[0]}</Text>
                </View>
              )}
            </View>
          </View>

          {exercise.instructions && (
            <View style={styles.instructions}>
              <Text style={styles.instructionsLabel}>Instructions</Text>
              <Text style={styles.instructionsText}>{exercise.instructions}</Text>
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Exercise Details</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Muscle Group</Text>
              <Text style={styles.statValue}>{exercise.muscleGroup}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Difficulty</Text>
              <Text style={styles.statValue}>
                {exercise.difficulty.charAt(0).toUpperCase() + exercise.difficulty.slice(1)}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Equipment</Text>
              <Text style={styles.statValue}>{exercise.equipment.join(', ')}</Text>
            </View>
          </View>
        </View>

        {/* Variations / Related */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Related Exercises</Text>
          
          <FlatList
            data={exercises.filter((e: any) => e.muscleGroup === exercise.muscleGroup && e.id !== exercise.id).slice(0, 8)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.relatedExercise}
                onPress={() => navigation.navigate('ExerciseDetail', { id: item.id })}
                activeOpacity={0.7}
              >
                <Text style={styles.relatedName}>{item.name}</Text>
                <View style={styles.relatedMeta}>
                  <Text style={styles.relatedTag}>{item.difficulty}</Text>
                  <Text style={styles.relatedTag}>{item.equipment[0] || 'bodyweight'}</Text>
                </View>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.relatedSeparator} />}
            ListHeaderComponent={<View style={{ height: 8 }} />}
            ListFooterComponent={<View style={{ height: 24 }} />}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getMuscleIcon(muscleGroup: string): string {
  const icons: Record<string, string> = {
    chest: '💪',
    back: '🦁',
    shoulders: '🏋️',
    biceps: '💪',
    triceps: '💪',
    forearms: '🤲',
    abs: '🧱',
    obliques: '🧱',
    lower_back: '🏋️',
    glutes: '🍑',
    quadriceps: '🦵',
    hamstrings: '🦵',
    calves: '🦵',
    traps: '🦁',
    lats: '🦁',
    cardio: '❤️',
  };
  return icons[muscleGroup] || '💪';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
    paddingHorizontal: 12,
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
  scrollContent: {
    paddingBottom: 24,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 12,
  },
  exerciseIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  exerciseIconText: {
    fontSize: 40,
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 12,
  },
  exerciseTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  instructions: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  instructionsLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  relatedExercise: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  relatedName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  relatedMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  relatedTag: {
    fontSize: 12,
    color: '#64748B',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  relatedSeparator: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 4,
  },
});