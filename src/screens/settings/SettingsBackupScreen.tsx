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

export function SettingsBackupScreen({ navigation }: { navigation: NavigationProp<RootStackParamList, 'SettingsBackup'> }) {
  const { settings, updateSettings, loadSettings } = useSettingsStore();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Backup & Sync</Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Automatic Backup</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Auto Backup</Text>
              <Text style={styles.settingDescription}>Automatically backup data to cloud</Text>
            </View>
            <Switch
              value={settings?.autoBackup !== false}
              onValueChange={(value) => updateSettings({ autoBackup: value })}
              trackColor={{ false: '#E2E8F0', true: '#2563EB' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Backup Frequency</Text>
              <Text style={styles.settingDescription}>How often to backup your data</Text>
            </View>
            <TouchableOpacity style={styles.pickerButton} onPress={() => {}}>
              <Text style={styles.pickerButtonText}>Daily</Text>
              <Text style={styles.pickerChevron}>▼</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Backup Over Wi-Fi Only</Text>
              <Text style={styles.settingDescription}>Only backup when connected to Wi-Fi</Text>
            </View>
            <Switch
              value={true}
              onValueChange={(value) => {}}
              trackColor={{ false: '#E2E8F0', true: '#2563EB' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Manual Backup</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => {}} activeOpacity={0.8}>
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionButtonIcon}>☁️</Text>
              <View style={styles.actionButtonTextContainer}>
                <Text style={styles.actionButtonTitle}>Backup Now</Text>
                <Text style={styles.actionButtonSubtitle}>Create a manual backup to cloud</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => {}} activeOpacity={0.8}>
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionButtonIcon}>📥</Text>
              <View style={styles.actionButtonTextContainer}>
                <Text style={styles.actionButtonTitle}>Restore from Backup</Text>
                <Text style={styles.actionButtonSubtitle}>Restore data from cloud backup</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => {}} activeOpacity={0.8}>
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionButtonIcon}>📁</Text>
              <View style={styles.actionButtonTextContainer}>
                <Text style={styles.actionButtonTitle}>Export Data</Text>
                <Text style={styles.actionButtonSubtitle}>Download all data as JSON file</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => {}} activeOpacity={0.8}>
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionButtonIcon}>📤</Text>
              <View style={styles.actionButtonTextContainer}>
                <Text style={styles.actionButtonTitle}>Import Data</Text>
                <Text style={styles.actionButtonSubtitle}>Import data from JSON file</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Cloud Sync</Text>
          
          <View style={styles.syncStatus}>
            <View style={styles.syncIndicator} />
            <Text style={styles.syncStatusText}>Synced 2 minutes ago</Text>
          </View>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => {}} activeOpacity={0.8}>
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionButtonIcon}>🔄</Text>
              <View style={styles.actionButtonTextContainer}>
                <Text style={styles.actionButtonTitle}>Sync Now</Text>
                <Text style={styles.actionButtonSubtitle}>Force sync with cloud</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Storage</Text>
          
          <View style={styles.storageItem}>
            <View style={styles.storageInfo}>
              <Text style={styles.storageLabel}>Local Storage</Text>
              <Text style={styles.storageDescription}>Space used on this device</Text>
            </View>
            <Text style={styles.storageValue}>12.4 MB</Text>
          </View>

          <View style={styles.storageItem}>
            <View style={styles.storageInfo}>
              <Text style={styles.storageLabel}>Cloud Storage</Text>
              <Text style={styles.storageDescription}>Space used in cloud</Text>
            </View>
            <Text style={styles.storageValue}>15.2 MB</Text>
          </View>

          <TouchableOpacity style={styles.dangerButton} onPress={() => {}} activeOpacity={0.8}>
            <Text style={styles.dangerButtonText}>Clear Local Cache</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => {}} activeOpacity={0.8}>
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionButtonIcon}>🔗</Text>
              <View style={styles.actionButtonTextContainer}>
                <Text style={styles.actionButtonTitle}>Link Cloud Account</Text>
                <Text style={styles.actionButtonSubtitle}>Connect to Google Drive / iCloud</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => {}} activeOpacity={0.8}>
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionButtonIcon}>🔐</Text>
              <View style={styles.actionButtonTextContainer}>
                <Text style={styles.actionButtonTitle}>Change Password</Text>
                <Text style={styles.actionButtonSubtitle}>Update your account password</Text>
              </View>
            </View>
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
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButtonIcon: {
    fontSize: 24,
  },
  actionButtonTextContainer: {
    flex: 1,
  },
  actionButtonTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  actionButtonSubtitle: {
    fontSize: 13,
    color: '#64748B',
  },
  syncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
    marginBottom: 12,
  },
  syncIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#059669',
  },
  syncStatusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  storageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  storageInfo: {
    flex: 1,
  },
  storageLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  storageDescription: {
    fontSize: 12,
    color: '#64748B',
  },
  storageValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  dangerButton: {
    backgroundColor: '#FEF2F2',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
    marginTop: 8,
  },
  dangerButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#DC2626',
  },
});