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
import { formatDate } from '../../hooks';

export function SettingsGeneralScreen({ navigation }: { navigation: NavigationProp<RootStackParamList, 'SettingsGeneral'> }) {
  const { settings, updateSettings, loadSettings } = useSettingsStore();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>General</Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Units</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Weight Unit</Text>
              <Text style={styles.settingDescription}>Choose your preferred weight unit</Text>
            </View>
            <TouchableOpacity style={styles.pickerButton} onPress={() => {}}>
              <Text style={styles.pickerButtonText}>{settings?.weightUnit === 'lbs' ? 'lbs' : 'kg'}</Text>
              <Text style={styles.pickerChevron}>▼</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Height Unit</Text>
              <Text style={styles.settingDescription}>Choose your preferred height unit</Text>
            </View>
            <TouchableOpacity style={styles.pickerButton} onPress={() => {}}>
              <Text style={styles.pickerButtonText}>{settings?.heightUnit === 'ft' ? 'ft/in' : 'cm'}</Text>
              <Text style={styles.pickerChevron}>▼</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Distance Unit</Text>
              <Text style={styles.settingDescription}>Choose your preferred distance unit</Text>
            </View>
            <TouchableOpacity style={styles.pickerButton} onPress={() => {}}>
              <Text style={styles.pickerButtonText}>{settings?.distanceUnit === 'mi' ? 'mi' : 'km'}</Text>
              <Text style={styles.pickerChevron}>▼</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Energy Unit</Text>
              <Text style={styles.settingDescription}>Choose your preferred energy unit</Text>
            </View>
            <TouchableOpacity style={styles.pickerButton} onPress={() => {}}>
              <Text style={styles.pickerButtonText}>{settings?.energyUnit === 'kcal' ? 'kcal' : 'kJ'}</Text>
              <Text style={styles.pickerChevron}>▼</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>App Preferences</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Auto-start Rest Timer</Text>
              <Text style={styles.settingDescription}>Automatically start rest timer after completing a set</Text>
            </View>
            <Switch
              value={settings?.autoStartRestTimer || false}
              onValueChange={(value) => updateSettings({ autoStartRestTimer: value })}
              trackColor={{ false: '#E2E8F0', true: '#2563EB' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Haptic Feedback</Text>
              <Text style={styles.settingDescription}>Vibration feedback for set completion and timers</Text>
            </View>
            <Switch
              value={settings?.hapticFeedback !== false}
              onValueChange={(value) => updateSettings({ hapticFeedback: value })}
              trackColor={{ false: '#E2E8F0', true: '#2563EB' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Sound Effects</Text>
              <Text style={styles.settingDescription}>Audio cues for rest timer and milestones</Text>
            </View>
            <Switch
              value={settings?.soundEnabled !== false}
              onValueChange={(value) => updateSettings({ soundEnabled: value })}
              trackColor={{ false: '#E2E8F0', true: '#2563EB' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Keep Screen Awake</Text>
              <Text style={styles.settingDescription}>Prevent screen from locking during active workouts</Text>
            </View>
            <Switch
              value={settings?.keepScreenAwake !== false}
              onValueChange={(value) => updateSettings({ keepScreenAwake: value })}
              trackColor={{ false: '#E2E8F0', true: '#2563EB' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <TouchableOpacity style={styles.dangerButton} onPress={() => {}} activeOpacity={0.8}>
            <Text style={styles.dangerButtonText}>Export All Data</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dangerButton} onPress={() => {}} activeOpacity={0.8}>
            <Text style={styles.dangerButtonText}>Import Data</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dangerButtonDelete} onPress={() => {}} activeOpacity={0.8}>
            <Text style={styles.dangerButtonText}>Delete All Data</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <View style={styles.aboutItem}>
            <Text style={styles.aboutLabel}>Version</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>
          <View style={styles.aboutItem}>
            <Text style={styles.aboutLabel}>Build</Text>
            <Text style={styles.aboutValue}>Development</Text>
          </View>
          <View style={styles.aboutItem}>
            <Text style={styles.aboutLabel}>Platform</Text>
            <Text style={styles.aboutValue}>React Native / Expo</Text>
          </View>
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
  dangerButton: {
    backgroundColor: '#F8FAFC',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  dangerButtonDelete: {
    backgroundColor: '#FEF2F2',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  dangerButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#DC2626',
  },
  aboutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  aboutLabel: {
    fontSize: 15,
    color: '#475569',
  },
  aboutValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
});