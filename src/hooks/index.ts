import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../store';

export function useSecureStorage() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  const setItem = useCallback(async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      try { localStorage.setItem(key, value); } catch {}
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  }, []);

  const getItem = useCallback(async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      try { return localStorage.getItem(key); } catch { return null; }
    } else {
      return await SecureStore.getItemAsync(key);
    }
  }, []);

  const deleteItem = useCallback(async (key: string) => {
    if (Platform.OS === 'web') {
      try { localStorage.removeItem(key); } catch {}
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  }, []);

  return { setItem, getItem, deleteItem, isReady };
}

export function useAuth() {
  const { user, isAuthenticated, login, register, logout, updateProfile } = useAuthStore();
  const { setItem, getItem, deleteItem, isReady } = useSecureStorage();

  const loginWithEmail = useCallback(async (email: string) => {
    if (!isReady) return false;
    const success = await login(email);
    if (success) {
      await setItem('userEmail', email);
    }
    return success;
  }, [login, setItem, isReady]);

  const registerWithEmail = useCallback(async (userData: Parameters<typeof register>[0]) => {
    if (!isReady) return false;
    const success = await register(userData);
    if (success) {
      await setItem('userEmail', userData.email);
    }
    return success;
  }, [register, setItem, isReady]);

  const logoutUser = useCallback(async () => {
    await deleteItem('userEmail');
    logout();
  }, [logout, deleteItem]);

  const restoreSession = useCallback(async () => {
    if (!isReady) return;
    const email = await getItem('userEmail');
    if (email) {
      await loginWithEmail(email);
    }
  }, [getItem, loginWithEmail, isReady]);

  return {
    user,
    isAuthenticated,
    login: loginWithEmail,
    register: registerWithEmail,
    logout: logoutUser,
    updateProfile,
    restoreSession,
  };
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
}

export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const updateOrientation = () => {
      const isLandscape = typeof window !== 'undefined' ? window.innerWidth > window.innerHeight : false;
      setOrientation(isLandscape ? 'landscape' : 'portrait');
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateOrientation);
      updateOrientation();
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', updateOrientation);
      }
    };
  }, []);

  return orientation;
}

export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

export function useSafeArea() {
  const [insets, setInsets] = useState({ top: 0, bottom: 0, left: 0, right: 0 });
  
  // This would integrate with react-native-safe-area-context in real app
  // For now returning defaults
  
  return insets;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

export function formatElapsed(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function formatVolume(volume: number): string {
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M kg`;
  }
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K kg`;
  }
  return `${Math.round(volume)} kg`;
}