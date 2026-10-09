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
import { DEFAULT_NOTIFICATION_SETTINGS, DEFAULT_PRIVACY_SETTINGS } from '../../types';

export function SettingsUnitsScreen({ navigation }: { navigation: NavigationProp<RootStackParamList, 'SettingsUnits'> }) {
  const { settings, updateSettings, loadSettings } = useSettingsStore();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Units</Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Measurement Units</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Weight Unit</Text>
              <Text style={styles.settingDescription}>Choose your preferred weight unit</Text>
            </View>
            <TouchableOpacity style={styles.pickerButton} onPress={() => {}}>
              <Text style={styles.pickerButtonText}>{settings?.weightUnit === 'lbs' ? 'lbs (Imperial)' : 'kg (Metric)'}</Text>
              <Text style={styles.pickerChevron}>▼</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Height Unit</Text>
              <Text style={styles.settingDescription}>Choose your preferred height unit</Text>
            </View>
            <TouchableOpacity style={styles.pickerButton} onPress={() => {}}>
              <Text style={styles.pickerButtonText}>{settings?.heightUnit === 'ft' ? 'ft/in (Imperial)' : 'cm (Metric)'}</Text>
              <Text style={styles.pickerChevron}>▼</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Distance Unit</Text>
              <Text style={styles.settingDescription}>Choose your preferred distance unit</Text>
            </View>
            <TouchableOpacity style={styles.pickerButton} onPress={() => {}}>
              <Text style={styles.pickerButtonText}>{settings?.distanceUnit === 'mi' ? 'mi (Imperial)' : 'km (Metric)'}</Text>
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
          <Text style={styles.sectionTitle}>System Preference</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Use System Locale</Text>
              <Text style={styles.settingDescription}>Automatically use device locale for units</Text>
            </View>
            <Switch
              value={settings?.units === 'metric'}
              onValueChange={(value) => updateSettings({ units: value ? 'metric' : 'imperial' })}
              trackColor={{ false: '#E2E8F0', true: '#2563EB' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Preview</Text>
          
          <View style={styles.previewGrid}>
            <View style={styles.previewItem}>
              <Text style={styles.previewLabel}>Weight</Text>
              <Text style={styles.previewValue}>
                {settings?.weightUnit === 'lbs' ? '175 lbs' : '79.4 kg'}
              </Text>
            </View>
            <View style={styles.previewItem}>
              <Text style={styles.previewLabel}>Height</Text>
              <Text style={styles.previewValue}>
                {settings?.heightUnit === 'ft' ? '5\'9"' : '175 cm'}
              </Text>
            </View>
            <View style={styles.previewItem}>
              <Text style={styles.previewLabel}>Distance</Text>
              <Text style={styles.previewValue}>
                {settings?.distanceUnit === 'mi' ? '5.0 mi' : '8.0 km'}
              </Text>
            </View>
            <View style={styles.previewItem}>
              <Text style={styles.previewLabel}>Energy</Text>
              <Text style={styles.previewValue}>
                {settings?.energyUnit === 'kcal' ? '2,500 kcal' : '10,460 kJ'}
              </Text>
            </View>
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
  previewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  previewItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  previewLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  previewValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
});