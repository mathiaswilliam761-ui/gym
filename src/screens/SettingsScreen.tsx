import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation';

interface SettingItem {
  title: string;
  icon: string;
  screen: string | null;
  destructive?: boolean;
  disabled?: boolean;
}

interface SettingSection {
  title: string;
  items: SettingItem[];
}

export function SettingsScreen() {
  const navigation = useNavigation<any>();

  const sections: SettingSection[] = [
    {
      title: 'General',
      items: [
        { title: 'Profile', icon: '👤', screen: 'SettingsGeneral' },
        { title: 'Units', icon: '📏', screen: 'SettingsUnits' },
        { title: 'Theme', icon: '🌓', screen: 'SettingsTheme' },
        { title: 'Language', icon: '🌐', screen: null },
      ],
    },
    {
      title: 'Notifications',
      items: [
        { title: 'Workout Reminders', icon: '🔔', screen: 'SettingsNotifications' },
        { title: 'Progress Updates', icon: '📊', screen: 'SettingsNotifications' },
        { title: 'Achievements', icon: '🏆', screen: 'SettingsNotifications' },
        { title: 'Weekly Report', icon: '📅', screen: 'SettingsNotifications' },
      ],
    },
    {
      title: 'Privacy & Data',
      items: [
        { title: 'Privacy Settings', icon: '🔒', screen: 'SettingsPrivacy' },
        { title: 'Backup & Sync', icon: '☁️', screen: 'SettingsBackup' },
        { title: 'Export Data', icon: '📤', screen: null },
        { title: 'Delete Account', icon: '🗑️', screen: null, destructive: true },
      ],
    },
    {
      title: 'About',
      items: [
        { title: 'Help & Support', icon: '❓', screen: null },
        { title: 'Privacy Policy', icon: '📄', screen: null },
        { title: 'Terms of Service', icon: '📋', screen: null },
        { title: 'Version 1.0.0', icon: 'ℹ️', screen: null, disabled: true },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {sections.map((section, sectionIndex) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.settingsList}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={item.title}
                  style={[styles.settingItem, item.destructive && styles.settingItemDestructive, item.disabled && styles.settingItemDisabled]}
                  onPress={() => item.screen && navigation.navigate(item.screen)}
                  disabled={item.disabled}
                  activeOpacity={0.8}
                >
                  <Text style={styles.settingIcon}>{item.icon}</Text>
                  <Text style={[styles.settingTitle, item.destructive && styles.settingTitleDestructive, item.disabled && styles.settingTitleDisabled]}>
                    {item.title}
                  </Text>
                  {!item.disabled && <Text style={styles.settingArrow}>›</Text>}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#0F172A' },
  content: { paddingHorizontal: 16, paddingBottom: 32 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, marginLeft: 4 },
  settingsList: { backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden', ...{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 } },
  settingItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  settingItemDestructive: { borderBottomWidth: 0 },
  settingItemDisabled: { opacity: 0.5 },
  settingIcon: { fontSize: 20, marginRight: 16 },
  settingTitle: { flex: 1, fontSize: 16, fontWeight: '500', color: '#0F172A' },
  settingTitleDestructive: { color: '#DC2626' },
  settingTitleDisabled: { color: '#94A3B8' },
  settingArrow: { fontSize: 20, color: '#94A3B8' },
});