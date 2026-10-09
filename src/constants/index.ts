export const MUSCLE_GROUPS = [
  { id: 'chest', name: 'Chest', icon: 'dumbbell' },
  { id: 'back', name: 'Back', icon: 'dumbbell' },
  { id: 'shoulders', name: 'Shoulders', icon: 'dumbbell' },
  { id: 'biceps', name: 'Biceps', icon: 'dumbbell' },
  { id: 'triceps', name: 'Triceps', icon: 'dumbbell' },
  { id: 'forearms', name: 'Forearms', icon: 'dumbbell' },
  { id: 'abs', name: 'Abs', icon: 'dumbbell' },
  { id: 'obliques', name: 'Obliques', icon: 'dumbbell' },
  { id: 'lower_back', name: 'Lower Back', icon: 'dumbbell' },
  { id: 'glutes', name: 'Glutes', icon: 'dumbbell' },
  { id: 'quadriceps', name: 'Quadriceps', icon: 'dumbbell' },
  { id: 'hamstrings', name: 'Hamstrings', icon: 'dumbbell' },
  { id: 'calves', name: 'Calves', icon: 'dumbbell' },
  { id: 'traps', name: 'Traps', icon: 'dumbbell' },
  { id: 'lats', name: 'Lats', icon: 'dumbbell' },
  { id: 'cardio', name: 'Cardio', icon: 'heart' },
] as const;

export type MuscleGroup = typeof MUSCLE_GROUPS[number]['id'];

export const MUSCLE_GROUP_IDS = MUSCLE_GROUPS.map(m => m.id) as MuscleGroup[];

export const EQUIPMENT_TYPES = [
  'barbell', 'dumbbell', 'machine', 'cable', 'bodyweight',
  'kettlebell', 'band', 'smith_machine', 'plate', 'ez_bar',
  'trap_bar', 'pullup_bar', 'dip_bars', 'bench', 'incline_bench',
  'decline_bench', 'cardio_machine', 'other'
] as const;

export const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;

export const GOAL_TYPES = [
  { id: 'lose_weight', name: 'Lose Weight', icon: 'trending-down' },
  { id: 'gain_muscle', name: 'Gain Muscle', icon: 'trending-up' },
  { id: 'maintain', name: 'Maintain', icon: 'minus' },
  { id: 'endurance', name: 'Endurance', icon: 'heart' },
  { id: 'strength', name: 'Strength', icon: 'zap' },
] as const;

export const ACTIVITY_LEVELS = [
  { id: 'sedentary', name: 'Sedentary', description: 'Little or no exercise', multiplier: 1.2 },
  { id: 'light', name: 'Light', description: 'Light exercise 1-3 days/week', multiplier: 1.375 },
  { id: 'moderate', name: 'Moderate', description: 'Moderate exercise 3-5 days/week', multiplier: 1.55 },
  { id: 'active', name: 'Active', description: 'Hard exercise 6-7 days/week', multiplier: 1.725 },
  { id: 'very_active', name: 'Very Active', description: 'Very hard exercise, physical job', multiplier: 1.9 },
] as const;

export const CARDIO_TYPES = [
  { id: 'running', name: 'Running', icon: 'footprints', met: 8.0 },
  { id: 'cycling', name: 'Cycling', icon: 'bike', met: 7.5 },
  { id: 'walking', name: 'Walking', icon: 'footprints', met: 3.5 },
  { id: 'swimming', name: 'Swimming', icon: 'waves', met: 6.0 },
  { id: 'rowing', name: 'Rowing', icon: 'navigation', met: 7.0 },
  { id: 'elliptical', name: 'Elliptical', icon: 'circle', met: 5.0 },
  { id: 'stair_climber', name: 'Stair Climber', icon: 'chevrons-up', met: 9.0 },
  { id: 'hiit', name: 'HIIT', icon: 'zap', met: 10.0 },
  { id: 'other', name: 'Other', icon: 'more-horizontal', met: 5.0 },
] as const;

export const MEAL_TYPES = [
  { id: 'breakfast', name: 'Breakfast', icon: 'sunrise' },
  { id: 'lunch', name: 'Lunch', icon: 'sun' },
  { id: 'dinner', name: 'Dinner', icon: 'moon' },
  { id: 'snack', name: 'Snack', icon: 'cookie' },
  { id: 'pre_workout', name: 'Pre-Workout', icon: 'zap' },
  { id: 'post_workout', name: 'Post-Workout', icon: 'refresh-cw' },
] as const;

export const FOOD_UNITS = ['g', 'ml', 'oz', 'cup', 'tbsp', 'tsp', 'piece', 'slice'] as const;

export const ACHIEVEMENT_TYPES = [
  { id: 'first_workout', name: 'First Workout', icon: 'award', description: 'Complete your first workout' },
  { id: 'workout_streak', name: 'Streak Master', icon: 'flame', description: 'Work out 7 days in a row' },
  { id: 'total_workouts', name: 'Centurion', icon: 'target', description: 'Complete 100 workouts' },
  { id: 'total_volume', name: 'Volume King', icon: 'bar-chart', description: 'Lift 1,000,000 kg total volume' },
  { id: 'cardio_distance', name: 'Marathon Runner', icon: 'footprints', description: 'Run 42.2 km total' },
  { id: 'weight_loss', name: 'Transformation', icon: 'trending-down', description: 'Lose 10 kg' },
  { id: 'muscle_gain', name: 'Gains', icon: 'trending-up', description: 'Gain 5 kg muscle' },
  { id: 'pr_personal_record', name: 'Record Breaker', icon: 'trophy', description: 'Set a new personal record' },
  { id: 'plan_completed', name: 'Program Graduate', icon: 'graduation-cap', description: 'Complete a workout plan' },
  { id: 'consistency', name: 'Consistent', icon: 'calendar', description: 'Work out 3x/week for a month' },
] as const;

export const DEFAULT_PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];

export const BAR_WEIGHTS = {
  standard: 20,
  olympic: 20,
  ez_bar: 10,
  trap_bar: 25,
  smith_machine: 20,
  women: 15,
};

export const REST_TIMER_PRESETS = [
  { label: '30 sec', seconds: 30 },
  { label: '60 sec', seconds: 60 },
  { label: '90 sec', seconds: 90 },
  { label: '2 min', seconds: 120 },
  { label: '3 min', seconds: 180 },
  { label: '5 min', seconds: 300 },
];

export const BODY_MEASUREMENT_FIELDS = [
  { id: 'chest', name: 'Chest', unit: 'cm' },
  { id: 'waist', name: 'Waist', unit: 'cm' },
  { id: 'hips', name: 'Hips', unit: 'cm' },
  { id: 'leftArm', name: 'Left Arm', unit: 'cm' },
  { id: 'rightArm', name: 'Right Arm', unit: 'cm' },
  { id: 'leftThigh', name: 'Left Thigh', unit: 'cm' },
  { id: 'rightThigh', name: 'Right Thigh', unit: 'cm' },
  { id: 'leftCalf', name: 'Left Calf', unit: 'cm' },
  { id: 'rightCalf', name: 'Right Calf', unit: 'cm' },
  { id: 'neck', name: 'Neck', unit: 'cm' },
  { id: 'shoulders', name: 'Shoulders', unit: 'cm' },
] as const;

export const PROGRESS_PHOTO_TYPES = [
  { id: 'front', name: 'Front', icon: 'user' },
  { id: 'side', name: 'Side', icon: 'user' },
  { id: 'back', name: 'Back', icon: 'user' },
  { id: 'custom', name: 'Custom', icon: 'plus' },
] as const;

export const APP_COLORS = {
  light: {
    primary: '#2563EB',
    primaryLight: '#DBEAFE',
    secondary: '#059669',
    secondaryLight: '#D1FAE5',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceVariant: '#F1F5F9',
    text: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    border: '#E2E8F0',
    error: '#DC2626',
    errorLight: '#FEF2F2',
    success: '#059669',
    successLight: '#D1FAE5',
    warning: '#D97706',
    warningLight: '#FFFBEB',
    accent: '#7C3AED',
    accentLight: '#EDE9FE',
  },
  dark: {
    primary: '#3B82F6',
    primaryLight: '#1E3A5F',
    secondary: '#10B981',
    secondaryLight: '#064E3B',
    background: '#0F172A',
    surface: '#1E293B',
    surfaceVariant: '#334155',
    text: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textMuted: '#64748B',
    border: '#334155',
    error: '#EF4444',
    errorLight: '#7F1D1D',
    success: '#10B981',
    successLight: '#064E3B',
    warning: '#F59E0B',
    warningLight: '#78350F',
    accent: '#A855F7',
    accentLight: '#4C1D95',
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const FONT_WEIGHTS = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const ANIMATION_DURATION = {
  fast: 150,
  normal: 250,
  slow: 350,
};

export const STORAGE_KEYS = {
  USER_EMAIL: 'userEmail',
  AUTH_TOKEN: 'authToken',
  SETTINGS: 'settings',
  ONBOARDING_COMPLETE: 'onboardingComplete',
  LAST_SYNC: 'lastSync',
} as const;

export const DATE_FORMATS = {
  short: 'MMM d',
  medium: 'MMM d, yyyy',
  long: 'MMMM d, yyyy',
  time: 'HH:mm',
  dateTime: 'MMM d, yyyy HH:mm',
  isoDate: 'yyyy-MM-dd',
  isoDateTime: "yyyy-MM-dd'T'HH:mm:ss",
} as const;

export const REGEX = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
} as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
export const SUPPORTED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];

export const PAGINATION_LIMIT = 20;
export const MAX_SEARCH_RESULTS = 50;
export const DEBOUNCE_DELAY = 300;

export const ROUTES = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
  },
  main: {
    home: '/',
    workouts: '/workouts',
    exercises: '/exercises',
    plans: '/plans',
    progress: '/progress',
    nutrition: '/nutrition',
    cardio: '/cardio',
    settings: '/settings',
    profile: '/profile',
  },
  workout: {
    active: '/workout/active',
    history: '/workout/history',
    detail: '/workout/:id',
  },
  plan: {
    detail: '/plan/:id',
    builder: '/plan/builder',
  },
  exercise: {
    detail: '/exercise/:id',
    library: '/exercises/library',
  },
  settings: {
    general: '/settings/general',
    notifications: '/settings/notifications',
    privacy: '/settings/privacy',
    units: '/settings/units',
    theme: '/settings/theme',
    backup: '/settings/backup',
  },
} as const;

export const API_ENDPOINTS = {
  base: process.env.EXPO_PUBLIC_API_URL || 'https://api.gymapp.com/v1',
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    me: '/auth/me',
  },
  users: {
    list: '/users',
    detail: '/users/:id',
    update: '/users/:id',
    avatar: '/users/:id/avatar',
  },
  exercises: {
    list: '/exercises',
    detail: '/exercises/:id',
    search: '/exercises/search',
    muscleGroup: '/exercises/muscle/:group',
  },
  workouts: {
    list: '/workouts',
    detail: '/workouts/:id',
    start: '/workouts/:id/start',
    complete: '/workouts/:id/complete',
    sets: '/workouts/:id/sets',
  },
  plans: {
    list: '/plans',
    detail: '/plans/:id',
    create: '/plans',
    update: '/plans/:id',
    delete: '/plans/:id',
  },
  progress: {
    list: '/progress',
    create: '/progress',
    photos: '/progress/photos',
  },
  nutrition: {
    list: '/nutrition',
    create: '/nutrition',
    foods: '/nutrition/foods',
  },
  cardio: {
    list: '/cardio',
    create: '/cardio',
    routes: '/cardio/routes',
  },
  achievements: {
    list: '/achievements',
    check: '/achievements/check',
  },
  sync: {
    push: '/sync/push',
    pull: '/sync/pull',
  },
} as const;

export const NOTIFICATION_CHANNELS = {
  workoutReminder: 'workout-reminder',
  progressReminder: 'progress-reminder',
  achievement: 'achievement',
  weeklyReport: 'weekly-report',
  restTimer: 'rest-timer',
} as const;