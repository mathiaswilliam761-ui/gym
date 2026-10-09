import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  Dimensions,
  FlatList,
  Modal,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation';
import { useCardioStore } from '../../store';
import { formatElapsed, formatDate } from '../../hooks';
import { startBackgroundLocationUpdates, stopBackgroundLocationUpdates } from '../../utils/backgroundLocation';
import { CardioType } from '../../types';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface CardioActiveScreenProps {
  navigation: NavigationProp<RootStackParamList, 'CardioActive'>;
  route: {
    params?: {
      type?: string;
    };
  };
}

const CARDIO_TYPES = [
  { id: 'running', name: 'Running', icon: '🏃', met: 8.0 },
  { id: 'cycling', name: 'Cycling', icon: '🚴', met: 7.5 },
  { id: 'walking', name: 'Walking', icon: '🚶', met: 3.5 },
  { id: 'swimming', name: 'Swimming', icon: '🏊', met: 6.0 },
  { id: 'rowing', name: 'Rowing', icon: '🚣', met: 7.0 },
  { id: 'elliptical', name: 'Elliptical', icon: '⭕', met: 5.0 },
  { id: 'stair_climber', name: 'Stair Climber', icon: '🪜', met: 9.0 },
  { id: 'hiit', name: 'HIIT', icon: '⚡', met: 10.0 },
  { id: 'other', name: 'Other', icon: '❓', met: 5.0 },
] as const;

export function CardioActiveScreen({ navigation, route }: CardioActiveScreenProps) {
  const { type } = route.params || {};
  const { activeCardio, startCardio, updateCardio, endCardio } = useCardioStore();
  
  const [session, setSession] = useState<any>(activeCardio);
  const [selectedType, setSelectedType] = useState<CardioType>((type as CardioType) || 'running');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [distance, setDistance] = useState(0);
  const [pace, setPace] = useState('0:00');
  const [calories, setCalories] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  
  const elapsedIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionStartTimeRef = useRef<number>(0);
  const restOverlayAnim = useRef(new Animated.Value(0)).current;

  const cardioType = CARDIO_TYPES.find(c => c.id === selectedType) || CARDIO_TYPES[0];

  // Animate rest overlay in/out
  React.useEffect(() => {
    if (isRunning) {
      Animated.timing(restOverlayAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(restOverlayAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [isRunning]);

  // Elapsed time counter
  useEffect(() => {
    if (!isRunning) return;
    
    sessionStartTimeRef.current = Date.now() - elapsedTime * 1000;
    
    const updateElapsed = () => {
      setElapsedTime(Math.floor((Date.now() - sessionStartTimeRef.current) / 1000));
    };
    
    updateElapsed();
    elapsedIntervalRef.current = setInterval(updateElapsed, 1000);
    
    return () => {
      if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
    };
  }, [isRunning]);

  // Calculate pace when distance changes
  useEffect(() => {
    if (distance > 0 && elapsedTime > 0) {
      const paceSecPerKm = (elapsedTime / distance) * 1000;
      const minutes = Math.floor(paceSecPerKm / 60);
      const seconds = Math.floor(paceSecPerKm % 60);
      setPace(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    } else {
      setPace('0:00');
    }
  }, [distance, elapsedTime]);

  // Calculate calories
  useEffect(() => {
    if (elapsedTime > 0) {
      const userWeight = 75; // kg - should come from user profile
      const cal = (cardioType.met * userWeight * elapsedTime) / 3600;
      setCalories(Math.round(cal));
    } else {
      setCalories(0);
    }
  }, [elapsedTime, cardioType.met]);

  const handleStart = useCallback(async () => {
    if (isRunning) return;
    
    const newSession = startCardio({
      userId: 'current-user',
      type: selectedType,
      startedAt: new Date().toISOString(),
      distanceMeters: 0,
      durationSeconds: 0,
      caloriesBurned: 0,
    });
    
    setSession(newSession);
    setIsRunning(true);
    setElapsedTime(0);
    setDistance(0);
    
    // Start background location tracking
    await startBackgroundLocationUpdates();
  }, [isRunning, selectedType, startCardio]);

  const handlePause = useCallback(() => {
    if (!isRunning || !session) return;
    
    setIsRunning(false);
    if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
    
    // Update session in store
    updateCardio({
      durationSeconds: elapsedTime,
      distanceMeters: Math.round(distance * 1000),
      caloriesBurned: calories,
    });
  }, [isRunning, session, elapsedTime, distance, calories, updateCardio]);

  const handleResume = useCallback(() => {
    if (isRunning) return;
    setIsRunning(true);
  }, [isRunning]);

  const handleEnd = useCallback(() => {
    if (!session) return;
    
    const completed = endCardio();
    if (completed) {
      navigation.navigate('Progress');
    }
    setIsRunning(false);
    setSession(null);
    if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
    
    // Stop background location tracking
    stopBackgroundLocationUpdates();
  }, [session, endCardio, navigation]);

  const handleTypeSelect = (newType: CardioType) => {
    setSelectedType(newType);
    setShowTypePicker(false);
  };

  if (!isRunning && !session) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.headerCard}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Start Cardio</Text>
          </View>

          <View style={styles.typeCard}>
            <Text style={styles.sectionTitle}>Activity Type</Text>
            <TouchableOpacity style={styles.typeButton} onPress={() => setShowTypePicker(true)}>
              <View style={styles.typeButtonContent}>
                <Text style={styles.typeIcon}>{cardioType.icon}</Text>
                <Text style={styles.typeName}>{cardioType.name}</Text>
                <Text style={styles.typeChevron}>▼</Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.startButton} onPress={handleStart} activeOpacity={0.8}>
            <Text style={styles.startButtonText}>Start {cardioType.name}</Text>
          </TouchableOpacity>
        </ScrollView>
        
        {showTypePicker && (
          <Modal visible={true} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowTypePicker(false)}>
            <SafeAreaView style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Activity</Text>
                <TouchableOpacity onPress={() => setShowTypePicker(false)} style={styles.modalClose}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={CARDIO_TYPES}
                keyExtractor={(item) => item.id}
                renderItem={({ item }: { item: typeof CARDIO_TYPES[number] }) => (
                  <TouchableOpacity
                    style={styles.typePickerItem}
                    onPress={() => handleTypeSelect(item.id)}
                  >
                    <Text style={styles.typePickerIcon}>{item.icon}</Text>
                    <Text style={styles.typePickerName}>{item.name}</Text>
                    <Text style={styles.typePickerMet}>{item.met} MET</Text>
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.modalListContent}
              />
            </SafeAreaView>
          </Modal>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoiding}
        keyboardVerticalOffset={100}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.workoutName}>{cardioType.name}</Text>
            <Text style={styles.elapsedTime}>{formatElapsed(elapsedTime)}</Text>
          </View>
          <TouchableOpacity
            style={styles.endButton}
            onPress={handleEnd}
            activeOpacity={0.8}
          >
            <Text style={styles.endButtonText}>End</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Distance</Text>
            <Text style={styles.statValue}>{distance.toFixed(2)} km</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Pace</Text>
            <Text style={styles.statValue}>{pace} /km</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Calories</Text>
            <Text style={styles.statValue}>{calories} kcal</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Duration</Text>
            <Text style={styles.statValue}>{formatElapsed(elapsedTime)}</Text>
          </View>
        </View>

        {/* Map placeholder */}
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapText}>🗺 GPS Map</Text>
          <Text style={styles.mapSubtext}>Background tracking active</Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          {!isRunning ? (
            <TouchableOpacity style={styles.resumeButton} onPress={handleResume} activeOpacity={0.8}>
              <Text style={styles.resumeButtonText}>▶ Resume</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.pauseButton} onPress={handlePause} activeOpacity={0.8}>
              <Text style={styles.pauseButtonText}>⏸ Pause</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardAvoiding: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
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
  typeCard: {
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
  typeButton: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  typeButtonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  typeName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  typeChevron: {
    fontSize: 16,
    color: '#94A3B8',
  },
  startButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 20,
    borderRadius: 16,
    marginHorizontal: 16,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalClose: {
    padding: 8,
  },
  modalCloseText: {
    fontSize: 24,
    color: '#94A3B8',
  },
  modalListContent: {
    padding: 16,
    paddingBottom: 32,
  },
  typePickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  typePickerIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  typePickerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
  },
  typePickerMet: {
    fontSize: 13,
    color: '#64748B',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerCenter: {
    alignItems: 'center',
  },
  workoutName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  elapsedTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
    fontFamily: 'monospace',
  },
  endButton: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  endButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
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
  mapPlaceholder: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  mapSubtext: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
  },
  controls: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 32,
  },
  pauseButton: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  pauseButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#92400E',
  },
  resumeButton: {
    backgroundColor: '#D1FAE5',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  resumeButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
  },
});