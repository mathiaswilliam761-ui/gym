export type UserRole = 'user' | 'admin' | 'trainer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  height?: number; // cm
  weight?: number; // kg
  age?: number;
  gender?: 'male' | 'female' | 'other';
  activityLevel?: ActivityLevel;
  goal?: GoalType;
  targetWeight?: number;
  createdAt: string;
  updatedAt: string;
  version?: number;
  syncedAt?: string;
}

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type GoalType = 'lose_weight' | 'gain_muscle' | 'maintain' | 'endurance' | 'strength';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  secondaryMuscles?: MuscleGroup[];
  equipment: EquipmentType[];
  difficulty: DifficultyLevel;
  instructions: string[];
  tips?: string[];
  videoUrl?: string;
  imageUrl?: string;
  isCustom: boolean;
  createdBy?: string;
  createdAt: string;
  version?: number;
  syncedAt?: string;
}

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'abs'
  | 'obliques'
  | 'lower_back'
  | 'glutes'
  | 'quadriceps'
  | 'hamstrings'
  | 'calves'
  | 'traps'
  | 'lats'
  | 'cardio';

export type EquipmentType =
  | 'barbell'
  | 'dumbbell'
  | 'machine'
  | 'cable'
  | 'bodyweight'
  | 'kettlebell'
  | 'band'
  | 'smith_machine'
  | 'plate'
  | 'ez_bar'
  | 'trap_bar'
  | 'pullup_bar'
  | 'dip_bars'
  | 'bench'
  | 'incline_bench'
  | 'decline_bench'
  | 'cardio_machine'
  | 'other';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  goal: GoalType;
  difficulty: DifficultyLevel;
  durationWeeks: number;
  daysPerWeek: number;
  createdBy: string;
  isPublic: boolean;
  isCustom: boolean;
  tags: string[];
  workoutDays: WorkoutDay[];
  createdAt: string;
  updatedAt: string;
  version?: number;
  syncedAt?: string;
}

export interface WorkoutDay {
  id: string;
  planId: string;
  dayIndex: number; // 0-6
  name: string;
  focus: MuscleGroup[];
  exercises: WorkoutExercise[];
  notes?: string;
  version?: number;
  syncedAt?: string;
}

export interface WorkoutExercise {
  id: string;
  dayId: string;
  exerciseId: string;
  order: number;
  sets: number;
  reps: string; // e.g., "8-12", "10", "AMRAP"
  restSeconds: number;
  rpe?: number; // Rate of Perceived Exertion 1-10
  percentage1RM?: number;
  notes?: string;
  exercise?: Exercise; // populated when joined
  version?: number;
  syncedAt?: string;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  planId?: string;
  dayId?: string;
  name: string;
  startedAt: string;
  completedAt?: string;
  durationSeconds?: number;
  totalVolume?: number; // kg * reps
  exercises: SessionExercise[];
  notes?: string;
  rating?: 1 | 2 | 3 | 4 | 5;
  version?: number;
  syncedAt?: string;
}

export interface SessionExercise {
  id: string;
  sessionId: string;
  exerciseId: string;
  order: number;
  sets: SessionSet[];
  exercise?: Exercise; // populated when joined
  restSeconds?: number;
  version?: number;
  syncedAt?: string;
}

export interface SessionSet {
  id: string;
  sessionExerciseId: string;
  setNumber: number;
  weight?: number; // kg
  reps?: number;
  distance?: number; // meters (for cardio)
  durationSeconds?: number; // for timed exercises
  rpe?: number;
  completed: boolean;
  isWarmup: boolean;
  version?: number;
  syncedAt?: string;
}

export interface CardioSession {
  id: string;
  userId: string;
  type: CardioType;
  startedAt: string;
  completedAt?: string;
  durationSeconds: number;
  distanceMeters: number;
  caloriesBurned: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
  avgPace?: number; // min/km
  route?: GeoPoint[];
  notes?: string;
  version?: number;
  syncedAt?: string;
}

export type CardioType = 'running' | 'cycling' | 'walking' | 'swimming' | 'rowing' | 'elliptical' | 'stair_climber' | 'hiit' | 'other';

export interface GeoPoint {
  latitude: number;
  longitude: number;
  timestamp: string;
  altitude?: number;
  accuracy?: number;
}

export interface ProgressEntry {
  id: string;
  userId: string;
  date: string;
  weight?: number; // kg
  bodyFatPercentage?: number;
  muscleMass?: number; // kg
  measurements: BodyMeasurements;
  photos: ProgressPhoto[];
  notes?: string;
  version?: number;
  syncedAt?: string;
}

export interface BodyMeasurements {
  chest?: number;
  waist?: number;
  hips?: number;
  leftArm?: number;
  rightArm?: number;
  leftThigh?: number;
  rightThigh?: number;
  leftCalf?: number;
  rightCalf?: number;
  neck?: number;
  shoulders?: number;
}

export interface ProgressPhoto {
  id: string;
  type: 'front' | 'side' | 'back' | 'custom';
  uri: string;
  date: string;
}

export interface NutritionEntry {
  id: string;
  userId: string;
  date: string;
  meals: Meal[];
  totalCalories: number;
  totalProtein: number; // g
  totalCarbs: number; // g
  totalFat: number; // g
  totalFiber: number; // g
  waterMl: number;
  version?: number;
  syncedAt?: string;
}

export interface Meal {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre_workout' | 'post_workout';
  name: string;
  foods: FoodItem[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  time: string;
  version?: number;
  syncedAt?: string;
}

export interface FoodItem {
  id: string;
  name: string;
  amount: number;
  unit: 'g' | 'ml' | 'oz' | 'cup' | 'tbsp' | 'tsp' | 'piece' | 'slice';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  version?: number;
  syncedAt?: string;
}

export interface Achievement {
  id: string;
  userId: string;
  type: AchievementType;
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
  metadata?: Record<string, unknown>;
  version?: number;
  syncedAt?: string;
}

export type AchievementType =
  | 'first_workout'
  | 'workout_streak'
  | 'total_workouts'
  | 'total_volume'
  | 'cardio_distance'
  | 'weight_loss'
  | 'muscle_gain'
  | 'pr_personal_record'
  | 'plan_completed'
  | 'consistency';

export interface Settings {
  userId: string;
  units: 'metric' | 'imperial';
  weightUnit: 'kg' | 'lbs';
  heightUnit: 'cm' | 'ft';
  distanceUnit: 'km' | 'mi';
  energyUnit: 'kcal' | 'kJ';
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large';
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  autoBackup: boolean;
  language: string;
  autoStartRestTimer: boolean;
  hapticFeedback: boolean;
  soundEnabled: boolean;
  keepScreenAwake: boolean;
  version?: number;
  syncedAt?: string;
}

export interface NotificationSettings {
  workoutReminders: boolean;
  workoutReminderTime: string; // HH:mm
  progressReminders: boolean;
  achievementAlerts: boolean;
  weeklyReport: boolean;
  restTimerSound: boolean;
  restTimerVibration: boolean;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  workoutReminders: false,
  workoutReminderTime: '09:00',
  progressReminders: false,
  achievementAlerts: true,
  weeklyReport: false,
  restTimerSound: true,
  restTimerVibration: true,
};

export interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  shareWorkouts: boolean;
  shareProgress: boolean;
  showInLeaderboards: boolean;
}

export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  profileVisibility: 'private',
  shareWorkouts: false,
  shareProgress: false,
  showInLeaderboards: false,
};

export interface CalorieCalculation {
  bmr: number; // Basal Metabolic Rate
  tdee: number; // Total Daily Energy Expenditure
  targetCalories: number;
  macroSplit: {
    protein: number; // %
    carbs: number; // %
    fat: number; // %
  };
  targetMacros: {
    protein: number; // g
    carbs: number; // g
    fat: number; // g
  };
}

export interface PlateCalculation {
  targetWeight: number; // kg
  barWeight: number; // kg
  availablePlates: number[]; // kg
  platesPerSide: PlateCount[];
  actualWeight: number;
  difference: number;
}

export interface PlateCount {
  plate: number;
  count: number;
}

export interface OneRMCalculation {
  weight: number;
  reps: number;
  estimated1RM: number;
  percentages: Record<string, number>; // e.g., "50%": 50, "60%": 60, etc.
}

export interface RestTimerConfig {
  defaultRestSeconds: number;
  warningSeconds: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  autoStart: boolean;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  exercises: TemplateExercise[];
  estimatedDurationMinutes: number;
  difficulty: DifficultyLevel;
  muscleGroups: MuscleGroup[];
  version?: number;
  syncedAt?: string;
}

export interface TemplateExercise {
  exerciseId: string;
  sets: number;
  reps: string;
  restSeconds: number;
  order: number;
  version?: number;
  syncedAt?: string;
}