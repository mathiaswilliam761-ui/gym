import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { useWorkoutSessionStore, useWorkoutPlanStore } from '../store';
import { format } from 'date-fns';
import { useAuthStore } from '../store';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation';

export function WorkoutsScreen() {
  const { sessionHistory, loadHistory, activeSession } = useWorkoutSessionStore();
  const { plans, loadUserPlans } = useWorkoutPlanStore();
  const { user } = useAuthStore();
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'this_week' | 'this_month'>('all');

  useEffect(() => {
    if (user) {
      loadHistory(user.id);
      loadUserPlans(user.id);
    }
  }, [user]);

  const filteredSessions = sessionHistory.filter(session => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!session.name.toLowerCase().includes(query)) return false;
    }
    if (filter !== 'all') {
      const sessionDate = new Date(session.startedAt);
      const now = new Date();
      if (filter === 'this_week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (sessionDate < weekAgo) return false;
      } else if (filter === 'this_month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (sessionDate < monthAgo) return false;
      }
    }
    return true;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Workouts</Text>
        {activeSession && (
          <TouchableOpacity style={styles.activeBadge} onPress={() => navigation.navigate('ActiveWorkout')}>
            <Text style={styles.activeBadgeText}>Active Session</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search workouts..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#94A3B8"
        />
      </View>

      <View style={styles.filterContainer}>
        <FilterChip label="All" selected={filter === 'all'} onPress={() => setFilter('all')} />
        <FilterChip label="This Week" selected={filter === 'this_week'} onPress={() => setFilter('this_week')} />
        <FilterChip label="This Month" selected={filter === 'this_month'} onPress={() => setFilter('this_month')} />
      </View>

      {filteredSessions.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>💪</Text>
          <Text style={styles.emptyTitle}>No workouts yet</Text>
          <Text style={styles.emptySubtitle}>Start your first workout to see it here</Text>
          <TouchableOpacity style={styles.startButton} onPress={() => navigation.navigate('ActiveWorkout')}>
            <Text style={styles.startButtonText}>Start Workout</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredSessions}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <WorkoutHistoryItem session={item} onPress={() => navigation.navigate('WorkoutDetail', { id: item.id })} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

interface WorkoutHistoryItemProps {
  session: any;
  onPress: () => void;
}

function WorkoutHistoryItem({ session, onPress }: WorkoutHistoryItemProps) {
  const duration = session.durationSeconds ? Math.floor(session.durationSeconds / 60) : 0;
  const exerciseCount = session.exercises?.length || 0;

  return (
    <TouchableOpacity style={styles.sessionCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.sessionCardContent}>
        <View style={styles.sessionIcon}>💪</View>
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionName}>{session.name}</Text>
          <View style={styles.sessionMeta}>
            <Text style={styles.sessionMetaText}>{format(new Date(session.startedAt), 'MMM d, yyyy HH:mm')}</Text>
            <Text style={styles.sessionMetaDivider}>•</Text>
            <Text style={styles.sessionMetaText}>{duration} min</Text>
            <Text style={styles.sessionMetaDivider}>•</Text>
            <Text style={styles.sessionMetaText}>{exerciseCount} exercises</Text>
          </View>
          {session.rating && (
            <View style={styles.sessionRating}>
              {[1, 2, 3, 4, 5].map(star => (
                <Text key={star} style={styles.star}>{star <= session.rating ? '⭐' : '☆'}</Text>
              ))}
            </View>
          )}
        </View>
        <Text style={styles.sessionArrow}>›</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
  },
  activeBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
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
  sessionCard: {
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
  sessionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  sessionMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sessionMetaText: {
    fontSize: 13,
    color: '#64748B',
  },
  sessionMetaDivider: {
    fontSize: 13,
    color: '#94A3B8',
    marginHorizontal: 4,
  },
  sessionRating: {
    flexDirection: 'row',
    marginTop: 8,
  },
  star: {
    fontSize: 14,
    marginRight: 2,
  },
  sessionArrow: {
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
    marginBottom: 24,
  },
  startButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});