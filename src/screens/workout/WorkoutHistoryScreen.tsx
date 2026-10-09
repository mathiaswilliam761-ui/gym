import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation';
import { useWorkoutSessionStore } from '../../store';
import { formatDate, formatElapsed, formatVolume } from '../../hooks';

interface WorkoutHistoryScreenProps {
  navigation: NavigationProp<RootStackParamList, 'WorkoutHistory'>;
}

export function WorkoutHistoryScreen({ navigation }: WorkoutHistoryScreenProps) {
  const { sessionHistory, loadHistory } = useWorkoutSessionStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'completed' | 'in_progress'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'duration' | 'volume' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    loadHistory('current-user');
  }, [loadHistory]);

  const filteredSessions = useMemo(() => {
    let result = [...sessionHistory];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(session => 
        session.name.toLowerCase().includes(query) ||
        session.exercises.some((ex: any) => ex.exercise?.name?.toLowerCase().includes(query))
      );
    }

    // Filter by status
    if (selectedFilter === 'completed') {
      result = result.filter(session => session.completedAt);
    } else if (selectedFilter === 'in_progress') {
      result = result.filter(session => !session.completedAt);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime();
          break;
        case 'duration':
          const aDuration = a.completedAt 
            ? new Date(a.completedAt).getTime() - new Date(a.startedAt).getTime()
            : Date.now() - new Date(a.startedAt).getTime();
          const bDuration = b.completedAt 
            ? new Date(b.completedAt).getTime() - new Date(b.startedAt).getTime()
            : Date.now() - new Date(b.startedAt).getTime();
          comparison = aDuration - bDuration;
          break;
        case 'volume':
          const aVolume = a.exercises.reduce((sum: number, ex: any) => 
            sum + ex.sets.reduce((s: number, set: any) => s + (set.weight || 0) * (set.reps || 0), 0), 0);
          const bVolume = b.exercises.reduce((sum: number, ex: any) => 
            sum + ex.sets.reduce((s: number, set: any) => s + (set.weight || 0) * (set.reps || 0), 0), 0);
          comparison = aVolume - bVolume;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [sessionHistory, searchQuery, selectedFilter, sortBy, sortOrder]);

  const handleSort = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (column: typeof sortBy) => {
    if (sortBy !== column) return '↕';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const stats = useMemo(() => {
    const completed = sessionHistory.filter(s => s.completedAt);
    const totalWorkouts = completed.length;
    const totalVolume = completed.reduce((sum, session) => 
      sum + session.exercises.reduce((s: number, ex: any) => 
        s + ex.sets.reduce((ss: number, set: any) => ss + (set.weight || 0) * (set.reps || 0), 0), 0), 0);
    const totalDuration = completed.reduce((sum, session) => 
      sum + (session.durationSeconds || 0), 0);
    const avgVolume = totalWorkouts > 0 ? totalVolume / totalWorkouts : 0;

    return { totalWorkouts, totalVolume, totalDuration, avgVolume };
  }, [sessionHistory]);

  if (sessionHistory.length === 0 && !isSearchFocused) {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoiding}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.headerCard}>
              <Text style={styles.title}>Workout History</Text>
              <Text style={styles.subtitle}>Your workout journey starts here</Text>
            </View>

            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💪</Text>
              <Text style={styles.emptyTitle}>No Workouts Yet</Text>
              <Text style={styles.emptyDescription}>
                Start your first workout to see your history here
              </Text>
              <TouchableOpacity style={styles.startButton} onPress={() => navigation.navigate('ActiveWorkout', { planId: '', dayId: '' })} activeOpacity={0.8}>
                <Text style={styles.startButtonText}>Start Workout</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoiding}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Header with Stats */}
          <View style={styles.headerCard}>
            <View style={styles.headerTop}>
              <Text style={styles.title}>Workout History</Text>
              <TouchableOpacity style={styles.filterButton} onPress={() => setIsSearchFocused(true)}>
                <Text style={styles.filterButtonText}>🔍</Text>
              </TouchableOpacity>
            </View>

            {/* Stats Summary */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Total Workouts</Text>
                <Text style={styles.statValue}>{stats.totalWorkouts}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Total Volume</Text>
                <Text style={styles.statValue}>{formatVolume(stats.totalVolume)}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Total Time</Text>
                <Text style={styles.statValue}>{formatElapsed(stats.totalDuration)}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Avg Volume</Text>
                <Text style={styles.statValue}>{formatVolume(stats.avgVolume)}</Text>
              </View>
            </View>
          </View>

          {/* Search & Filter Bar */}
          <View style={styles.filterCard}>
            <View style={styles.searchWrapper}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search workouts, exercises..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                autoCapitalize="none"
              />
              {searchQuery && (
                <TouchableOpacity style={styles.clearButton} onPress={() => setSearchQuery('')}>
                  <Text style={styles.clearButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.filterChips}>
              {(['all', 'completed', 'in_progress'] as const).map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterChip,
                    selectedFilter === filter && styles.filterChipSelected,
                  ]}
                  onPress={() => setSelectedFilter(filter)}
                >
                  <Text style={[
                    styles.filterChipText,
                    selectedFilter === filter && styles.filterChipTextSelected,
                  ]}>
                    {filter === 'all' ? 'All' : filter === 'completed' ? '✓ Done' : '⏱ Active'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sort Bar */}
          <View style={styles.sortBar}>
            <Text style={styles.sortLabel}>Sort:</Text>
            <View style={styles.sortButtons}>
              {(['date', 'duration', 'volume', 'name'] as const).map((sort) => (
                <TouchableOpacity
                  key={sort}
                  style={[
                    styles.sortButton,
                    sortBy === sort && styles.sortButtonActive,
                  ]}
                  onPress={() => handleSort(sort)}
                >
                  <Text style={[
                    styles.sortButtonText,
                    sortBy === sort && styles.sortButtonTextActive,
                  ]}>
                    {sort.charAt(0).toUpperCase() + sort.slice(1)} {getSortIcon(sort)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Results Count */}
          <View style={styles.resultsCount}>
            <Text style={styles.resultsText}>
              {filteredSessions.length} {filteredSessions.length === 1 ? 'workout' : 'workouts'} found
            </Text>
          </View>

          {/* Workout List */}
          {filteredSessions.length === 0 ? (
            <View style={styles.noResults}>
              <Text style={styles.noResultsIcon}>🔍</Text>
              <Text style={styles.noResultsTitle}>No Workouts Found</Text>
              <Text style={styles.noResultsDescription}>
                Try adjusting your search or filters
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredSessions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.workoutCard}
                  onPress={() => navigation.navigate('WorkoutDetail', { id: item.id })}
                  activeOpacity={0.7}
                >
                  <View style={styles.workoutCardHeader}>
                    <View style={styles.workoutCardLeft}>
                      <View style={[
                        styles.statusBadge,
                        item.completedAt ? styles.statusBadgeCompleted : styles.statusBadgeActive,
                      ]}>
                        <Text style={[
                          styles.statusBadgeText,
                          item.completedAt ? styles.statusBadgeTextCompleted : styles.statusBadgeTextActive,
                        ]}>
                          {item.completedAt ? '✓' : '⏱'}
                        </Text>
                      </View>
                      <View style={styles.workoutCardInfo}>
                        <Text style={styles.workoutCardName}>{item.name}</Text>
                        <View style={styles.workoutCardMeta}>
                          <Text style={styles.workoutCardDate}>{formatDate(item.startedAt)}</Text>
                          <Text style={styles.workoutCardSeparator}>•</Text>
                          <Text style={styles.workoutCardTime}>
                            {item.completedAt && item.durationSeconds 
                              ? formatElapsed(item.durationSeconds)
                              : 'In progress'}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.workoutCardRight}>
                      <Text style={styles.workoutCardVolume}>
                        {formatVolume(item.exercises.reduce((sum: number, ex: any) => 
                          sum + ex.sets.reduce((s: number, set: any) => s + (set.weight || 0) * (set.reps || 0), 0), 0))}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.workoutCardExercises}>
                    {item.exercises.slice(0, 3).map((ex: any, idx: number) => (
                      <View key={idx} style={styles.exercisePreview}>
                        <Text style={styles.exercisePreviewName}>{ex.exercise?.name || ex.exerciseId}</Text>
                        <Text style={styles.exercisePreviewSets}>
                          {ex.sets.filter((s: any) => s.completed).length}/{ex.sets.length} sets
                        </Text>
                      </View>
                    ))}
                    {item.exercises.length > 3 && (
                      <Text style={styles.exercisePreviewMore}>
                        +{item.exercises.length - 3} more
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.cardSeparator} />}
              ListHeaderComponent={<View style={{ height: 8 }} />}
              ListFooterComponent={<View style={{ height: 24 }} />}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    marginTop: 4,
  },
  filterButton: {
    padding: 8,
  },
  filterButtonText: {
    fontSize: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
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
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  filterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
    paddingVertical: 10,
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 18,
    color: '#94A3B8',
  },
  filterChips: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterChip: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipSelected: {
    backgroundColor: '#DBEAFE',
    borderColor: '#2563EB',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  filterChipTextSelected: {
    color: '#2563EB',
  },
  sortBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sortLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sortButton: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sortButtonActive: {
    backgroundColor: '#DBEAFE',
    borderColor: '#2563EB',
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  sortButtonTextActive: {
    color: '#2563EB',
  },
  resultsCount: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultsText: {
    fontSize: 13,
    color: '#64748B',
  },
  noResults: {
    padding: 48,
    alignItems: 'center',
  },
  noResultsIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  noResultsDescription: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
  },
  workoutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  workoutCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  workoutCardLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
  },
  statusBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  statusBadgeCompleted: {
    backgroundColor: '#D1FAE5',
  },
  statusBadgeActive: {
    backgroundColor: '#DBEAFE',
  },
  statusBadgeText: {
    fontSize: 16,
  },
  statusBadgeTextCompleted: {
    color: '#059669',
  },
  statusBadgeTextActive: {
    color: '#2563EB',
  },
  workoutCardInfo: {
    flex: 1,
  },
  workoutCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  workoutCardMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  workoutCardDate: {
    fontSize: 12,
    color: '#64748B',
  },
  workoutCardSeparator: {
    fontSize: 12,
    color: '#94A3B8',
  },
  workoutCardTime: {
    fontSize: 12,
    color: '#64748B',
  },
  workoutCardRight: {
    alignItems: 'flex-end',
  },
  workoutCardVolume: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: 'monospace',
  },
  workoutCardExercises: {
    gap: 6,
  },
  exercisePreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  exercisePreviewName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  exercisePreviewSets: {
    fontSize: 12,
    color: '#64748B',
  },
  exercisePreviewMore: {
    fontSize: 12,
    color: '#94A3B8',
    paddingLeft: 4,
  },
  cardSeparator: {
    height: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  startButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});