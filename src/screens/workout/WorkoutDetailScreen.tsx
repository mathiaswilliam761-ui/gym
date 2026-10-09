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
import { useWorkoutSessionStore } from '../../store';
import { formatDate, formatElapsed, formatVolume } from '../../hooks';
import { getExerciseById } from '../../db';

interface WorkoutDetailScreenProps {
  navigation: NavigationProp<RootStackParamList, 'WorkoutDetail'>;
  route: {
    params: {
      id: string;
    };
  };
}

export function WorkoutDetailScreen({ navigation, route }: WorkoutDetailScreenProps) {
  const { id } = route.params;
  const { getSessionById } = useWorkoutSessionStore();
  
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      const s = getSessionById(id);
      setSession(s);
      setLoading(false);
    };
    loadSession();
  }, [id, getSessionById]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingState}>
          <Text style={styles.loadingText}>Loading workout...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Workout not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const totalSets = session.exercises.reduce((sum: number, ex: any) => sum + ex.sets.length, 0);
  const completedSets = session.exercises.reduce((sum: number, ex: any) => 
    sum + ex.sets.filter((s: any) => s.completed).length, 0);
  const totalVolume = session.exercises.reduce((sum: number, ex: any) => 
    sum + ex.sets.reduce((s: number, set: any) => s + (set.weight || 0) * (set.reps || 0), 0), 0);

  const formatSessionDuration = (startedAt: string, endedAt?: string) => {
    const start = new Date(startedAt).getTime();
    const end = endedAt ? new Date(endedAt).getTime() : Date.now();
    return formatElapsed(end - start);
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
            <View style={styles.headerInfo}>
              <Text style={styles.workoutName}>{session.name}</Text>
              <View style={styles.headerMeta}>
                <Text style={styles.metaItem}>
                  {session.completedAt ? '✓ Completed' : '⏱ In Progress'}
                </Text>
                <Text style={styles.metaItem}>
                  {formatDate(session.startedAt)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Duration</Text>
              <Text style={styles.statValue}>
                {formatSessionDuration(session.startedAt, session.completedAt)}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Exercises</Text>
              <Text style={styles.statValue}>{session.exercises.length}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Sets</Text>
              <Text style={styles.statValue}>{totalSets}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Completed</Text>
              <Text style={styles.statValue}>{completedSets}/{totalSets}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Volume</Text>
              <Text style={styles.statValue}>{formatVolume(totalVolume)}</Text>
            </View>
          </View>
        </View>

        {/* Exercises */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Exercises ({session.exercises.length})</Text>
          
          <FlatList
            data={session.exercises}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.exerciseCard}
                onPress={() => navigation.navigate('ExerciseDetail', { id: item.exerciseId })}
                activeOpacity={0.7}
              >
                <View style={styles.exerciseCardHeader}>
                  <Text style={styles.exerciseCardName}>{item.exercise?.name || item.exerciseId}</Text>
                  <View style={styles.exerciseCardMeta}>
                    {item.sets.map((set: any, idx: number) => (
                      <View key={idx} style={[
                        styles.setBadge,
                        set.completed && styles.setBadgeCompleted
                      ]}>
                        <Text style={[
                          styles.setBadgeText,
                          set.completed && styles.setBadgeTextCompleted
                        ]}>
                          {set.setNumber}: {set.completed ? '✓' : `${set.weight || 0}×${set.reps || 0}`}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.exerciseCardStats}>
                  <View style={styles.exerciseStat}>
                    <Text style={styles.exerciseStatLabel}>Sets</Text>
                    <Text style={styles.exerciseStatValue}>
                      {item.sets.filter((s: any) => s.completed).length}/{item.sets.length}
                    </Text>
                  </View>
                  <View style={styles.exerciseStat}>
                    <Text style={styles.exerciseStatLabel}>Volume</Text>
                    <Text style={styles.exerciseStatValue}>
                      {formatVolume(item.sets.reduce((s: number, set: any) => 
                        s + (set.weight || 0) * (set.reps || 0), 0))}
                    </Text>
                  </View>
                  <View style={styles.exerciseStat}>
                    <Text style={styles.exerciseStatLabel}>Max Weight</Text>
                    <Text style={styles.exerciseStatValue}>
                      {Math.max(...item.sets.map((s: any) => s.weight || 0), 0).toFixed(1)} kg
                    </Text>
                  </View>
                  {item.restSeconds && (
                    <View style={styles.exerciseStat}>
                      <Text style={styles.exerciseStatLabel}>Rest</Text>
                      <Text style={styles.exerciseStatValue}>{item.restSeconds}s</Text>
                    </View>
                  )}
                </View>

                {item.notes && (
                  <View style={styles.notes}>
                    <Text style={styles.notesLabel}>Notes</Text>
                    <Text style={styles.notesText}>{item.notes}</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.cardSeparator} />}
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
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 20,
  },
  headerInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  headerMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    fontSize: 13,
    color: '#64748B',
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
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
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
  exerciseCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  exerciseCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  exerciseCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
    marginRight: 12,
  },
  exerciseCardMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  setBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  setBadgeCompleted: {
    backgroundColor: '#D1FAE5',
    borderColor: '#059669',
  },
  setBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    fontFamily: 'monospace',
  },
  setBadgeTextCompleted: {
    color: '#059669',
  },
  exerciseCardStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  exerciseStat: {
    minWidth: 80,
  },
  exerciseStatLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  exerciseStatValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  notes: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  notesLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#475569',
  },
  cardSeparator: {
    height: 12,
  },
});