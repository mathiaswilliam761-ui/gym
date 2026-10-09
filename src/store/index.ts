import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  User, Exercise, WorkoutPlan, WorkoutSession, CardioSession, 
  ProgressEntry, NutritionEntry, Achievement, Settings,
  CalorieCalculation, PlateCalculation, OneRMCalculation,
  RestTimerConfig, MuscleGroup
} from '../types';
import { 
  createUser, getUserById, getUserByEmail, updateUser, getAllUsers,
  getAllExercises, getExercisesByMuscleGroup, searchExercises,
  getWorkoutPlansByUser, getWorkoutPlanWithDetails,
  createWorkoutSession, updateWorkoutSession, getWorkoutSessionById, getUserWorkoutSessions,
  createCardioSession, getUserCardioSessions,
  createProgressEntry, getUserProgressEntries,
  createNutritionEntry, getUserNutritionEntries,
  createAchievement, getUserAchievements,
  getSettings, upsertSettings,
  seedDefaultExercises
} from '../db';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'role'>) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  restoreSession: () => Promise<void>;
}

interface ExerciseState {
  exercises: Exercise[];
  filteredExercises: Exercise[];
  selectedMuscleGroup: MuscleGroup | null;
  searchQuery: string;
  loadExercises: () => void;
  filterByMuscleGroup: (group: MuscleGroup | null) => void;
  setSearchQuery: (query: string) => void;
  getExerciseById: (id: string) => Exercise | undefined;
}

interface WorkoutPlanState {
  plans: WorkoutPlan[];
  currentPlan: WorkoutPlan | null;
  loadUserPlans: (userId: string) => void;
  setCurrentPlan: (plan: WorkoutPlan | null) => void;
}

interface WorkoutSessionState {
  activeSession: WorkoutSession | null;
  sessionHistory: WorkoutSession[];
  startSession: (session: Omit<WorkoutSession, 'id'>) => WorkoutSession;
  updateActiveSession: (updates: Partial<WorkoutSession>) => void;
  endSession: () => WorkoutSession | null;
  loadHistory: (userId: string) => void;
  getSessionById: (id: string) => WorkoutSession | undefined;
  addSet: (exerciseId: string, set: { weight?: number; reps?: number; rpe?: number; isWarmup?: boolean }) => void;
  completeSet: (sessionExerciseId: string, setNumber: number) => void;
}

interface CardioState {
  activeCardio: CardioSession | null;
  cardioHistory: CardioSession[];
  startCardio: (session: Omit<CardioSession, 'id'>) => CardioSession;
  updateCardio: (updates: Partial<CardioSession>) => void;
  endCardio: () => CardioSession | null;
  loadHistory: (userId: string) => void;
}

interface ProgressState {
  entries: ProgressEntry[];
  loadProgress: (userId: string) => void;
  addEntry: (entry: Omit<ProgressEntry, 'id'>) => ProgressEntry;
}

interface NutritionState {
  entries: NutritionEntry[];
  loadNutrition: (userId: string, startDate?: string, endDate?: string) => void;
  addEntry: (entry: Omit<NutritionEntry, 'id'>) => NutritionEntry;
  getTodaysNutrition: (userId: string) => NutritionEntry | null;
}

interface AchievementState {
  achievements: Achievement[];
  loadAchievements: (userId: string) => void;
  checkAndAward: (userId: string) => Achievement[];
}

interface SettingsState {
  settings: Settings | null;
  loadSettings: (userId: string) => void;
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
}

interface CalculatorState {
  calorieCalc: CalorieCalculation | null;
  plateCalc: PlateCalculation | null;
  oneRMCalc: OneRMCalculation | null;
  restTimerConfig: RestTimerConfig;
  calculateCalories: (user: User) => CalorieCalculation;
  calculatePlates: (targetWeight: number, barWeight: number, plates: number[]) => PlateCalculation;
  calculateOneRM: (weight: number, reps: number) => OneRMCalculation;
  updateRestTimer: (config: Partial<RestTimerConfig>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      login: async (email: string) => {
        const user = getUserByEmail(email);
        if (user) {
          set({ user, isAuthenticated: true });
          return true;
        }
        return false;
      },
      register: async (userData) => {
        const existing = getUserByEmail(userData.email);
        if (existing) return false;
        const user = createUser({ ...userData, role: 'user' });
        set({ user, isAuthenticated: true });
        return true;
      },
      logout: () => set({ user: null, isAuthenticated: false }),
      updateProfile: async (updates) => {
        const { user } = get();
        if (user) {
          const updated = updateUser(user.id, updates);
          if (updated) set({ user: updated });
        }
      },
      restoreSession: async () => {
              // Session restoration is handled by the persist middleware
              // This function can be called to trigger any additional initialization
            },
          }),
          {
      name: 'auth-storage',
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          try { return localStorage.getItem(name); } catch { return null; }
        },
        setItem: (name, value) => { try { localStorage.setItem(name, value); } catch {} },
        removeItem: (name) => { try { localStorage.removeItem(name); } catch {} },
      })),
      partialize: (state: AuthState) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export const useExerciseStore = create<ExerciseState>()((set, get) => ({
  exercises: [],
  filteredExercises: [],
  selectedMuscleGroup: null,
  searchQuery: '',
  loadExercises: () => {
    const exercises = getAllExercises();
    set({ exercises, filteredExercises: exercises });
  },
  filterByMuscleGroup: (group) => {
    set({ selectedMuscleGroup: group });
    const { exercises, searchQuery } = get();
    let filtered = group ? exercises.filter(e => e.muscleGroup === group) : exercises;
    if (searchQuery) {
      filtered = filtered.filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    set({ filteredExercises: filtered });
  },
  setSearchQuery: (query) => {
    set({ searchQuery: query });
    const { exercises, selectedMuscleGroup } = get();
    let filtered = selectedMuscleGroup 
      ? exercises.filter(e => e.muscleGroup === selectedMuscleGroup)
      : exercises;
    if (query) {
      filtered = filtered.filter(e => e.name.toLowerCase().includes(query.toLowerCase()));
    }
    set({ filteredExercises: filtered });
  },
  getExerciseById: (id) => get().exercises.find(e => e.id === id),
}));

export const useWorkoutPlanStore = create<WorkoutPlanState>()((set) => ({
  plans: [],
  currentPlan: null,
  loadUserPlans: (userId) => {
    const plans = getWorkoutPlansByUser(userId);
    set({ plans });
  },
  setCurrentPlan: (plan) => set({ currentPlan: plan }),
}));

export const useWorkoutSessionStore = create<WorkoutSessionState>()((set, get) => ({
  activeSession: null,
  sessionHistory: [],
  startSession: (session) => {
    const newSession = createWorkoutSession(session);
    set({ activeSession: newSession });
    return newSession;
  },
  updateActiveSession: (updates) => {
    const { activeSession } = get();
    if (activeSession) {
      const updated = { ...activeSession, ...updates };
      set({ activeSession: updated });
    }
  },
  endSession: () => {
    const { activeSession } = get();
    if (activeSession) {
      const completed = updateWorkoutSession(activeSession.id, {
        completedAt: new Date().toISOString(),
        durationSeconds: Math.floor((Date.now() - new Date(activeSession.startedAt).getTime()) / 1000),
      });
      set({ activeSession: null });
      return completed;
    }
    return null;
  },
  loadHistory: (userId) => {
    const history = getUserWorkoutSessions(userId);
    set({ sessionHistory: history });
  },
  getSessionById: (id) => {
    return get().sessionHistory.find(s => s.id === id);
  },
  addSet: (exerciseId, setData) => {
    // Implementation for adding sets during active session
  },
  completeSet: (sessionExerciseId, setNumber) => {
    // Implementation for marking set complete
  },
}));

export const useCardioStore = create<CardioState>()((set) => ({
  activeCardio: null,
  cardioHistory: [],
  startCardio: (session) => {
    const newSession = createCardioSession(session);
    set({ activeCardio: newSession });
    return newSession;
  },
  updateCardio: (updates) => {
    set((state) => ({
      activeCardio: state.activeCardio ? { ...state.activeCardio, ...updates } : null,
    }));
  },
  endCardio: () => {
    let completed: CardioSession | null = null;
    set((state) => {
      if (state.activeCardio) {
        completed = { ...state.activeCardio, completedAt: new Date().toISOString() };
        return { activeCardio: null };
      }
      return state;
    });
    return completed;
  },
  loadHistory: (userId) => {
    const history = getUserCardioSessions(userId);
    set({ cardioHistory: history });
  },
}));

export const useProgressStore = create<ProgressState>()((set) => ({
  entries: [],
  loadProgress: (userId) => {
    const entries = getUserProgressEntries(userId);
    set({ entries });
  },
  addEntry: (entry) => {
    const newEntry = createProgressEntry(entry);
    set((state) => ({ entries: [newEntry, ...state.entries] }));
    return newEntry;
  },
}));

export const useNutritionStore = create<NutritionState>()((set) => ({
  entries: [],
  loadNutrition: (userId, startDate, endDate) => {
    const entries = getUserNutritionEntries(userId, startDate, endDate);
    set({ entries });
  },
  addEntry: (entry) => {
    const newEntry = createNutritionEntry(entry);
    set((state) => ({ entries: [newEntry, ...state.entries] }));
    return newEntry;
  },
  getTodaysNutrition: (userId) => {
    const today = new Date().toISOString().split('T')[0];
    const entries = getUserNutritionEntries(userId, today, today);
    return entries[0] || null;
  },
}));

export const useAchievementStore = create<AchievementState>()((set) => ({
  achievements: [],
  loadAchievements: (userId) => {
    const achievements = getUserAchievements(userId);
    set({ achievements });
  },
  checkAndAward: (userId) => {
    // Implementation for checking achievements based on user progress
    const newAchievements: Achievement[] = [];
    // Logic to check and award achievements
    if (newAchievements.length > 0) {
      set((state) => ({ achievements: [...newAchievements, ...state.achievements] }));
    }
    return newAchievements;
  },
}));

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: null,
      loadSettings: (userId) => {
        const settings = getSettings(userId);
        set({ settings });
      },
      updateSettings: async (newSettings) => {
        const { settings } = get();
        if (settings) {
          const updated = upsertSettings({ ...settings, ...newSettings });
          set({ settings: updated });
        }
      },
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          try { return localStorage.getItem(name); } catch { return null; }
        },
        setItem: (name, value) => { try { localStorage.setItem(name, value); } catch {} },
        removeItem: (name) => { try { localStorage.removeItem(name); } catch {} },
      })),
    }
  )
);

export const useCalculatorStore = create<CalculatorState>()((set) => ({
  calorieCalc: null,
  plateCalc: null,
  oneRMCalc: null,
  restTimerConfig: {
    defaultRestSeconds: 90,
    warningSeconds: 10,
    soundEnabled: true,
    vibrationEnabled: true,
    autoStart: false,
  },
  calculateCalories: (user) => {
    // Mifflin-St Jeor Equation
    let bmr = 0;
    if (user.gender === 'male') {
      bmr = 10 * (user.weight || 70) + 6.25 * (user.height || 175) - 5 * (user.age || 25) + 5;
    } else {
      bmr = 10 * (user.weight || 70) + 6.25 * (user.height || 175) - 5 * (user.age || 25) - 161;
    }
    
    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };
    
    const tdee = bmr * (activityMultipliers[user.activityLevel || 'moderate'] || 1.55);
    
    let targetCalories = tdee;
    if (user.goal === 'lose_weight') targetCalories -= 500;
    else if (user.goal === 'gain_muscle') targetCalories += 300;
    
    const macroSplit = { protein: 30, carbs: 40, fat: 30 };
    const targetMacros = {
      protein: Math.round(targetCalories * 0.3 / 4),
      carbs: Math.round(targetCalories * 0.4 / 4),
      fat: Math.round(targetCalories * 0.3 / 9),
    };
    
    const calc = { bmr: Math.round(bmr), tdee: Math.round(tdee), targetCalories: Math.round(targetCalories), macroSplit, targetMacros };
    set({ calorieCalc: calc });
    return calc;
  },
  calculatePlates: (targetWeight, barWeight = 20, availablePlates = [25, 20, 15, 10, 5, 2.5, 1.25]) => {
    const weightPerSide = (targetWeight - barWeight) / 2;
    if (weightPerSide < 0) {
      return { targetWeight, barWeight, availablePlates, platesPerSide: [], actualWeight: barWeight, difference: targetWeight - barWeight };
    }
    
    let remaining = weightPerSide;
    const platesPerSide: { plate: number; count: number }[] = [];
    
    for (const plate of availablePlates.sort((a, b) => b - a)) {
      const count = Math.floor(remaining / plate);
      if (count > 0) {
        platesPerSide.push({ plate, count });
        remaining -= plate * count;
      }
    }
    
    const actualWeight = barWeight + platesPerSide.reduce((sum, p) => sum + p.plate * p.count * 2, 0);
    const calc = { targetWeight, barWeight, availablePlates, platesPerSide, actualWeight, difference: targetWeight - actualWeight };
    set({ plateCalc: calc });
    return calc;
  },
  calculateOneRM: (weight, reps) => {
    // Epley formula
    const estimated1RM = weight * (1 + reps / 30);
    const percentages: Record<string, number> = {};
    for (let p = 50; p <= 100; p += 5) {
      percentages[`${p}%`] = Math.round(estimated1RM * p / 100);
    }
    const calc = { weight, reps, estimated1RM: Math.round(estimated1RM), percentages };
    set({ oneRMCalc: calc });
    return calc;
  },
  updateRestTimer: (config) => {
    set((state) => ({ restTimerConfig: { ...state.restTimerConfig, ...config } }));
  },
}));

// Initialize database with default exercises
seedDefaultExercises();