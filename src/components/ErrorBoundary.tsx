import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, errorInfo);
    
    // Haptic feedback for crash
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    
    // Call custom error handler
    this.props.onError?.(error, errorInfo);
    
    // In production, you'd send to Sentry/Crashlytics here
    // Sentry.captureException(error, { extra: errorInfo });
  }

  resetErrorBoundary = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.icon}>😰</Text>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.message}>
              The app encountered an unexpected error. Your data is safe.
            </Text>
            
            <View style={styles.errorDetails}>
              <Text style={styles.errorText}>{this.state.error?.message}</Text>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={this.resetErrorBoundary}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>Try Again</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => {
                  // Navigate to home or safe screen
                  this.resetErrorBoundary();
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>Go Home</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.reportButton}
              onPress={() => {
                Alert.alert(
                  'Report Issue',
                  'Would you like to send an error report to help us fix this?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: 'Send Report', 
                      onPress: () => {
                        // In production: send to error tracking service
                        console.log('Error report sent:', this.state.error);
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                      } 
                    },
                  ]
                );
              }}
            >
              <Text style={styles.reportButtonText}>Report Issue</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

// Specialized error boundary for workout screens (preserves workout state)
export class WorkoutErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('WorkoutErrorBoundary caught:', error, errorInfo);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    this.props.onError?.(error, errorInfo);
  }

  resetErrorBoundary = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.icon}>💪</Text>
            <Text style={styles.title}>Workout Interrupted</Text>
            <Text style={styles.message}>
              Your workout progress has been saved locally. You can resume when you reopen the app.
            </Text>
            
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={this.resetErrorBoundary}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Resume Workout</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

// Lightweight error boundary for list items
export class ListItemErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ListItemErrorBoundary caught:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <View style={styles.itemError}>
          <Text style={styles.itemErrorText}>⚠️ Unable to load this item</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  errorDetails: {
    width: '100%',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    fontSize: 13,
    color: '#DC2626',
    fontFamily: 'monospace',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginBottom: 16,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563EB',
  },
  reportButton: {
    width: '100%',
    paddingVertical: 12,
  },
  reportButtonText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  itemError: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  itemErrorText: {
    fontSize: 14,
    color: '#DC2626',
  },
});