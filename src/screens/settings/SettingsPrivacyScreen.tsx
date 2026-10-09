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
import { DEFAULT_PRIVACY_SETTINGS } from '../../types';

export function SettingsPrivacyScreen({ navigation }: { navigation: NavigationProp<RootStackParamList, 'SettingsPrivacy'> }) {
  const { settings, updateSettings, loadSettings } = useSettingsStore();
  const privacySettings = settings?.privacy || DEFAULT_PRIVACY_SETTINGS;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Privacy</Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Profile Visibility</Text>
          
          <View style={styles.radioGroup}>
            {['public', 'friends', 'private'].map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.radioOption,
                  privacySettings.profileVisibility === option && styles.radioOptionSelected,
                ]}
                onPress={() => updateSettings({ 
                  privacy: { ...privacySettings, profileVisibility: option as any } 
                })}
              >
                <Text style={[
                  styles.radioLabel,
                  privacySettings.profileVisibility === option && styles.radioLabelSelected,
                ]}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </Text>
                <View style={[
                  styles.radioIndicator,
                  privacySettings.profileVisibility === option && styles.radioIndicatorSelected,
                ]} />
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={styles.radioDescription}>
            {privacySettings.profileVisibility === 'public' && 'Anyone can see your profile and workouts'}
            {privacySettings.profileVisibility === 'friends' && 'Only your friends can see your profile and workouts'}
            {privacySettings.profileVisibility === 'private' && 'Only you can see your profile and workouts'}
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Data Sharing</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Share Workouts</Text>
              <Text style={styles.settingDescription}>Allow your completed workouts to be visible to others</Text>
            </View>
            <Switch
              value={privacySettings.shareWorkouts}
              onValueChange={(value) => updateSettings({ 
                privacy: { ...privacySettings, shareWorkouts: value } 
              })}
              trackColor={{ false: '#E2E8F0', true: '#2563EB' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Share Progress</Text>
              <Text style={styles.settingDescription}>Allow your progress photos and measurements to be visible</Text>
            </View>
            <Switch
              value={privacySettings.shareProgress}
              onValueChange={(value) => updateSettings({ 
                privacy: { ...privacySettings, shareProgress: value } 
              })}
              trackColor={{ false: '#E2E8F0', true: '#2563EB' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Show in Leaderboards</Text>
              <Text style={styles.settingDescription}>Appear in community leaderboards and rankings</Text>
            </View>
            <Switch
              value={privacySettings.showInLeaderboards}
              onValueChange={(value) => updateSettings({ 
                privacy: { ...privacySettings, showInLeaderboards: value } 
              })}
              trackColor={{ false: '#E2E8F0', true: '#2563EB' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Data & Account</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => {}} activeOpacity={0.8}>
            <Text style={styles.actionButtonText}>Download My Data</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => {}} activeOpacity={0.8}>
            <Text style={styles.actionButtonText}>Request Data Deletion</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButtonDelete} onPress={() => {}} activeOpacity={0.8}>
            <Text style={styles.actionButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Legal</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => {}} activeOpacity={0.8}>
            <Text style={styles.actionButtonText}>Privacy Policy</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => {}} activeOpacity={0.8}>
            <Text style={styles.actionButtonText}>Terms of Service</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => {}} activeOpacity={0.8}>
            <Text style={styles.actionButtonText}>Cookie Policy</Text>
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
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  radioOptionSelected: {
    backgroundColor: '#DBEAFE',
    borderColor: '#2563EB',
  },
  radioLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  radioLabelSelected: {
    color: '#2563EB',
  },
  radioIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  radioIndicatorSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#2563EB',
  },
  radioDescription: {
    fontSize: 13,
    color: '#64748B',
    paddingHorizontal: 4,
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
  actionButton: {
    backgroundColor: '#F8FAFC',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  actionButtonDelete: {
    backgroundColor: '#FEF2F2',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#DC2626',
  },
});