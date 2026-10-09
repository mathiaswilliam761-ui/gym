import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { useProgressStore, useNutritionStore } from '../store';
import { BODY_MEASUREMENT_FIELDS, PROGRESS_PHOTO_TYPES } from '../constants';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation';
import { format } from 'date-fns';
import { useAuthStore } from '../store';

export function ProgressScreen() {
  const { entries, loadProgress, addEntry } = useProgressStore();
  const { user } = useAuthStore();
  const navigation = useNavigation<any>();
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadProgress(user.id);
    }
  }, [user, loadProgress]);

  const latestEntry = entries[0];
  const previousEntry = entries[1];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Progress</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Text style={styles.addButtonText}>+ Log Progress</Text>
        </TouchableOpacity>
      </View>

      {latestEntry && (
        <View style={styles.latestCard}>
          <Text style={styles.latestTitle}>Latest Entry</Text>
          <Text style={styles.latestDate}>{format(new Date(latestEntry.date), 'MMMM d, yyyy')}</Text>
          <View style={styles.latestStats}>
            <ProgressStat
              label="Weight"
              value={latestEntry.weight ? `${latestEntry.weight} kg` : '--'}
              change={previousEntry && latestEntry.weight && previousEntry.weight
                ? ((latestEntry.weight - previousEntry.weight) / previousEntry.weight * 100).toFixed(1) + '%'
                : null}
            />
            <ProgressStat
              label="Body Fat"
              value={latestEntry.bodyFatPercentage ? `${latestEntry.bodyFatPercentage}%` : '--'}
              change={previousEntry && latestEntry.bodyFatPercentage && previousEntry.bodyFatPercentage
                ? ((latestEntry.bodyFatPercentage - previousEntry.bodyFatPercentage) / previousEntry.bodyFatPercentage * 100).toFixed(1) + '%'
                : null}
            />
            <ProgressStat
              label="Muscle Mass"
              value={latestEntry.muscleMass ? `${latestEntry.muscleMass} kg` : '--'}
              change={previousEntry && latestEntry.muscleMass && previousEntry.muscleMass
                ? ((latestEntry.muscleMass - previousEntry.muscleMass) / previousEntry.muscleMass * 100).toFixed(1) + '%'
                : null}
            />
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Body Measurements</Text>
        {latestEntry && (
          <View style={styles.measurementsGrid}>
            {BODY_MEASUREMENT_FIELDS.map(field => (
              <MeasurementCard
                key={field.id}
                label={field.name}
                value={latestEntry.measurements[field.id as keyof typeof latestEntry.measurements] ? `${latestEntry.measurements[field.id as keyof typeof latestEntry.measurements]} ${field.unit}` : '--'}
              />
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Progress Photos</Text>
        {latestEntry && latestEntry.photos.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photosScroll}>
            {latestEntry.photos.map(photo => (
              <View key={photo.id} style={styles.photoCard}>
                <View style={styles.photoPlaceholder}>
                  <Text style={styles.photoIcon}>📸</Text>
                </View>
                <Text style={styles.photoLabel}>{PROGRESS_PHOTO_TYPES.find(p => p.id === photo.type)?.name || photo.type}</Text>
                <Text style={styles.photoDate}>{format(new Date(photo.date), 'MMM d')}</Text>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.noPhotos}>
            <Text style={styles.noPhotosText}>No progress photos yet</Text>
            <Text style={styles.noPhotosSubtitle}>Add photos when logging progress</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>History</Text>
        {entries.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyTitle}>No progress entries</Text>
            <Text style={styles.emptySubtitle}>Start tracking your progress</Text>
          </View>
        ) : (
          <FlatList
            data={entries}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <ProgressHistoryItem entry={item} onPress={() => navigation.navigate('ProgressDetail', { id: item.id })} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {showAddModal && (
        <AddProgressModal onClose={() => setShowAddModal(false)} onSave={data => { addEntry(data); setShowAddModal(false); }} />
      )}
    </View>
  );
}

interface ProgressStatProps {
  label: string;
  value: string;
  change: string | null;
}

function ProgressStat({ label, value, change }: ProgressStatProps) {
  const isPositive = change && !change.startsWith('-');
  const isNegative = change && change.startsWith('-');

  return (
    <View style={styles.progressStat}>
      <Text style={styles.progressStatLabel}>{label}</Text>
      <Text style={styles.progressStatValue}>{value}</Text>
      {change && (
        <Text style={[styles.progressStatChange, isPositive && styles.positiveChange, isNegative && styles.negativeChange]}>
          {isPositive ? '+' : ''}{change}
        </Text>
      )}
    </View>
  );
}

interface MeasurementCardProps {
  label: string;
  value: string;
}

function MeasurementCard({ label, value }: MeasurementCardProps) {
  return (
    <View style={styles.measurementCard}>
      <Text style={styles.measurementLabel}>{label}</Text>
      <Text style={styles.measurementValue}>{value}</Text>
    </View>
  );
}

interface ProgressHistoryItemProps {
  entry: any;
  onPress: () => void;
}

function ProgressHistoryItem({ entry, onPress }: ProgressHistoryItemProps) {
  return (
    <TouchableOpacity style={styles.historyItem} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.historyItemContent}>
        <View style={styles.historyDate}>
          <Text style={styles.historyDay}>{format(new Date(entry.date), 'd')}</Text>
          <Text style={styles.historyMonth}>{format(new Date(entry.date), 'MMM')}</Text>
        </View>
        <View style={styles.historyInfo}>
          <Text style={styles.historyWeight}>{entry.weight ? `${entry.weight} kg` : 'No weight'}</Text>
          <Text style={styles.historyBodyFat}>{entry.bodyFatPercentage ? `${entry.bodyFatPercentage}% BF` : ''}</Text>
        </View>
        <Text style={styles.historyArrow}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

interface AddProgressModalProps {
  onClose: () => void;
  onSave: (data: any) => void;
}

function AddProgressModal({ onClose, onSave }: AddProgressModalProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [muscleMass, setMuscleMass] = useState('');

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modal}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Log Progress</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalClose}>✕</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.modalContent}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Date</Text>
            <TextInput
              style={styles.formInput}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Weight (kg)</Text>
            <TextInput
              style={styles.formInput}
              value={weight}
              onChangeText={setWeight}
              placeholder="e.g., 75.5"
              keyboardType="decimal-pad"
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Body Fat %</Text>
            <TextInput
              style={styles.formInput}
              value={bodyFat}
              onChangeText={setBodyFat}
              placeholder="e.g., 15.5"
              keyboardType="decimal-pad"
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Muscle Mass (kg)</Text>
            <TextInput
              style={styles.formInput}
              value={muscleMass}
              onChangeText={setMuscleMass}
              placeholder="e.g., 35.2"
              keyboardType="decimal-pad"
            />
          </View>
        </ScrollView>
        <View style={styles.modalActions}>
          <TouchableOpacity style={styles.modalCancel} onPress={onClose}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalSave} onPress={() => onSave({
            date,
            weight: weight ? parseFloat(weight) : undefined,
            bodyFatPercentage: bodyFat ? parseFloat(bodyFat) : undefined,
            muscleMass: muscleMass ? parseFloat(muscleMass) : undefined,
            measurements: {},
            photos: [],
          })}>
            <Text style={styles.modalSaveText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
  latestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    ...{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
  },
  latestTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  latestDate: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  latestStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressStat: {
    alignItems: 'center',
  },
  progressStatLabel: {
    fontSize: 12,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  progressStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  progressStatChange: {
    fontSize: 12,
    fontWeight: '600',
  },
  positiveChange: {
    color: '#059669',
  },
  negativeChange: {
    color: '#DC2626',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  measurementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  measurementCard: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    ...{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
    },
  },
  measurementLabel: {
    fontSize: 11,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
    textAlign: 'center',
  },
  measurementValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'center',
  },
  photosScroll: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 8,
  },
  photoCard: {
    width: 100,
    alignItems: 'center',
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  photoIcon: {
    fontSize: 32,
  },
  photoLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 2,
  },
  photoDate: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
  },
  noPhotos: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    ...{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
    },
  },
  noPhotosText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  noPhotosSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  historyItem: {
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
  historyItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyDate: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  historyDay: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2563EB',
  },
  historyMonth: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2563EB',
    textTransform: 'uppercase',
  },
  historyInfo: {
    flex: 1,
  },
  historyWeight: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  historyBodyFat: {
    fontSize: 13,
    color: '#64748B',
  },
  historyArrow: {
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalClose: {
    fontSize: 24,
    color: '#94A3B8',
  },
  modalContent: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0F172A',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  modalCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
  },
  modalSave: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});