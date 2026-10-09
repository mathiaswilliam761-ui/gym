import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation';
import { useSettingsStore } from '../../store';
import { DEFAULT_NOTIFICATION_SETTINGS } from '../../types';

export function SettingsNotificationsScreen({ navigation }: { navigation: NavigationProp<RootStackParamList, 'SettingsNotifications'> }) {
  const { settings, updateSettings, loadSettings } = useSettingsStore();
  const notificationSettings = settings?.notifications || DEFAULT_NOTIFICATION_SETTINGS;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Notifications</Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Workout Reminders</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Enable Reminders</Text>
              <Text style={styles.settingDescription}>Get notified when it's time to workout</Text>
            </View>
            <Switch
              value={notificationSettings.workoutReminders}
              onValueChange={(value) => updateSettings({ 
                notifications: { ...notificationSettings, workoutReminders: value } 
              })}
              trackColor={{ false: '#E2E8F0', true: '#2563EB' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Reminder Time</Text>
              <Text style={styles.settingDescription}>When to receive workout reminders</Text>
            </View>
            <TouchableOpacity style={styles.pickerButton} onPress={() => {}}>
              <Text style={styles.pickerButtonText}>{notificationSettings.workoutReminderTime}</Text>
              <Text style={styles.pickerChevron}>▼</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Progress & Achievements</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Progress Reminders</Text>
              <Text style={styles.settingDescription}>Weekly check-in for body measurements</Text>
            </View>
            <Switch
              value={notificationSettings.progressReminders}
              onValueChange={(value) => updateSettings({ 
                notifications: { ...notificationSettings, progressReminders: value } 
              })}
              trackColor={{ false: '#E2E8F0', true: '#2563EB' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Achievement Alerts</Text>
              <Text style={styles.settingDescription}>Notify when you unlock achievements</Text>
            </View>
            <Switch
              value={notificationSettings.achievementAlerts}
              onValueChange={(value) => updateSettings({ 
                notifications: { ...notificationSettings, achievementAlerts: value } 
              })}
              trackColor={{ false: '#E2E8F0', true: '#2563EB' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Weekly Report</Text>
              <Text style={styles.settingDescription}>Summary of your week's activity</Text>
            </View>
            <Switch
              value={notificationSettings.weeklyReport}
              onValueChange={(value) => updateSettings({ 
                notifications: { ...notificationSettings, weeklyReport: value } 
              })}
              trackColor={{ false: '#E2E8F0', true: '#2563EB' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>During Workout</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Rest Timer Sound</Text>
              <Text style={styles.settingDescription}>Audio cue when rest timer completes</Text>
            </View>
            <Switch
              value={notificationSettings.restTimerSound}
              onValueChange={(value) => updateSettings({ 
                notifications: { ...notificationSettings, restTimerSound: value } 
              })}
              trackColor={{ false: '#E2E8F0', true: '#2563EB' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Rest Timer Vibration</Text>
              <Text style={styles.settingDescription}>Haptic feedback when rest timer completes</Text>
            </View>
            <Switch
              value={notificationSettings.restTimerVibration}
              onValueChange={(value) => updateSettings({ 
                notifications: { ...notificationSettings, restTimerVibration: value } 
              })}
              trackColor={{ false: '#E2E8F0', true: '#2563EB' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Permissions</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => {}} activeOpacity={0.8}>
            <Text style={styles.actionButtonText}>Manage System Notifications</Text>
          </TouchableOpacity>
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
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginTop: 16,
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
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: '#64748B',
  },
  pickerButton: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pickerButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  pickerChevron: {
    fontSize: 12,
    color: '#94A3B8',
  },
  actionButton: {
    backgroundColor: '#F8FAFC',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2563EB',
  },
});