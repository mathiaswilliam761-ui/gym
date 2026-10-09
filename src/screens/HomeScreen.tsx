import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useAuthStore, useExerciseStore, useWorkoutPlanStore, useWorkoutSessionStore, useProgressStore } from '../store';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation';
import { MUSCLE_GROUPS, GOAL_TYPES } from '../constants';
import { format } from 'date-fns';

export function HomeScreen() {
  const { user, isAuthenticated } = useAuthStore();
  const { exercises } = useExerciseStore();
  const { plans } = useWorkoutPlanStore();
  const { sessionHistory } = useWorkoutSessionStore();
  const { entries: progressEntries } = useProgressStore();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  if (!isAuthenticated || !user) {
    return (
      <View style={styles.container}>
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Welcome to GymApp</Text>
          <Text style={styles.welcomeSubtitle}>Your personal fitness companion</Text>
          <Text style={styles.welcomeNote}>Please log in to continue</Text>
        </View>
      </View>
    );
  }

  const lastWorkout = sessionHistory[0];
  const latestProgress = progressEntries[0];
  const bmi = user.weight && user.height ? (user.weight / Math.pow(user.height / 100, 2)).toFixed(1) : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>Good {getTimeOfDay()},</Text>
          <Text style={styles.nameText}>{user.name}</Text>
        </View>
        <View style={styles.avatarContainer}>
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitial}>{user.name.charAt(0).toUpperCase()}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.statsGrid}>
        <StatCard title="Workouts" value={sessionHistory.length} icon="💪" color="#2563EB" />
        <StatCard title="Exercises" value={exercises.length} icon="📖" color="#059669" />
        <StatCard title="Plans" value={plans.length} icon="📅" color="#7C3AED" />
        <StatCard title="BMI" value={bmi || '--'} icon="📊" color="#D97706" />
      </View>

      {lastWorkout && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Last Workout</Text>
          </View>
          <TouchableOpacity style={styles.workoutCard} activeOpacity={0.8}>
            <View style={styles.workoutCardContent}>
              <View style={styles.workoutIcon}>💪</View>
              <View style={styles.workoutInfo}>
                <Text style={styles.workoutName}>{lastWorkout.name}</Text>
                <Text style={styles.workoutDate}>
                  {format(new Date(lastWorkout.startedAt), 'MMM d, yyyy HH:mm')}
                  {lastWorkout.durationSeconds && ` • ${Math.floor(lastWorkout.durationSeconds / 60)} min`}
                </Text>
              </View>
              <Text style={styles.workoutArrow}>›</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
        </View>
        <View style={styles.quickStats}>
          <QuickStat label="Weight" value={user.weight ? `${user.weight} kg` : 'Not set'} />
          <QuickStat label="Height" value={user.height ? `${user.height} cm` : 'Not set'} />
          <QuickStat label="Age" value={user.age ? `${user.age}` : 'Not set'} />
          <QuickStat label="Goal" value={GOAL_TYPES.find(g => g.id === user.goal)?.name || 'Not set'} />
        </View>
      </View>

      {latestProgress && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Latest Progress</Text>
          </View>
          <View style={styles.progressCard}>
            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>Weight</Text>
              <Text style={styles.progressValue}>{latestProgress.weight ? `${latestProgress.weight} kg` : '--'}</Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>Body Fat</Text>
              <Text style={styles.progressValue}>{latestProgress.bodyFatPercentage ? `${latestProgress.bodyFatPercentage}%` : '--'}</Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>Muscle Mass</Text>
              <Text style={styles.progressValue}>{latestProgress.muscleMass ? `${latestProgress.muscleMass} kg` : '--'}</Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>Date</Text>
              <Text style={styles.progressValue}>{format(new Date(latestProgress.date), 'MMM d, yyyy')}</Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Muscle Groups</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.muscleScroll}>
          {MUSCLE_GROUPS.slice(0, 10).map((group) => (
            <TouchableOpacity key={group.id} style={styles.muscleChip}>
              <Text style={styles.muscleChipText}>{group.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: string;
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <View style={[styles.statCard, { borderTopColor: color }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Text style={styles.statIconText}>{icon}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );
}

interface QuickStatProps {
  label: string;
  value: string;
}

function QuickStat({ label, value }: QuickStatProps) {
  return (
    <View style={styles.quickStat}>
      <Text style={styles.quickStatLabel}>{label}</Text>
      <Text style={styles.quickStatValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  greeting: {
    flex: 1,
  },
  greetingText: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 4,
  },
  nameText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
  },
  avatarContainer: {
    width: 56,
    height: 56,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2563EB',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 4,
    ...{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIconText: {
    fontSize: 24,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  workoutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    ...{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
    },
  },
  workoutCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  workoutDate: {
    fontSize: 13,
    color: '#64748B',
  },
  workoutArrow: {
    fontSize: 20,
    color: '#94A3B8',
  },
  quickStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickStat: {
    width: '48%',
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
  quickStatLabel: {
    fontSize: 12,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  quickStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    ...{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
    },
  },
  progressItem: {
    width: '50%',
    paddingVertical: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  progressValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  muscleScroll: {
    paddingBottom: 8,
  },
  muscleChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    ...{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
    },
  },
  muscleChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0F172A',
  },
  welcomeCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: '#64748B',
    marginBottom: 24,
    textAlign: 'center',
  },
  welcomeNote: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '500',
  },
});