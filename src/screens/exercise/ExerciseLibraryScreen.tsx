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
import { useExerciseStore } from '../../store';
import { MuscleGroup, MUSCLE_GROUP_IDS } from '../../constants';
import { Exercise } from '../../types';

interface ExerciseLibraryScreenProps {
  navigation: NavigationProp<RootStackParamList, 'ExerciseLibrary'>;
  route: {
    params?: {
      muscleGroup?: MuscleGroup;
    };
  };
}

export function ExerciseLibraryScreen({ navigation, route }: ExerciseLibraryScreenProps) {
  const { params } = route;
  const { 
    exercises, 
    filteredExercises, 
    selectedMuscleGroup, 
    searchQuery, 
    loadExercises, 
    filterByMuscleGroup, 
    setSearchQuery,
    getExerciseById 
  } = useExerciseStore();

  const [localSearchQuery, setLocalSearchQuery] = useState(params?.muscleGroup ? '' : searchQuery);
  const [localMuscleGroup, setLocalMuscleGroup] = useState<MuscleGroup | null>(params?.muscleGroup || selectedMuscleGroup);
  const [sortBy, setSortBy] = useState<'name' | 'muscle' | 'difficulty' | 'equipment'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  useEffect(() => {
    setSearchQuery(localSearchQuery);
  }, [localSearchQuery, setSearchQuery]);

  useEffect(() => {
    filterByMuscleGroup(localMuscleGroup);
  }, [localMuscleGroup, filterByMuscleGroup]);

  const handleSort = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (column: typeof sortBy) => {
    if (sortBy !== column) return '↕';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const sortedExercises = useMemo(() => {
    const result = [...filteredExercises];
    
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'muscle':
          comparison = a.muscleGroup.localeCompare(b.muscleGroup);
          break;
        case 'difficulty':
          const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
          comparison = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
          break;
        case 'equipment':
          comparison = (a.equipment[0] || '').localeCompare(b.equipment[0] || '');
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [filteredExercises, sortBy, sortOrder]);

  const stats = useMemo(() => {
    const byMuscle = exercises.reduce((acc, ex) => {
      acc[ex.muscleGroup] = (acc[ex.muscleGroup] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byDifficulty = exercises.reduce((acc, ex) => {
      acc[ex.difficulty] = (acc[ex.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { byMuscle, byDifficulty, total: exercises.length };
  }, [exercises]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoiding}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.headerCard}>
            <Text style={styles.title}>Exercise Library</Text>
            <Text style={styles.subtitle}>
              {exercises.length > 0 ? `${filteredExercises.length} of ${exercises.length} exercises` : 'Loading...'}
            </Text>
          </View>

          {/* Stats Summary */}
          {exercises.length > 0 && (
            <View style={styles.statsCard}>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.total}</Text>
                  <Text style={styles.statLabel}>Total Exercises</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{Object.keys(stats.byMuscle).length}</Text>
                  <Text style={styles.statLabel}>Muscle Groups</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {stats.byDifficulty.beginner || 0}B / {stats.byDifficulty.intermediate || 0}I / {stats.byDifficulty.advanced || 0}A
                  </Text>
                  <Text style={styles.statLabel}>By Difficulty</Text>
                </View>
              </View>
            </View>
          )}

          {/* Search & Filter Bar */}
          <View style={styles.filterCard}>
            <View style={styles.searchWrapper}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search exercises..."
                placeholderTextColor="#94A3B8"
                value={localSearchQuery}
                onChangeText={setLocalSearchQuery}
                autoCapitalize="none"
              />
              {localSearchQuery && (
                <TouchableOpacity style={styles.clearButton} onPress={() => setLocalSearchQuery('')}>
                  <Text style={styles.clearButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.muscleGroupScroll}>
              {MUSCLE_GROUP_IDS.map((group) => (
                <TouchableOpacity
                  key={group}
                  style={[
                    styles.muscleGroupChip,
                    localMuscleGroup === group && styles.muscleGroupChipSelected,
                  ]}
                  onPress={() => setLocalMuscleGroup(localMuscleGroup === group ? null : group)}
                >
                  <Text style={[
                    styles.muscleGroupChipText,
                    localMuscleGroup === group && styles.muscleGroupChipTextSelected,
                  ]}>
                    {group.charAt(0).toUpperCase() + group.slice(1).replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Sort Bar */}
            <View style={styles.sortBar}>
              <Text style={styles.sortLabel}>Sort:</Text>
              <View style={styles.sortButtons}>
                {(['name', 'muscle', 'difficulty', 'equipment'] as const).map((sort) => (
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
          </View>

          {/* Results Count */}
          <View style={styles.resultsCount}>
            <Text style={styles.resultsText}>
              {filteredExercises.length} {filteredExercises.length === 1 ? 'exercise' : 'exercises'} found
            </Text>
          </View>

          {/* Exercise List */}
          {filteredExercises.length === 0 ? (
            <View style={styles.noResults}>
              <Text style={styles.noResultsIcon}>🏋️</Text>
              <Text style={styles.noResultsTitle}>No Exercises Found</Text>
              <Text style={styles.noResultsDescription}>
                Try adjusting your search or filters
              </Text>
            </View>
          ) : (
            <FlatList
              data={sortedExercises}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.exerciseCard}
                  onPress={() => navigation.navigate('ExerciseDetail', { id: item.id })}
                  activeOpacity={0.7}
                >
                  <View style={styles.exerciseCardHeader}>
                    <View style={styles.exerciseCardLeft}>
                      <View style={styles.muscleIcon}>
                        <Text style={styles.muscleIconText}>{getMuscleIcon(item.muscleGroup)}</Text>
                      </View>
                      <View style={styles.exerciseCardInfo}>
                        <Text style={styles.exerciseCardName}>{item.name}</Text>
                        <View style={styles.exerciseCardMeta}>
                          <View style={styles.metaTag}>
                            <Text style={styles.metaTagText}>{item.muscleGroup.replace('_', ' ')}</Text>
                          </View>
                          <View style={styles.metaTag}>
                            <Text style={styles.metaTagText}>
                              {item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1)}
                            </Text>
                          </View>
                          <View style={styles.metaTag}>
                            <Text style={styles.metaTagText}>{item.equipment[0] || 'Bodyweight'}</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                    <View style={styles.exerciseCardRight}>
                      <Text style={styles.exerciseCardArrow}>▶</Text>
                    </View>
                  </View>

                  {item.secondaryMuscles && item.secondaryMuscles.length > 0 && (
                    <View style={styles.secondaryMuscles}>
                      <Text style={styles.secondaryLabel}>Secondary: </Text>
                      <View style={styles.secondaryTags}>
                        {item.secondaryMuscles.map((muscle, idx) => (
                          <Text key={idx} style={styles.secondaryTag}>
                            {muscle.replace('_', ' ')}
                          </Text>
                        ))}
                      </View>
                    </View>
                  )}

                  {item.tips && item.tips.length > 0 && (
                    <View style={styles.tipsPreview}>
                      <Text style={styles.tipText}>💡 {item.tips[0]}</Text>
                    </View>
                  )}
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  muscleGroupScroll: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  muscleGroupChip: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
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
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  muscleGroupChipTextSelected: {
    color: '#2563EB',
  },
  sortBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  exerciseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  exerciseCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  exerciseCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  muscleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  muscleIconText: {
    fontSize: 24,
  },
  exerciseCardInfo: {
    flex: 1,
  },
  exerciseCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
  },
  exerciseCardMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  metaTag: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metaTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  exerciseCardRight: {
    alignItems: 'flex-end',
  },
  exerciseCardArrow: {
    fontSize: 18,
    color: '#94A3B8',
  },
  secondaryMuscles: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  secondaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6,
  },
  secondaryTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  secondaryTag: {
    fontSize: 11,
    color: '#64748B',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tipsPreview: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  tipText: {
    fontSize: 13,
    color: '#92400E',
    backgroundColor: '#FFFBEB',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  cardSeparator: {
    height: 8,
  },
});