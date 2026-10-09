import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation';
import { useSettingsStore } from '../../store';

export function SettingsThemeScreen({ navigation }: { navigation: NavigationProp<RootStackParamList, 'SettingsTheme'> }) {
  const { settings, updateSettings, loadSettings } = useSettingsStore();
  const theme = settings?.theme || 'system';
  const accentColor = settings?.accentColor || '#2563EB';
  const fontSize = settings?.fontSize || 'medium';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Appearance</Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Theme</Text>
          
          <View style={styles.radioGroup}>
            {['light', 'dark', 'system'].map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.themeOption,
                  theme === option && styles.themeOptionSelected,
                ]}
                onPress={() => updateSettings({ theme: option as any })}
              >
                <View style={styles.themeIcon}>
                  <Text style={styles.themeIconText}>
                    {option === 'light' ? '☀️' : option === 'dark' ? '🌙' : '📱'}
                  </Text>
                </View>
                <View style={styles.themeInfo}>
                  <Text style={[
                    styles.themeLabel,
                    theme === option && styles.themeLabelSelected,
                  ]}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </Text>
                  <Text style={styles.themeDescription}>
                    {option === 'light' && 'Always use light theme'}
                    {option === 'dark' && 'Always use dark theme'}
                    {option === 'system' && 'Follow system setting'}
                  </Text>
                </View>
                <View style={[
                  styles.themeIndicator,
                  theme === option && styles.themeIndicatorSelected,
                ]} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Accent Color</Text>
          
          <View style={styles.colorGrid}>
            {['#2563EB', '#059669', '#DC2626', '#7C3AED', '#EA580C', '#0891B2'].map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  accentColor === color && styles.colorOptionSelected,
                ]}
                onPress={() => updateSettings({ accentColor: color })}
              >
                <View style={[styles.colorSwatch, { backgroundColor: color }]} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Font Size</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Text Size</Text>
              <Text style={styles.settingDescription}>Adjust app text size</Text>
            </View>
            <TouchableOpacity style={styles.pickerButton} onPress={() => {}}>
              <Text style={styles.pickerButtonText}>
                {fontSize === 'large' ? 'Large' : fontSize === 'small' ? 'Small' : 'Medium'}
              </Text>
              <Text style={styles.pickerChevron}>▼</Text>
            </TouchableOpacity>
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
  radioGroup: {
    gap: 8,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  themeOptionSelected: {
    backgroundColor: '#DBEAFE',
    borderColor: '#2563EB',
  },
  themeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  themeIconText: {
    fontSize: 24,
  },
  themeInfo: {
    flex: 1,
  },
  themeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  themeLabelSelected: {
    color: '#2563EB',
  },
  themeDescription: {
    fontSize: 13,
    color: '#64748B',
  },
  themeIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  themeIndicatorSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#2563EB',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorOptionSelected: {
    borderColor: '#0F172A',
  },
  colorSwatch: {
    width: 36,
    height: 36,
    borderRadius: 10,
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
});