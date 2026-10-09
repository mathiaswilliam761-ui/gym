import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation';
import { useProgressStore } from '../../store';
import { formatDate, formatVolume } from '../../hooks';

interface ProgressDetailScreenProps {
  navigation: NavigationProp<RootStackParamList, 'ProgressDetail'>;
  route: {
    params?: {
      id?: string;
    };
  };
}

export function ProgressDetailScreen({ navigation, route }: ProgressDetailScreenProps) {
  const { id } = route.params || {};
  const { entries, loadProgress } = useProgressStore();
  
  const [entry, setEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEntry = async () => {
      loadProgress('current-user');
      if (id) {
        const e = entries.find((en: any) => en.id === id) || null;
        setEntry(e);
      } else {
        // Show latest entry
        const e = entries[0] || null;
        setEntry(e);
      }
      setLoading(false);
    };
    loadEntry();
  }, [id, entries, loadProgress]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingState}>
          <Text style={styles.loadingText}>Loading progress...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!entry) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No progress entries yet</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const measurements = entry.measurements || {};
  const hasMeasurements = Object.keys(measurements).some(key => measurements[key] !== undefined && measurements[key] !== null);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerCard}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
            <Text style={styles.entryType}>Progress Entry</Text>
          </View>

          {entry.notes && (
            <View style={styles.notes}>
              <Text style={styles.notesLabel}>Notes</Text>
              <Text style={styles.notesText}>{entry.notes}</Text>
            </View>
          )}
        </View>

        {/* Body Stats */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Body Stats</Text>
          
          <View style={styles.statsGrid}>
            {entry.weight && (
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Weight</Text>
                <Text style={styles.statValue}>{entry.weight.toFixed(1)} kg</Text>
              </View>
            )}
            {entry.bodyFatPercentage && (
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Body Fat</Text>
                <Text style={styles.statValue}>{entry.bodyFatPercentage.toFixed(1)}%</Text>
              </View>
            )}
            {entry.muscleMass && (
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Muscle Mass</Text>
                <Text style={styles.statValue}>{entry.muscleMass.toFixed(1)} kg</Text>
              </View>
            )}
          </View>
        </View>

        {/* Measurements */}
        {hasMeasurements && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Measurements (cm)</Text>
            
            <View style={styles.measurementsGrid}>
              {measurements.chest && (
                <View style={styles.measurementCard}>
                  <Text style={styles.measurementLabel}>Chest</Text>
                  <Text style={styles.measurementValue}>{measurements.chest.toFixed(1)}</Text>
                </View>
              )}
              {measurements.waist && (
                <View style={styles.measurementCard}>
                  <Text style={styles.measurementLabel}>Waist</Text>
                  <Text style={styles.measurementValue}>{measurements.waist.toFixed(1)}</Text>
                </View>
              )}
              {measurements.hips && (
                <View style={styles.measurementCard}>
                  <Text style={styles.measurementLabel}>Hips</Text>
                  <Text style={styles.measurementValue}>{measurements.hips.toFixed(1)}</Text>
                </View>
              )}
              {measurements.leftArm && (
                <View style={styles.measurementCard}>
                  <Text style={styles.measurementLabel}>L. Arm</Text>
                  <Text style={styles.measurementValue}>{measurements.leftArm.toFixed(1)}</Text>
                </View>
              )}
              {measurements.rightArm && (
                <View style={styles.measurementCard}>
                  <Text style={styles.measurementLabel}>R. Arm</Text>
                  <Text style={styles.measurementValue}>{measurements.rightArm.toFixed(1)}</Text>
                </View>
              )}
              {measurements.leftThigh && (
                <View style={styles.measurementCard}>
                  <Text style={styles.measurementLabel}>L. Thigh</Text>
                  <Text style={styles.measurementValue}>{measurements.leftThigh.toFixed(1)}</Text>
                </View>
              )}
              {measurements.rightThigh && (
                <View style={styles.measurementCard}>
                  <Text style={styles.measurementLabel}>R. Thigh</Text>
                  <Text style={styles.measurementValue}>{measurements.rightThigh.toFixed(1)}</Text>
                </View>
              )}
              {measurements.leftCalf && (
                <View style={styles.measurementCard}>
                  <Text style={styles.measurementLabel}>L. Calf</Text>
                  <Text style={styles.measurementValue}>{measurements.leftCalf.toFixed(1)}</Text>
                </View>
              )}
              {measurements.rightCalf && (
                <View style={styles.measurementCard}>
                  <Text style={styles.measurementLabel}>R. Calf</Text>
                  <Text style={styles.measurementValue}>{measurements.rightCalf.toFixed(1)}</Text>
                </View>
              )}
              {measurements.neck && (
                <View style={styles.measurementCard}>
                  <Text style={styles.measurementLabel}>Neck</Text>
                  <Text style={styles.measurementValue}>{measurements.neck.toFixed(1)}</Text>
                </View>
              )}
              {measurements.shoulders && (
                <View style={styles.measurementCard}>
                  <Text style={styles.measurementLabel}>Shoulders</Text>
                  <Text style={styles.measurementValue}>{measurements.shoulders.toFixed(1)}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Photos */}
        {entry.photos && entry.photos.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Progress Photos ({entry.photos.length})</Text>
            
            <FlatList
              data={entry.photos}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.photoCard}>
                  <View style={styles.photoPlaceholder}>
                    <Text style={styles.photoIcon}>📸</Text>
                  </View>
                  <View style={styles.photoInfo}>
                    <Text style={styles.photoType}>{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</Text>
                    <Text style={styles.photoDate}>{formatDate(item.date)}</Text>
                  </View>
                </View>
              )}
              ItemSeparatorComponent={() => <View style={styles.photoSeparator} />}
              ListHeaderComponent={<View style={{ height: 8 }} />}
              ListFooterComponent={<View style={{ height: 24 }} />}
            />
          </View>
        )}

        {/* History */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>All Entries ({entries.length})</Text>
          
          <FlatList
            data={entries}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.historyItem}
                onPress={() => navigation.navigate('ProgressDetail', { id: item.id })}
                activeOpacity={0.7}
              >
                <View style={styles.historyDate}>
                  <Text style={styles.historyDateText}>{formatDate(item.date)}</Text>
                </View>
                <View style={styles.historyStats}>
                  {item.weight && (
                    <Text style={styles.historyStat}>{item.weight.toFixed(1)} kg</Text>
                  )}
                  {item.bodyFatPercentage && (
                    <Text style={styles.historyStat}>{item.bodyFatPercentage.toFixed(1)}% BF</Text>
                  )}
                  {item.muscleMass && (
                    <Text style={styles.historyStat}>{item.muscleMass.toFixed(1)} kg muscle</Text>
                  )}
                </View>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.historySeparator} />}
            ListHeaderComponent={<View style={{ height: 8 }} />}
            ListFooterComponent={<View style={{ height: 24 }} />}
          />
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
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    color: '#64748B',
    marginBottom: 16,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
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
  headerContent: {
    alignItems: 'center',
    marginTop: 12,
  },
  entryDate: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  entryType: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  notes: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  notesLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  notesText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
    textAlign: 'center',
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  measurementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  measurementCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  measurementLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  measurementValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  photoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  photoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  photoIcon: {
    fontSize: 24,
  },
  photoInfo: {
    flex: 1,
  },
  photoType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  photoDate: {
    fontSize: 13,
    color: '#64748B',
  },
  photoSeparator: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 4,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  historyDate: {
    minWidth: 100,
  },
  historyDateText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  historyStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    flex: 1,
  },
  historyStat: {
    fontSize: 13,
    color: '#64748B',
  },
  historySeparator: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 4,
  },
});