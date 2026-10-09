import React, { useEffect } from 'react';
import { View, StatusBar, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from './src/navigation';
import { useAuthStore } from './src/store';
import { useSettingsStore } from './src/store';
import * as SplashScreen from 'expo-splash-screen';
import { HydrationGate } from './src/components/HydrationGate';
import { ErrorBoundary } from './src/components/ErrorBoundary';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const { restoreSession, user, isAuthenticated } = useAuthStore();
  const { loadSettings } = useSettingsStore();

  useEffect(() => {
    const initializeApp = async () => {
      await restoreSession();
      // Load settings for current user if authenticated
      const state = useAuthStore.getState();
      if (state.user) {
        loadSettings(state.user.id);
      }
      await SplashScreen.hideAsync();
    };
    initializeApp();
  }, [restoreSession, loadSettings]);

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
        <HydrationGate>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </HydrationGate>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});