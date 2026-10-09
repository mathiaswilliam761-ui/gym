import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { useExerciseStore } from '../store';
import { MUSCLE_GROUPS, MuscleGroup } from '../constants';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation';

export function ExercisesScreen() {
  const { exercises, filteredExercises, loadExercises, filterByMuscleGroup, setSearchQuery, selectedMuscleGroup } = useExerciseStore();
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQueryLocal] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<MuscleGroup | null>(null);

  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  useEffect(() => {
    filterByMuscleGroup(selectedGroup);
    setSearchQuery(searchQuery);
  }, [selectedGroup, searchQuery, filterByMuscleGroup, setSearchQuery]);

  const handleSearch = (text: string) => {
    setSearchQueryLocal(text);
    setSearchQuery(text);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Exercises</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search exercises..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor="#94A3B8"
        />
      </View>

      <View style={styles.muscleGroupsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.muscleGroupsScroll}>
          <FilterChip label="All" selected={!selectedGroup} onPress={() => setSelectedGroup(null)} />
          {MUSCLE_GROUPS.map((group) => (
            <FilterChip
              key={group.id}
              label={group.name}
              selected={selectedGroup === group.id}
              onPress={() => setSelectedGroup(group.id)}
            />
          ))}
        </ScrollView>
      </View>

      {filteredExercises.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📖</Text>
          <Text style={styles.emptyTitle}>No exercises found</Text>
          <Text style={styles.emptySubtitle}>Try adjusting your search or filter</Text>
        </View>
      ) : (
        <FlatList
          data={filteredExercises}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <ExerciseItem exercise={item} onPress={() => navigation.navigate('ExerciseDetail', { id: item.id })} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

interface ExerciseItemProps {
  exercise: any;
  onPress: () => void;
}

function ExerciseItem({ exercise, onPress }: ExerciseItemProps) {
  const difficultyColors: Record<string, string> = {
    beginner: '#059669',
    intermediate: '#D97706',
    advanced: '#DC2626',
  };

  return (
    <TouchableOpacity style={styles.exerciseCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.exerciseCardContent}>
        <View style={styles.exerciseIcon}>💪</View>
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          <View style={styles.exerciseMeta}>
            <Text style={styles.exerciseMuscle}>{exercise.muscleGroup}</Text>
            <Text style={styles.exerciseDivider}>•</Text>
            <Text style={styles.exerciseEquipment}>{exercise.equipment.join(', ')}</Text>
          </View>
          <View style={styles.exerciseTags}>
            <Text style={[styles.difficultyTag, { backgroundColor: difficultyColors[exercise.difficulty] + '20', color: difficultyColors[exercise.difficulty] }]}>
              {exercise.difficulty}
            </Text>
            {exercise.isCustom && (
              <Text style={styles.customTag}>Custom</Text>
            )}
          </View>
        </View>
        <Text style={styles.exerciseArrow}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

function FilterChip({ label, selected, onPress }: FilterChipProps) {
  return (
    <TouchableOpacity
      style={[styles.filterChip, selected && styles.filterChipSelected]}
      onPress={onPress}
    >
      <Text style={[styles.filterChipText, selected && styles.filterChipTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0F172A',
    ...{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
    },
  },
  muscleGroupsContainer: {
    paddingBottom: 8,
  },
  muscleGroupsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    ...{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
    },
  },
  filterChipSelected: {
    backgroundColor: '#2563EB',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#475569',
  },
  filterChipTextSelected: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  exerciseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
    },
  },
  exerciseCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  exerciseMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  exerciseMuscle: {
    fontSize: 13,
    color: '#64748B',
  },
  exerciseDivider: {
    fontSize: 13,
    color: '#94A3B8',
    marginHorizontal: 4,
  },
  exerciseEquipment: {
    fontSize: 13,
    color: '#94A3B8',
  },
  exerciseTags: {
    flexDirection: 'row',
    gap: 6,
  },
  difficultyTag: {
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    textTransform: 'capitalize',
  },
  customTag: {
    fontSize: 11,
    fontWeight: '500',
    color: '#7C3AED',
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  exerciseArrow: {
    fontSize: 20,
    color: '#94A3B8',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
});