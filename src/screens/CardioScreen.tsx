import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { useCardioStore } from '../store';
import { CARDIO_TYPES } from '../constants';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation';
import { format } from 'date-fns';
import { useAuthStore } from '../store';

export function CardioScreen() {
  const { cardioHistory, loadHistory, activeCardio, startCardio } = useCardioStore();
  const { user } = useAuthStore();
  const navigation = useNavigation<any>();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showStartModal, setShowStartModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadHistory(user.id);
    }
  }, [user, loadHistory]);

  const totalDistance = cardioHistory.reduce((sum, s) => sum + s.distanceMeters, 0);
  const totalDuration = cardioHistory.reduce((sum, s) => sum + s.durationSeconds, 0);
  const totalCalories = cardioHistory.reduce((sum, s) => sum + s.caloriesBurned, 0);
  const sessionCount = cardioHistory.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cardio</Text>
        {activeCardio && (
          <TouchableOpacity style={styles.activeBadge} onPress={() => navigation.navigate('CardioActive')}>
            <Text style={styles.activeBadgeText}>Active: {activeCardio.type}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.statsGrid}>
        <StatCard title="Sessions" value={sessionCount} icon="🏃" color="#2563EB" />
        <StatCard title="Distance" value={`${(totalDistance / 1000).toFixed(1)} km`} icon="📏" color="#059669" />
        <StatCard title="Time" value={`${Math.floor(totalDuration / 3600)}h ${Math.floor((totalDuration % 3600) / 60)}m`} icon="⏱️" color="#7C3AED" />
        <StatCard title="Calories" value={Math.round(totalCalories)} icon="🔥" color="#DC2626" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Start Cardio</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardioTypesScroll}>
          {CARDIO_TYPES.map(type => (
            <TouchableOpacity
              key={type.id}
              style={[styles.cardioTypeCard, selectedType === type.id && styles.cardioTypeCardSelected]}
              onPress={() => { setSelectedType(type.id); setShowStartModal(true); }}
            >
              <Text style={styles.cardioTypeIcon}>{type.icon}</Text>
              <Text style={[styles.cardioTypeName, selectedType === type.id && styles.cardioTypeNameSelected]}>{type.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Sessions</Text>
        {cardioHistory.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🏃</Text>
            <Text style={styles.emptyTitle}>No cardio sessions yet</Text>
            <Text style={styles.emptySubtitle}>Start your first run, ride, or swim</Text>
          </View>
        ) : (
          <FlatList
            data={cardioHistory.slice(0, 10)}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <CardioHistoryItem session={item} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {showStartModal && (
        <StartCardioModal
          type={selectedType}
          onClose={() => { setShowStartModal(false); setSelectedType(null); }}
          onStart={type => { startCardio({ userId: user!.id, type: type as any, startedAt: new Date().toISOString(), durationSeconds: 0, distanceMeters: 0, caloriesBurned: 0 }); setShowStartModal(false); setSelectedType(null); navigation.navigate('CardioActive'); }}
        />
      )}
    </View>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <View style={[styles.statCard, { borderTopColor: color }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Text style={styles.statIconText}>{icon}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );
}

interface CardioHistoryItemProps {
  session: any;
}

function CardioHistoryItem({ session }: CardioHistoryItemProps) {
  const typeInfo = CARDIO_TYPES.find(t => t.id === session.type);
  const duration = Math.floor(session.durationSeconds / 60);
  const distanceKm = (session.distanceMeters / 1000).toFixed(2);
  const pace = session.durationSeconds > 0 && session.distanceMeters > 0
    ? (session.durationSeconds / 60 / (session.distanceMeters / 1000)).toFixed(2)
    : '--';

  return (
    <View style={styles.sessionCard}>
      <View style={styles.sessionCardContent}>
        <View style={styles.sessionIcon}>🏃</View>
        <View style={styles.sessionInfo}>
          <View style={styles.sessionHeader}>
            <Text style={styles.sessionType}>{typeInfo?.name || session.type}</Text>
            <Text style={styles.sessionDate}>{format(new Date(session.startedAt), 'MMM d, yyyy HH:mm')}</Text>
          </View>
          <View style={styles.sessionMeta}>
            <Text style={styles.sessionMetaText}>{duration} min</Text>
            <Text style={styles.sessionMetaDivider}>•</Text>
            <Text style={styles.sessionMetaText}>{distanceKm} km</Text>
            <Text style={styles.sessionMetaDivider}>•</Text>
            <Text style={styles.sessionMetaText}>{session.caloriesBurned} kcal</Text>
            {session.avgHeartRate && (
              <>
                <Text style={styles.sessionMetaDivider}>•</Text>
                <Text style={styles.sessionMetaText}>❤️ {session.avgHeartRate} bpm</Text>
              </>
            )}
          </View>
          {session.avgPace && (
            <Text style={styles.sessionPace}>Pace: {session.avgPace.toFixed(2)} min/km</Text>
          )}
        </View>
      </View>
    </View>
  );
}

interface StartCardioModalProps {
  type: string | null;
  onClose: () => void;
  onStart: (type: string) => void;
}

function StartCardioModal({ type, onClose, onStart }: StartCardioModalProps) {
  const typeInfo = type ? CARDIO_TYPES.find(t => t.id === type) : null;

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modal}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Start {typeInfo?.name || 'Cardio'}</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalClose}>✕</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.modalContent}>
          {typeInfo && (
            <View style={styles.typePreview}>
              <Text style={styles.typePreviewIcon}>{typeInfo.icon}</Text>
              <Text style={styles.typePreviewName}>{typeInfo.name}</Text>
            </View>
          )}
          <Text style={styles.modalText}>Ready to start your {typeInfo?.name.toLowerCase()} session?</Text>
          <View style={styles.modalOptions}>
            <TouchableOpacity style={styles.modalOption} onPress={() => onStart(type!)}>
              <Text style={styles.modalOptionText}>Start Now</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOptionSecondary} onPress={onClose}>
              <Text style={styles.modalOptionTextSecondary}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#0F172A' },
  activeBadge: { backgroundColor: '#DBEAFE', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  activeBadgeText: { fontSize: 12, fontWeight: '600', color: '#2563EB' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16 },
  statCard: { width: '48%', aspectRatio: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, alignItems: 'center', justifyContent: 'center', borderTopWidth: 4, ...{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 } },
  statIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statIconText: { fontSize: 24 },
  statValue: { fontSize: 20, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  statTitle: { fontSize: 13, color: '#64748B', textAlign: 'center' },
  section: { marginBottom: 24, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 16 },
  cardioTypesScroll: { paddingHorizontal: 16, gap: 12, paddingBottom: 8 },
  cardioTypeCard: { width: 80, alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, ...{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 } },
  cardioTypeCardSelected: { borderWidth: 2, borderColor: '#2563EB' },
  cardioTypeIcon: { fontSize: 28, marginBottom: 8 },
  cardioTypeName: { fontSize: 12, fontWeight: '500', color: '#475569', textAlign: 'center' },
  cardioTypeNameSelected: { color: '#2563EB', fontWeight: '600' },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  sessionCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12, ...{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 } },
  sessionCardContent: { flexDirection: 'row', alignItems: 'flex-start' },
  sessionIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#D1FAE5', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  sessionInfo: { flex: 1 },
  sessionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  sessionType: { fontSize: 16, fontWeight: '600', color: '#0F172A' },
  sessionDate: { fontSize: 13, color: '#64748B' },
  sessionMeta: { flexDirection: 'row', flexWrap: 'wrap' },
  sessionMetaText: { fontSize: 13, color: '#64748B' },
  sessionMetaDivider: { fontSize: 13, color: '#94A3B8', marginHorizontal: 4 },
  sessionPace: { fontSize: 12, color: '#2563EB', fontWeight: '500', marginTop: 8 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#0F172A', marginBottom: 8, textAlign: 'center' },
  emptySubtitle: { fontSize: 16, color: '#64748B', textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modal: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, marginHorizontal: 24, width: '100%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  modalClose: { fontSize: 24, color: '#94A3B8' },
  modalContent: { alignItems: 'center' },
  typePreview: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, padding: 16, marginBottom: 16 },
  typePreviewIcon: { fontSize: 32, marginRight: 12 },
  typePreviewName: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  modalText: { fontSize: 16, color: '#64748B', textAlign: 'center', marginBottom: 24 },
  modalOptions: { flexDirection: 'row', gap: 12, width: '100%' },
  modalOption: { flex: 1, backgroundColor: '#2563EB', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  modalOptionText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  modalOptionSecondary: { flex: 1, backgroundColor: '#F8FAFC', paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  modalOptionTextSecondary: { fontSize: 16, fontWeight: '600', color: '#475569' },
});