import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { useAuthStore, useWorkoutSessionStore, useProgressStore, useNutritionStore, useCardioStore, useAchievementStore } from '../store';
import { useSettingsStore } from '../store';
import { format } from 'date-fns';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation';

export function ProfileScreen() {
  const { user, isAuthenticated, logout, updateProfile } = useAuthStore();
  const { sessionHistory } = useWorkoutSessionStore();
  const { entries: progressEntries } = useProgressStore();
  const { entries: nutritionEntries } = useNutritionStore();
  const { cardioHistory } = useCardioStore();
  const { achievements } = useAchievementStore();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    if (user) {
      useWorkoutSessionStore.getState().loadHistory(user.id);
      useProgressStore.getState().loadProgress(user.id);
      useNutritionStore.getState().loadNutrition(user.id);
      useCardioStore.getState().loadHistory(user.id);
      useAchievementStore.getState().loadAchievements(user.id);
    }
  }, [user]);

  if (!isAuthenticated || !user) {
    return (
      <View style={styles.container}>
        <View style={styles.authCard}>
          <Text style={styles.authTitle}>Welcome to GymApp</Text>
          <Text style={styles.authSubtitle}>Log in to track your fitness journey</Text>
          <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.registerButton} onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const totalWorkouts = sessionHistory.length;
  const totalCardio = cardioHistory.length;
  const totalNutrition = nutritionEntries.length;
  const latestProgress = progressEntries[0];
  const bmi = user.weight && user.height ? (user.weight / Math.pow(user.height / 100, 2)).toFixed(1) : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitial}>{user.name.charAt(0).toUpperCase()}</Text>
            </View>
          )}
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <ProfileStat label="Workouts" value={totalWorkouts} />
        <ProfileStat label="Cardio" value={totalCardio} />
        <ProfileStat label="Meals Logged" value={totalNutrition} />
        <ProfileStat label="Achievements" value={achievements.length} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Body Stats</Text>
        <View style={styles.bodyStats}>
          <BodyStatItem label="Weight" value={user.weight ? `${user.weight} kg` : 'Not set'} />
          <BodyStatItem label="Height" value={user.height ? `${user.height} cm` : 'Not set'} />
          <BodyStatItem label="Age" value={user.age ? `${user.age}` : 'Not set'} />
          <BodyStatItem label="BMI" value={bmi ? `${bmi}` : 'Not set'} />
          <BodyStatItem label="Goal" value={user.goal ? user.goal.replace('_', ' ') : 'Not set'} />
          <BodyStatItem label="Activity" value={user.activityLevel ? user.activityLevel.replace('_', ' ') : 'Not set'} />
        </View>
      </View>

      {latestProgress && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Latest Progress</Text>
          <View style={styles.latestProgress}>
            <ProgressItem label="Weight" value={latestProgress.weight ? `${latestProgress.weight} kg` : '--'} />
            <ProgressItem label="Body Fat" value={latestProgress.bodyFatPercentage ? `${latestProgress.bodyFatPercentage}%` : '--'} />
            <ProgressItem label="Muscle Mass" value={latestProgress.muscleMass ? `${latestProgress.muscleMass} kg` : '--'} />
            <ProgressItem label="Date" value={format(new Date(latestProgress.date), 'MMM d, yyyy')} />
          </View>
        </View>
      )}

      {achievements.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Achievements</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.achievementsScroll}>
            {achievements.slice(0, 5).map(achievement => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.settingsList}>
          <SettingItem title="Edit Profile" icon="👤" onPress={() => navigation.navigate('Settings')} />
          <SettingItem title="Workout Settings" icon="⚙️" onPress={() => navigation.navigate('Settings')} />
          <SettingItem title="Nutrition Goals" icon="🎯" onPress={() => navigation.navigate('Settings')} />
          <SettingItem title="Notifications" icon="🔔" onPress={() => navigation.navigate('Settings')} />
          <SettingItem title="Units & Theme" icon="🌓" onPress={() => navigation.navigate('Settings')} />
          <SettingItem title="Backup & Sync" icon="☁️" onPress={() => navigation.navigate('Settings')} />
          <SettingItem title="Privacy" icon="🔒" onPress={() => navigation.navigate('Settings')} />
          <SettingItem title="Help & Support" icon="❓" onPress={() => {}} />
          <SettingItem title="Logout" icon="🚪" onPress={logout} destructive />
        </View>
      </View>
    </ScrollView>
  );
}

interface ProfileStatProps {
  label: string;
  value: number | string;
}

function ProfileStat({ label, value }: ProfileStatProps) {
  return (
    <View style={styles.profileStat}>
      <Text style={styles.profileStatValue}>{value}</Text>
      <Text style={styles.profileStatLabel}>{label}</Text>
    </View>
  );
}

interface BodyStatItemProps {
  label: string;
  value: string;
}

function BodyStatItem({ label, value }: BodyStatItemProps) {
  return (
    <View style={styles.bodyStatItem}>
      <Text style={styles.bodyStatLabel}>{label}</Text>
      <Text style={styles.bodyStatValue}>{value}</Text>
    </View>
  );
}

interface ProgressItemProps {
  label: string;
  value: string;
}

function ProgressItem({ label, value }: ProgressItemProps) {
  return (
    <View style={styles.progressItem}>
      <Text style={styles.progressItemLabel}>{label}</Text>
      <Text style={styles.progressItemValue}>{value}</Text>
    </View>
  );
}

interface AchievementCardProps {
  achievement: any;
}

function AchievementCard({ achievement }: AchievementCardProps) {
  return (
    <View style={styles.achievementCard}>
      <Text style={styles.achievementIcon}>{achievement.icon}</Text>
      <Text style={styles.achievementTitle}>{achievement.title}</Text>
      <Text style={styles.achievementDescription}>{achievement.description}</Text>
      <Text style={styles.achievementDate}>{format(new Date(achievement.earnedAt), 'MMM d, yyyy')}</Text>
    </View>
  );
}

interface SettingItemProps {
  title: string;
  icon: string;
  onPress: () => void;
  destructive?: boolean;
}

function SettingItem({ title, icon, onPress, destructive }: SettingItemProps) {
  return (
    <TouchableOpacity style={[styles.settingItem, destructive && styles.settingItemDestructive]} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.settingIcon}>{icon}</Text>
      <Text style={[styles.settingTitle, destructive && styles.settingTitleDestructive]}>{title}</Text>
      <Text style={styles.settingArrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { paddingBottom: 32 },
  profileHeader: { alignItems: 'center', paddingTop: 24, paddingBottom: 16, backgroundColor: '#FFFFFF', ...{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 } },
  avatarContainer: { width: 96, height: 96, borderRadius: 48, marginBottom: 16 },
  avatar: { width: 96, height: 96, borderRadius: 48 },
  avatarPlaceholder: { backgroundColor: '#DBEAFE', justifyContent: 'center', alignItems: 'center' },
  avatarInitial: { fontSize: 36, fontWeight: '700', color: '#2563EB' },
  name: { fontSize: 24, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  email: { fontSize: 16, color: '#64748B', marginBottom: 12 },
  roleBadge: { backgroundColor: '#EDE9FE', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  roleText: { fontSize: 13, fontWeight: '600', color: '#7C3AED' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 24, backgroundColor: '#FFFFFF', marginTop: 16, ...{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 } },
  profileStat: { alignItems: 'center' },
  profileStatValue: { fontSize: 24, fontWeight: '700', color: '#0F172A' },
  profileStatLabel: { fontSize: 12, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 },
  section: { marginHorizontal: 16, marginTop: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 16 },
  bodyStats: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  bodyStatItem: { width: '48%', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12, ...{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 } },
  bodyStatLabel: { fontSize: 12, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  bodyStatValue: { fontSize: 16, fontWeight: '600', color: '#0F172A' },
  latestProgress: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  progressItem: { width: '48%', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12, ...{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 } },
  progressItemLabel: { fontSize: 12, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  progressItemValue: { fontSize: 16, fontWeight: '600', color: '#0F172A' },
  achievementsScroll: { paddingHorizontal: 16, gap: 12, paddingBottom: 8 },
  achievementCard: { width: 140, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, alignItems: 'center', ...{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 } },
  achievementIcon: { fontSize: 32, marginBottom: 8 },
  achievementTitle: { fontSize: 13, fontWeight: '600', color: '#0F172A', textAlign: 'center', marginBottom: 4 },
  achievementDescription: { fontSize: 11, color: '#64748B', textAlign: 'center', marginBottom: 4 },
  achievementDate: { fontSize: 10, color: '#94A3B8', textAlign: 'center' },
  settingsList: { backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden', ...{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 } },
  settingItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  settingItemDestructive: { borderBottomWidth: 0 },
  settingIcon: { fontSize: 20, marginRight: 16 },
  settingTitle: { flex: 1, fontSize: 16, fontWeight: '500', color: '#0F172A' },
  settingTitleDestructive: { color: '#DC2626' },
  settingArrow: { fontSize: 20, color: '#94A3B8' },
  authCard: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, margin: 16, backgroundColor: '#FFFFFF', borderRadius: 16, ...{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 } },
  authTitle: { fontSize: 28, fontWeight: '700', color: '#0F172A', marginBottom: 8, textAlign: 'center' },
  authSubtitle: { fontSize: 16, color: '#64748B', textAlign: 'center', marginBottom: 24 },
  loginButton: { backgroundColor: '#2563EB', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12, width: '100%', alignItems: 'center', marginBottom: 12 },
  loginButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  registerButton: { backgroundColor: '#F8FAFC', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  registerButtonText: { fontSize: 16, fontWeight: '600', color: '#2563EB' },
});