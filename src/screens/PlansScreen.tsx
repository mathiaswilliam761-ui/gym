import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useWorkoutPlanStore } from '../store';
import { useAuthStore } from '../store';
import { GOAL_TYPES, DIFFICULTY_LEVELS } from '../constants';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation';
import { format } from 'date-fns';

export function PlansScreen() {
  const { plans, loadUserPlans, currentPlan, setCurrentPlan } = useWorkoutPlanStore();
  const { user } = useAuthStore();
  const navigation = useNavigation<any>();
  const [filter, setFilter] = useState<'all' | 'my_plans' | 'public'>('all');

  useEffect(() => {
    if (user) {
      loadUserPlans(user.id);
    }
  }, [user, loadUserPlans]);

  const filteredPlans = plans.filter(plan => {
    if (filter === 'my_plans') return plan.createdBy === user?.id;
    if (filter === 'public') return plan.isPublic && plan.createdBy !== user?.id;
    return true;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Workout Plans</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('PlanBuilder')}>
          <Text style={styles.addButtonText}>+ New Plan</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <FilterChip label="All" selected={filter === 'all'} onPress={() => setFilter('all')} />
        <FilterChip label="My Plans" selected={filter === 'my_plans'} onPress={() => setFilter('my_plans')} />
        <FilterChip label="Public" selected={filter === 'public'} onPress={() => setFilter('public')} />
      </View>

      {filteredPlans.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📅</Text>
          <Text style={styles.emptyTitle}>No plans yet</Text>
          <Text style={styles.emptySubtitle}>Create your first workout plan</Text>
          <TouchableOpacity style={styles.createButton} onPress={() => navigation.navigate('PlanBuilder')}>
            <Text style={styles.createButtonText}>Create Plan</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredPlans}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <PlanCard plan={item} onPress={() => { setCurrentPlan(item); navigation.navigate('PlanDetail', { id: item.id }); }} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

interface PlanCardProps {
  plan: any;
  onPress: () => void;
}

function PlanCard({ plan, onPress }: PlanCardProps) {
  const goalInfo = GOAL_TYPES.find(g => g.id === plan.goal);
  const difficultyColors: Record<string, string> = {
    beginner: '#059669',
    intermediate: '#D97706',
    advanced: '#DC2626',
  };

  return (
    <TouchableOpacity style={styles.planCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.planCardHeader}>
        <View style={styles.planIcon}>📅</View>
        <View style={styles.planInfo}>
          <Text style={styles.planName}>{plan.name}</Text>
          <View style={styles.planMeta}>
            <Text style={[styles.planTag, { backgroundColor: difficultyColors[plan.difficulty] + '20', color: difficultyColors[plan.difficulty] }]}>
              {plan.difficulty}
            </Text>
            <Text style={styles.planTag}>{plan.durationWeeks} weeks</Text>
            <Text style={styles.planTag}>{plan.daysPerWeek} days/week</Text>
            {goalInfo && <Text style={styles.planTag}>{goalInfo.name}</Text>}
          </View>
        </View>
        {plan.isPublic && <Text style={styles.publicBadge}>Public</Text>}
      </View>
      {plan.description && <Text style={styles.planDescription}>{plan.description}</Text>}
      <View style={styles.planFooter}>
        <Text style={styles.planUpdated}>Updated {format(new Date(plan.updatedAt), 'MMM d, yyyy')}</Text>
        <Text style={styles.planArrow}>›</Text>
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
  addButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
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
  planCard: {
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
  planCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  planIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
  },
  planMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  planTag: {
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  publicBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  planDescription: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
    marginBottom: 8,
    lineHeight: 20,
  },
  planFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 12,
  },
  planUpdated: {
    fontSize: 12,
    color: '#94A3B8',
  },
  planArrow: {
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
  createButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});