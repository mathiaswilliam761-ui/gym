import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store';
import { useSettingsStore } from '../store';

export function HydrationGate({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const checkHydration = () => {
      const authHydrated = useAuthStore.persist.hasHydrated();
      const settingsHydrated = useSettingsStore.persist.hasHydrated();
      
      if (authHydrated && settingsHydrated) {
        setHydrated(true);
      } else {
        // Check again in 50ms
        setTimeout(checkHydration, 50);
      }
    };
    
    checkHydration();
  }, []);

  if (!hydrated) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
});