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
import { useWorkoutPlanStore } from '../../store';
import { formatDate, formatVolume } from '../../hooks';
import { getExerciseById } from '../../db';

interface PlanDetailScreenProps {
  navigation: NavigationProp<RootStackParamList, 'PlanDetail'>;
  route: {
    params: {
      id: string;
    };
  };
}

export function PlanDetailScreen({ navigation, route }: PlanDetailScreenProps) {
  const { id } = route.params;
  const { plans, setCurrentPlan } = useWorkoutPlanStore();
  
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlan = async () => {
      const p = plans.find((pl: any) => pl.id === id) || null;
      setPlan(p);
      if (p) setCurrentPlan(p);
      setLoading(false);
    };
    loadPlan();
  }, [id, plans, setCurrentPlan]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingState}>
          <Text style={styles.loadingText}>Loading plan...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!plan) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Plan not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const totalExercises = plan.days.reduce((sum: number, day: any) => sum + day.exercises.length, 0);
  const totalSets = plan.days.reduce((sum: number, day: any) => 
    sum + day.exercises.reduce((s: number, ex: any) => s + ex.sets, 0), 0);
  const totalReps = plan.days.reduce((sum: number, day: any) => 
    sum + day.exercises.reduce((s: number, ex: any) => s + ex.sets * ex.reps, 0), 0);

  const handleStartWorkout = () => {
    navigation.navigate('ActiveWorkout', { planId: plan.id });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <View style={styles.headerInfo} />
          </View>

          <Text style={styles.planName}>{plan.name}</Text>
          {plan.description && (
            <Text style={styles.planDescription}>{plan.description}</Text>
          )}

          <View style={styles.planMeta}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Goal</Text>
              <Text style={styles.metaValue}>{plan.goal}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Difficulty</Text>
              <Text style={styles.metaValue}>
                {plan.difficulty.charAt(0).toUpperCase() + plan.difficulty.slice(1)}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Duration</Text>
              <Text style={styles.metaValue}>{plan.durationWeeks} weeks</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Frequency</Text>
              <Text style={styles.metaValue}>{plan.daysPerWeek} days/week</Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Workout Days</Text>
              <Text style={styles.statValue}>{plan.days.length}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Exercises</Text>
              <Text style={styles.statValue}>{totalExercises}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Sets</Text>
              <Text style={styles.statValue}>{totalSets}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Reps</Text>
              <Text style={styles.statValue}>{totalReps}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.startButton} onPress={handleStartWorkout} activeOpacity={0.8}>
            <Text style={styles.startButtonText}>Start Workout</Text>
          </TouchableOpacity>
        </View>

        {/* Days */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Schedule ({plan.days.length} days)</Text>
          
          <FlatList
            data={plan.days}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={styles.dayCard}
                onPress={() => {
                  // Could navigate to day detail
                }}
                activeOpacity={0.7}
              >
                <View style={styles.dayHeader}>
                  <View style={styles.dayNumberBadge}>
                    <Text style={styles.dayNumberText}>Day {index + 1}</Text>
                  </View>
                  <View style={styles.dayInfo}>
                    <Text style={styles.dayName}>{item.name || `Day ${index + 1}`}</Text>
                    <View style={styles.dayFocus}>
                      {item.focus.map((muscle: string, idx: number) => (
                        <Text key={idx} style={styles.focusTag}>{muscle}</Text>
                      ))}
                    </View>
                  </View>
                  <View style={styles.dayStats}>
                    <Text style={styles.dayStat}>
                      {item.exercises.length} exercises
                    </Text>
                    <Text style={styles.dayStat}>
                      {item.exercises.reduce((s: number, ex: any) => s + ex.sets, 0)} sets
                    </Text>
                  </View>
                </View>

                <FlatList
                  data={item.exercises}
                  keyExtractor={(ex) => ex.id}
                  renderItem={({ item: exercise }) => (
                    <View style={styles.planExerciseRow}>
                      <Text style={styles.planExerciseName}>{exercise.exercise?.name || exercise.exerciseId}</Text>
                      <View style={styles.planExerciseMeta}>
                        <Text style={styles.planExerciseSet}>{exercise.sets} × {exercise.reps}</Text>
                        {exercise.restSeconds && (
                          <Text style={styles.planExerciseRest}>{exercise.restSeconds}s</Text>
                        )}
                      </View>
                    </View>
                  )}
                  ItemSeparatorComponent={() => <View style={styles.exerciseSeparator} />}
                  ListHeaderComponent={<View style={{ height: 8 }} />}
                  ListFooterComponent={<View style={{ height: 8 }} />}
                />
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.daySeparator} />}
            ListHeaderComponent={<View style={{ height: 8 }} />}
            ListFooterComponent={<View style={{ height: 24 }} />}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 15,
    color: '#64748B',
    marginBottom: 16,
  },
  planMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  metaItem: {
    minWidth: '40%',
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: '40%',
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
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  startButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
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
  dayCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
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
  dayInfo: {
    flex: 1,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  dayFocus: {
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
  dayStats: {
    flexDirection: 'row',
    gap: 16,
  },
  dayStat: {
    fontSize: 12,
    color: '#64748B',
  },
  daySeparator: {
    height: 12,
  },
  exerciseSeparator: {
    height: 8,
  },
  planExerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  planExerciseName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
    marginRight: 12,
  },
  planExerciseMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  planExerciseSet: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  planExerciseRest: {
    fontSize: 12,
    color: '#64748B',
  },
});