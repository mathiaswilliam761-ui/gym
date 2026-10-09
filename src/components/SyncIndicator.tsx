import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Platform } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { useSettingsStore, useWorkoutPlanStore, useWorkoutSessionStore, useProgressStore, useNutritionStore, useCardioStore } from '../store';

interface SyncIndicatorProps {
  style?: any;
  compact?: boolean;
}

export function SyncIndicator({ style, compact = false }: SyncIndicatorProps) {
  const netInfo = useNetInfo();
  const isConnected = netInfo.isConnected ?? false;
  const isInternetReachable = netInfo.isInternetReachable ?? false;
  
  const { settings } = useSettingsStore();
  const autoBackup = settings?.autoBackup ?? true;
  const { plans } = useWorkoutPlanStore();
  const { sessionHistory } = useWorkoutSessionStore();
  const { entries: progressEntries } = useProgressStore();
  const { entries: nutritionEntries } = useNutritionStore();
  const { cardioHistory } = useCardioStore();

  const [syncStatus, setSyncStatus] = useState<'synced' | 'pending' | 'syncing' | 'error'>('synced');
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Calculate pending changes (items with syncedAt older than updatedAt, or missing syncedAt)
  useEffect(() => {
    const calculatePending = () => {
      let count = 0;
      
      // Check all stores for unsynced items
      const allItems = [
        ...plans,
        ...sessionHistory,
        ...progressEntries,
        ...nutritionEntries,
        ...cardioHistory,
      ];
      
      for (const item of allItems) {
        // Different types have different date fields
        const itemDate = (item as any).startedAt || (item as any).createdAt || (item as any).date;
        if (!item.syncedAt || (itemDate && new Date(itemDate) > new Date(item.syncedAt))) {
          count++;
        }
      }
      
      setPendingCount(count);
      if (count > 0) {
        setSyncStatus('pending');
      } else if (isConnected && isInternetReachable) {
        setSyncStatus('synced');
      }
    };
    
    calculatePending();
  }, [plans, sessionHistory, progressEntries, nutritionEntries, cardioHistory, isConnected, isInternetReachable]);

  // Pulse animation for syncing state
  useEffect(() => {
    if (syncStatus === 'syncing') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(0);
    }
  }, [syncStatus]);

  // Slide animation for details panel
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: showDetails ? 1 : 0,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [showDetails]);

  const handleSync = useCallback(async () => {
    if (!isConnected || !isInternetReachable) {
      setSyncStatus('error');
      return;
    }
    
    if (!autoBackup) return;
    
    setSyncStatus('syncing');
    
    try {
      // Simulate sync - replace with actual sync logic
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update last sync time
      const now = new Date().toISOString();
      setLastSyncTime(now);
      setSyncStatus('synced');
      setPendingCount(0);
      
      // Haptic feedback
      const { default: Haptics } = await import('expo-haptics');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
      
      const { default: Haptics } = await import('expo-haptics');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [isConnected, isInternetReachable, autoBackup]);

  // Auto-sync when online and pending changes
  useEffect(() => {
    if (isConnected && isInternetReachable && autoBackup && pendingCount > 0 && syncStatus !== 'syncing') {
      const timer = setTimeout(() => {
        handleSync();
      }, 5000); // Debounce
      
      return () => clearTimeout(timer);
    }
  }, [isConnected, isInternetReachable, autoBackup, pendingCount, syncStatus, handleSync]);

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'synced': return '☁️';
      case 'pending': return '⏳';
      case 'syncing': return '🔄';
      case 'error': return '⚠️';
      default: return '☁️';
    }
  };

  const getStatusColor = () => {
    switch (syncStatus) {
      case 'synced': return '#059669';
      case 'pending': return '#92400E';
      case 'syncing': return '#2563EB';
      case 'error': return '#DC2626';
      default: return '#059669';
    }
  };

  const getStatusText = () => {
    switch (syncStatus) {
      case 'synced': return 'Synced';
      case 'pending': return `${pendingCount} pending`;
      case 'syncing': return 'Syncing...';
      case 'error': return 'Sync failed';
      default: return 'Synced';
    }
  };

  if (compact) {
    return (
      <Animated.View
        style={[
          styles.compactContainer,
          { backgroundColor: getStatusColor() + '20', borderColor: getStatusColor() },
          style,
        ]}
      >
        <Animated.Text
          style={[
            styles.compactText,
            { color: getStatusColor() },
            {
              opacity: pulseAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0.5],
              }),
            },
          ]}
        >
          {getStatusIcon()} {getStatusText()}
        </Animated.Text>
      </Animated.View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.mainButton}
        onPress={handleSync}
        disabled={syncStatus === 'syncing' || !isConnected || !isInternetReachable}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.statusDot,
            {
              backgroundColor: getStatusColor(),
              transform: [
                { scale: pulseAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.2],
                }) },
              ],
            },
          ]}
        />
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
        {isConnected && isInternetReachable && pendingCount > 0 && syncStatus !== 'syncing' && (
          <Animated.Text style={styles.syncNowText}>Tap to sync</Animated.Text>
        )}
      </TouchableOpacity>

      <View style={styles.detailsTrigger}>
        <TouchableOpacity
          style={styles.detailsTriggerInner}
          onPress={() => setShowDetails(!showDetails)}
          activeOpacity={0.8}
        >
          <Animated.View
            style={{
              transform: [
                { rotate: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '180deg'],
                }) },
              ],
            }}
          >
            <Text style={styles.detailsArrow}>▼</Text>
          </Animated.View>
        </TouchableOpacity>
      </View>

      <Animated.View
        style={[
          styles.detailsPanel,
          {
            height: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 200],
            }),
            opacity: slideAnim,
          },
        ]}
      >
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Last Sync</Text>
          <Text style={styles.detailValue}>
            {lastSyncTime ? formatRelativeTime(lastSyncTime) : 'Never'}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Pending Changes</Text>
          <Text style={styles.detailValue}>{pendingCount}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Connection</Text>
          <Text style={styles.detailValue}>
            {isConnected ? (isInternetReachable ? 'Online' : 'Limited') : 'Offline'}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Auto Sync</Text>
          <Text style={styles.detailValue}>{autoBackup ? 'Enabled' : 'Disabled'}</Text>
        </View>
        {syncStatus === 'error' && (
          <TouchableOpacity style={styles.retryButton} onPress={handleSync} activeOpacity={0.8}>
            <Text style={styles.retryButtonText}>Retry Sync</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
}

// Helper to format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  mainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    paddingVertical: 4,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '600',
  },
  syncNowText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  detailsTrigger: {
    padding: 8,
  },
  detailsArrow: {
    fontSize: 14,
    color: '#94A3B8',
  },
  detailsPanel: {
    position: 'absolute',
    top: '100%',
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  detailLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  retryButton: {
    marginTop: 12,
    paddingVertical: 10,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },
  detailsTriggerInner: {
    padding: 4,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  compactText: {
    fontSize: 12,
    fontWeight: '600',
  },
});