import { useState, useEffect, useRef, useCallback } from 'react';
import { useKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';
import { useWorkoutSessionStore } from '../store';
import { WorkoutSession, SessionExercise, SessionSet } from '../types';

interface RestTimerState {
  targetEndTime: number;
  exerciseId: string;
  setNumber: number;
}

interface UseActiveWorkoutReturn {
  session: WorkoutSession | null;
  restTimer: RestTimerState | null;
  remainingRest: number;
  elapsedTime: number;
  totalVolume: number;
  startRestTimer: (exerciseId: string, setNumber: number, seconds: number) => void;
  cancelRestTimer: () => void;
  completeSet: (sessionExerciseId: string, setNumber: number, weight?: number, reps?: number, rpe?: number) => void;
  completeWorkout: () => WorkoutSession | null;
  updateSet: (sessionExerciseId: string, setNumber: number, updates: Partial<SessionSet>) => void;
}

export function useActiveWorkout(sessionId: string): UseActiveWorkoutReturn {
  const { 
    activeSession, 
    updateActiveSession, 
    endSession,
    addSet: storeAddSet 
  } = useWorkoutSessionStore();
  
  const session = activeSession?.id === sessionId ? activeSession : null;
  
  const [restTimer, setRestTimer] = useState<RestTimerState | null>(null);
  const [remainingRest, setRemainingRest] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const rAFRef = useRef<number | null>(null);
  const elapsedIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionStartTimeRef = useRef<number>(Date.now());

  // Keep screen awake while this hook is active
  useKeepAwake();

  // Elapsed time counter (updates every second)
  useEffect(() => {
    if (!session) return;
    
    const updateElapsed = () => {
      setElapsedTime(Math.floor((Date.now() - sessionStartTimeRef.current) / 1000));
    };
    
    updateElapsed();
    elapsedIntervalRef.current = setInterval(updateElapsed, 1000);
    
    return () => {
      if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
      if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
    };
  }, [session]);

  // Rest timer using requestAnimationFrame (no drift, survives background)
  useEffect(() => {
    if (!restTimer) {
      setRemainingRest(0);
      if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
      return;
    }

    const tick = () => {
      const remaining = restTimer.targetEndTime - Date.now();
      if (remaining <= 0) {
        // Timer complete - haptic feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setRestTimer(null);
        setRemainingRest(0);
        return;
      }
      setRemainingRest(remaining);
      rAFRef.current = requestAnimationFrame(tick);
    };

    rAFRef.current = requestAnimationFrame(tick);
    return () => {
      if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
    };
  }, [restTimer]);

  // Calculate total volume from session
  const totalVolume = session?.exercises?.reduce((sum, ex) => 
    sum + (ex.sets?.reduce((s, set) => s + ((set.weight || 0) * (set.reps || 0)), 0) || 0)
  , 0) || 0;

  const startRestTimer = useCallback((exerciseId: string, setNumber: number, seconds: number) => {
    const targetEndTime = Date.now() + seconds * 1000;
    setRestTimer({ targetEndTime, exerciseId, setNumber });
    // Light haptic when timer starts
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const cancelRestTimer = useCallback(() => {
    setRestTimer(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const completeSet = useCallback((
    sessionExerciseId: string, 
    setNumber: number, 
    weight?: number, 
    reps?: number, 
    rpe?: number
  ) => {
    if (!session) return;

    // Optimistic update - instant UI feedback
    const updatedExercises = session.exercises.map(ex => {
      if (ex.id !== sessionExerciseId) return ex;
      
      return {
        ...ex,
        sets: ex.sets.map(set => {
          if (set.setNumber !== setNumber) return set;
          return {
            ...set,
            completed: true,
            weight: weight ?? set.weight,
            reps: reps ?? set.reps,
            rpe: rpe ?? set.rpe,
          };
        }),
      };
    });

    const newTotalVolume = updatedExercises.reduce((sum, ex) => 
      sum + ex.sets.reduce((s, set) => s + ((set.weight || 0) * (set.reps || 0)), 0)
    , 0);

    // Instant UI update
    updateActiveSession({
      exercises: updatedExercises,
      totalVolume: newTotalVolume,
    });

    // Haptic feedback for completion
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Background DB persistence (fire-and-forget)
    // The store's updateActiveSession will handle persistence
  }, [session, updateActiveSession]);

  const updateSet = useCallback((
    sessionExerciseId: string, 
    setNumber: number, 
    updates: Partial<SessionSet>
  ) => {
    if (!session) return;

    const updatedExercises = session.exercises.map(ex => {
      if (ex.id !== sessionExerciseId) return ex;
      
      return {
        ...ex,
        sets: ex.sets.map(set => 
          set.setNumber === setNumber ? { ...set, ...updates } : set
        ),
      };
    });

    updateActiveSession({ exercises: updatedExercises });
  }, [session, updateActiveSession]);

  const completeWorkout = useCallback(() => {
    if (!session) return null;
    
    // Stop any running rest timer
    if (restTimer) {
      cancelRestTimer();
    }
    
    // End session with completion timestamp
    const completedSession = endSession();
    return completedSession;
  }, [session, restTimer, cancelRestTimer, endSession]);

  return {
    session,
    restTimer,
    remainingRest,
    elapsedTime,
    totalVolume,
    startRestTimer,
    cancelRestTimer,
    completeSet,
    completeWorkout,
    updateSet,
  };
}

// Helper to format time as MM:SS
export function formatTime(ms: number): string {
  if (ms <= 0) return '0:00';
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Helper to format elapsed time as HH:MM:SS
export function formatElapsed(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}