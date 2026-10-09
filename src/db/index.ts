import { openDatabaseSync } from 'expo-sqlite';
import { v7 as uuidv7 } from 'uuid';
import { 
  User, Exercise, WorkoutPlan, WorkoutDay, WorkoutExercise, 
  WorkoutSession, SessionExercise, SessionSet, CardioSession, 
  ProgressEntry, NutritionEntry, Meal, FoodItem, Achievement, 
  Settings,
  MuscleGroup, EquipmentType, DifficultyLevel, GoalType,
  CardioType, GeoPoint, BodyMeasurements, ProgressPhoto,
  AchievementType, NotificationSettings, PrivacySettings
} from '../types';
import { runMigrations } from './migrations';

const db = openDatabaseSync('gymapp.db');

export function initDatabase() {
  // Run migrations first (handles schema versioning)
  runMigrations();
  
  db.execSync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    -- Users
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      avatar TEXT,
      height REAL,
      weight REAL,
      age INTEGER,
      gender TEXT,
      activity_level TEXT,
      goal TEXT,
      target_weight REAL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Exercises
    CREATE TABLE IF NOT EXISTS exercises (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      muscle_group TEXT NOT NULL,
      secondary_muscles TEXT, -- JSON array
      equipment TEXT NOT NULL, -- JSON array
      difficulty TEXT NOT NULL,
      instructions TEXT NOT NULL, -- JSON array
      tips TEXT, -- JSON array
      video_url TEXT,
      image_url TEXT,
      is_custom INTEGER NOT NULL DEFAULT 0,
      created_by TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    -- Workout Plans
    CREATE TABLE IF NOT EXISTS workout_plans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      goal TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      duration_weeks INTEGER NOT NULL,
      days_per_week INTEGER NOT NULL,
      created_by TEXT NOT NULL,
      is_public INTEGER NOT NULL DEFAULT 0,
      is_custom INTEGER NOT NULL DEFAULT 0,
      tags TEXT, -- JSON array
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    -- Workout Days
    CREATE TABLE IF NOT EXISTS workout_days (
      id TEXT PRIMARY KEY,
      plan_id TEXT NOT NULL,
      day_index INTEGER NOT NULL,
      name TEXT NOT NULL,
      focus TEXT NOT NULL, -- JSON array
      notes TEXT,
      FOREIGN KEY (plan_id) REFERENCES workout_plans(id) ON DELETE CASCADE
    );

    -- Workout Exercises (in a plan day)
    CREATE TABLE IF NOT EXISTS workout_exercises (
      id TEXT PRIMARY KEY,
      day_id TEXT NOT NULL,
      exercise_id TEXT NOT NULL,
      "order" INTEGER NOT NULL,
      sets INTEGER NOT NULL,
      reps TEXT NOT NULL,
      rest_seconds INTEGER NOT NULL,
      rpe REAL,
      percentage_1rm REAL,
      notes TEXT,
      FOREIGN KEY (day_id) REFERENCES workout_days(id) ON DELETE CASCADE,
      FOREIGN KEY (exercise_id) REFERENCES exercises(id)
    );

    -- Workout Sessions
    CREATE TABLE IF NOT EXISTS workout_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      plan_id TEXT,
      day_id TEXT,
      name TEXT NOT NULL,
      started_at TEXT NOT NULL,
      completed_at TEXT,
      duration_seconds INTEGER,
      total_volume REAL,
      notes TEXT,
      rating INTEGER CHECK (rating BETWEEN 1 AND 5),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (plan_id) REFERENCES workout_plans(id),
      FOREIGN KEY (day_id) REFERENCES workout_days(id)
    );

    -- Session Exercises
    CREATE TABLE IF NOT EXISTS session_exercises (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      exercise_id TEXT NOT NULL,
      "order" INTEGER NOT NULL,
      FOREIGN KEY (session_id) REFERENCES workout_sessions(id) ON DELETE CASCADE,
      FOREIGN KEY (exercise_id) REFERENCES exercises(id)
    );

    -- Session Sets
    CREATE TABLE IF NOT EXISTS session_sets (
      id TEXT PRIMARY KEY,
      session_exercise_id TEXT NOT NULL,
      set_number INTEGER NOT NULL,
      weight REAL,
      reps INTEGER,
      distance REAL,
      duration_seconds INTEGER,
      rpe REAL,
      completed INTEGER NOT NULL DEFAULT 0,
      is_warmup INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (session_exercise_id) REFERENCES session_exercises(id) ON DELETE CASCADE
    );

    -- Cardio Sessions
    CREATE TABLE IF NOT EXISTS cardio_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      started_at TEXT NOT NULL,
      completed_at TEXT,
      duration_seconds INTEGER NOT NULL,
      distance_meters REAL NOT NULL,
      calories_burned REAL NOT NULL,
      avg_heart_rate INTEGER,
      max_heart_rate INTEGER,
      avg_pace REAL,
      route TEXT, -- JSON array of GeoPoints
      notes TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Progress Entries
    CREATE TABLE IF NOT EXISTS progress_entries (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      weight REAL,
      body_fat_percentage REAL,
      muscle_mass REAL,
      measurements TEXT NOT NULL, -- JSON
      photos TEXT NOT NULL, -- JSON array
      notes TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Nutrition Entries
    CREATE TABLE IF NOT EXISTS nutrition_entries (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      total_calories REAL NOT NULL,
      total_protein REAL NOT NULL,
      total_carbs REAL NOT NULL,
      total_fat REAL NOT NULL,
      total_fiber REAL NOT NULL,
      water_ml REAL NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Meals
    CREATE TABLE IF NOT EXISTS meals (
      id TEXT PRIMARY KEY,
      nutrition_entry_id TEXT NOT NULL,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      calories REAL NOT NULL,
      protein REAL NOT NULL,
      carbs REAL NOT NULL,
      fat REAL NOT NULL,
      fiber REAL NOT NULL,
      time TEXT NOT NULL,
      FOREIGN KEY (nutrition_entry_id) REFERENCES nutrition_entries(id) ON DELETE CASCADE
    );

    -- Food Items
    CREATE TABLE IF NOT EXISTS food_items (
      id TEXT PRIMARY KEY,
      meal_id TEXT NOT NULL,
      name TEXT NOT NULL,
      amount REAL NOT NULL,
      unit TEXT NOT NULL,
      calories REAL NOT NULL,
      protein REAL NOT NULL,
      carbs REAL NOT NULL,
      fat REAL NOT NULL,
      fiber REAL NOT NULL,
      FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE CASCADE
    );

    -- Achievements
    CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT NOT NULL,
      earned_at TEXT NOT NULL,
      metadata TEXT, -- JSON
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Settings
    CREATE TABLE IF NOT EXISTS settings (
      user_id TEXT PRIMARY KEY,
      units TEXT NOT NULL DEFAULT 'metric',
      weight_unit TEXT NOT NULL DEFAULT 'kg',
      height_unit TEXT NOT NULL DEFAULT 'cm',
      distance_unit TEXT NOT NULL DEFAULT 'km',
      energy_unit TEXT NOT NULL DEFAULT 'kcal',
      theme TEXT NOT NULL DEFAULT 'system',
      accent_color TEXT NOT NULL DEFAULT '#2563EB',
      font_size TEXT NOT NULL DEFAULT 'medium',
      notifications TEXT NOT NULL, -- JSON
      privacy TEXT NOT NULL, -- JSON
      auto_backup INTEGER NOT NULL DEFAULT 1,
      language TEXT NOT NULL DEFAULT 'en',
      auto_start_rest_timer INTEGER NOT NULL DEFAULT 1,
      haptic_feedback INTEGER NOT NULL DEFAULT 1,
      sound_enabled INTEGER NOT NULL DEFAULT 1,
      keep_screen_awake INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Workout Templates
    CREATE TABLE IF NOT EXISTS workout_templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      estimated_duration_minutes INTEGER NOT NULL,
      difficulty TEXT NOT NULL,
      muscle_groups TEXT NOT NULL, -- JSON array
      created_at TEXT NOT NULL
    );

    -- Template Exercises
    CREATE TABLE IF NOT EXISTS template_exercises (
      id TEXT PRIMARY KEY,
      template_id TEXT NOT NULL,
      exercise_id TEXT NOT NULL,
      sets INTEGER NOT NULL,
      reps TEXT NOT NULL,
      rest_seconds INTEGER NOT NULL,
      "order" INTEGER NOT NULL,
      FOREIGN KEY (template_id) REFERENCES workout_templates(id) ON DELETE CASCADE,
      FOREIGN KEY (exercise_id) REFERENCES exercises(id)
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_workout_sessions_user ON workout_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_workout_sessions_date ON workout_sessions(started_at);
    CREATE INDEX IF NOT EXISTS idx_cardio_sessions_user ON cardio_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_progress_entries_user ON progress_entries(user_id);
    CREATE INDEX IF NOT EXISTS idx_nutrition_entries_user ON nutrition_entries(user_id);
    CREATE INDEX IF NOT EXISTS idx_exercises_muscle ON exercises(muscle_group);
    CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements(user_id);
  `);
}

export function generateId(): string {
  return uuidv7();
}

function now(): string {
  return new Date().toISOString();
}

function bindValue(value: unknown): string | number | null {
  if (value === undefined || value === null) return null;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value as string | number;
  }
  return String(value);
}

function json<T>(value: T): string {
  return JSON.stringify(value);
}

function parseJson<T>(value: string | null): T {
  return value ? JSON.parse(value) : ([] as T);
}

// ========== USER OPERATIONS ==========
export function createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
  const id = generateId();
  const timestamp = now();
  const newUser: User = { ...user, id, createdAt: timestamp, updatedAt: timestamp };
  
  db.runSync(
    `INSERT INTO users (id, email, name, role, avatar, height, weight, age, gender, activity_level, goal, target_weight, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      bindValue(newUser.id), bindValue(newUser.email), bindValue(newUser.name), bindValue(newUser.role), bindValue(newUser.avatar),
      bindValue(newUser.height), bindValue(newUser.weight), bindValue(newUser.age), bindValue(newUser.gender),
      bindValue(newUser.activityLevel), bindValue(newUser.goal), bindValue(newUser.targetWeight),
      bindValue(newUser.createdAt), bindValue(newUser.updatedAt)
    ]
  );
  return newUser;
}

export function getUserById(id: string): User | null {
  const row = db.getFirstSync<UserRow>(`SELECT * FROM users WHERE id = ?`, [id]);
  return row ? mapUserRow(row) : null;
}

export function getUserByEmail(email: string): User | null {
  const row = db.getFirstSync<UserRow>(`SELECT * FROM users WHERE email = ?`, [email]);
  return row ? mapUserRow(row) : null;
}

export function updateUser(id: string, updates: Partial<User>): User | null {
  const user = getUserById(id);
  if (!user) return null;
  
  const updated = { ...user, ...updates, updatedAt: now() };
  db.runSync(
    `UPDATE users SET email=?, name=?, role=?, avatar=?, height=?, weight=?, age=?, gender=?, activity_level=?, goal=?, target_weight=?, updated_at=? WHERE id=?`,
    [
      bindValue(updated.email), bindValue(updated.name), bindValue(updated.role),
      bindValue(updated.avatar), bindValue(updated.height), bindValue(updated.weight),
      bindValue(updated.age), bindValue(updated.gender),
      bindValue(updated.activityLevel), bindValue(updated.goal),
      bindValue(updated.targetWeight), bindValue(updated.updatedAt), bindValue(id)
    ]
  );
  return updated;
}

export function getAllUsers(): User[] {
  const rows = db.getAllSync<UserRow>(`SELECT * FROM users ORDER BY created_at DESC`);
  return rows.map(mapUserRow);
}

// ========== EXERCISE OPERATIONS ==========
export function createExercise(exercise: Omit<Exercise, 'id' | 'createdAt'>): Exercise {
  const id = generateId();
  const timestamp = now();
  const newExercise: Exercise = { ...exercise, id, createdAt: timestamp };
  
  db.runSync(
    `INSERT INTO exercises (id, name, muscle_group, secondary_muscles, equipment, difficulty, instructions, tips, video_url, image_url, is_custom, created_by, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      bindValue(newExercise.id), bindValue(newExercise.name), bindValue(newExercise.muscleGroup),
      bindValue(json(newExercise.secondaryMuscles || [])), bindValue(json(newExercise.equipment)),
      bindValue(newExercise.difficulty), bindValue(json(newExercise.instructions)), bindValue(json(newExercise.tips || [])),
      bindValue(newExercise.videoUrl), bindValue(newExercise.imageUrl), bindValue(newExercise.isCustom ? 1 : 0),
      bindValue(newExercise.createdBy), bindValue(newExercise.createdAt)
    ]
  );
  return newExercise;
}

export function getExerciseById(id: string): Exercise | null {
  const row = db.getFirstSync<ExerciseRow>(`SELECT * FROM exercises WHERE id = ?`, [id]);
  return row ? mapExerciseRow(row) : null;
}

export function getExercisesByMuscleGroup(muscleGroup: string): Exercise[] {
  const rows = db.getAllSync<ExerciseRow>(`SELECT * FROM exercises WHERE muscle_group = ? ORDER BY name`, [muscleGroup]);
  return rows.map(mapExerciseRow);
}

export function getAllExercises(): Exercise[] {
  const rows = db.getAllSync<ExerciseRow>(`SELECT * FROM exercises ORDER BY muscle_group, name`);
  return rows.map(mapExerciseRow);
}

export function searchExercises(query: string): Exercise[] {
  const rows = db.getAllSync<ExerciseRow>(
    `SELECT * FROM exercises WHERE name LIKE ? ORDER BY name`,
    [`%${query}%`]
  );
  return rows.map(mapExerciseRow);
}

// ========== WORKOUT PLAN OPERATIONS ==========
export function createWorkoutPlan(plan: Omit<WorkoutPlan, 'id' | 'createdAt' | 'updatedAt'>): WorkoutPlan {
  const id = generateId();
  const timestamp = now();
  const newPlan: WorkoutPlan = { ...plan, id, createdAt: timestamp, updatedAt: timestamp };
  
  db.runSync(
    `INSERT INTO workout_plans (id, name, description, goal, difficulty, duration_weeks, days_per_week, created_by, is_public, is_custom, tags, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [newPlan.id, newPlan.name, newPlan.description, newPlan.goal, newPlan.difficulty,
     newPlan.durationWeeks, newPlan.daysPerWeek, newPlan.createdBy, newPlan.isPublic ? 1 : 0,
     newPlan.isCustom ? 1 : 0, json(newPlan.tags), newPlan.createdAt, newPlan.updatedAt]
  );
  return newPlan;
}

// Batch create plan with days and exercises (for PlanBuilder)
export function createPlanWithDetails(
  plan: Omit<WorkoutPlan, 'id' | 'createdAt' | 'updatedAt'>,
  days: Omit<WorkoutDay, 'id' | 'planId'>[],
  daysExercises: Map<string, Omit<WorkoutExercise, 'id' | 'dayId'>[]>
): WorkoutPlan {
  const id = generateId();
  const timestamp = now();
  const newPlan: WorkoutPlan = { ...plan, id, createdAt: timestamp, updatedAt: timestamp };
  
  // Use a transaction for atomicity
  db.execSync('BEGIN TRANSACTION');
  try {
    // Insert plan
    db.runSync(
      `INSERT INTO workout_plans (id, name, description, goal, difficulty, duration_weeks, days_per_week, created_by, is_public, is_custom, tags, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [newPlan.id, newPlan.name, newPlan.description, newPlan.goal, newPlan.difficulty,
       newPlan.durationWeeks, newPlan.daysPerWeek, newPlan.createdBy, newPlan.isPublic ? 1 : 0,
       newPlan.isCustom ? 1 : 0, json(newPlan.tags), newPlan.createdAt, newPlan.updatedAt]
    );
    
    // Insert days and exercises
    for (const day of days) {
      const dayId = generateId();
      const newDay: WorkoutDay = { ...day, id: dayId, planId: id };
      
      db.runSync(
        `INSERT INTO workout_days (id, plan_id, day_index, name, focus, notes)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [bindValue(newDay.id), bindValue(newDay.planId), bindValue(newDay.dayIndex), bindValue(newDay.name), bindValue(json(newDay.focus)), bindValue(newDay.notes)]
      );
      
      // Insert exercises for this day
      const exercises = daysExercises.get(dayId) || [];
      for (const ex of exercises) {
        const exId = generateId();
        const newEx: WorkoutExercise = { ...ex, id: exId, dayId };
        
        db.runSync(
          `INSERT INTO workout_exercises (id, day_id, exercise_id, "order", sets, reps, rest_seconds, rpe, percentage_1rm, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [bindValue(newEx.id), bindValue(newEx.dayId), bindValue(newEx.exerciseId), bindValue(newEx.order), bindValue(newEx.sets), bindValue(newEx.reps),
           bindValue(newEx.restSeconds), bindValue(newEx.rpe), bindValue(newEx.percentage1RM), bindValue(newEx.notes)]
        );
      }
    }
    
    db.execSync('COMMIT');
    return newPlan;
  } catch (error) {
    db.execSync('ROLLBACK');
    throw error;
  }
}

export function getWorkoutPlanWithDetails(id: string): WorkoutPlan | null {
  const planRow = db.getFirstSync<PlanRow>(`SELECT * FROM workout_plans WHERE id = ?`, [id]);
  if (!planRow) return null;
  
  const plan = mapPlanRow(planRow);
  plan.workoutDays = getWorkoutDaysForPlan(id);
  return plan;
}

export function getWorkoutDaysForPlan(planId: string): WorkoutDay[] {
  const dayRows = db.getAllSync<DayRow>(`SELECT * FROM workout_days WHERE plan_id = ? ORDER BY day_index`, [planId]);
  return dayRows.map(row => {
    const day = mapDayRow(row);
    day.exercises = getWorkoutExercisesForDay(day.id);
    return day;
  });
}

export function getWorkoutExercisesForDay(dayId: string): WorkoutExercise[] {
  const rows = db.getAllSync<WorkoutExerciseRow>(`SELECT * FROM workout_exercises WHERE day_id = ? ORDER BY "order"`, [dayId]);
  return rows.map(row => {
    const we = mapWorkoutExerciseRow(row);
    we.exercise = getExerciseById(row.exercise_id) || undefined;
    return we;
  });
}

export function getWorkoutPlansByUser(userId: string): WorkoutPlan[] {
  const rows = db.getAllSync<PlanRow>(`SELECT * FROM workout_plans WHERE created_by = ? OR is_public = 1 ORDER BY updated_at DESC`, [userId]);
  return rows.map(mapPlanRow);
}

// ========== WORKOUT SESSION OPERATIONS ==========
export function createWorkoutSession(session: Omit<WorkoutSession, 'id'>): WorkoutSession {
  const id = generateId();
  const newSession: WorkoutSession = { ...session, id };
  
  db.runSync(
    `INSERT INTO workout_sessions (id, user_id, plan_id, day_id, name, started_at, completed_at, duration_seconds, total_volume, notes, rating)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [bindValue(newSession.id), bindValue(newSession.userId), bindValue(newSession.planId), bindValue(newSession.dayId),
     bindValue(newSession.name), bindValue(newSession.startedAt), bindValue(newSession.completedAt), bindValue(newSession.durationSeconds),
     bindValue(newSession.totalVolume), bindValue(newSession.notes), bindValue(newSession.rating)]
  );
  return newSession;
}

export function updateWorkoutSession(id: string, updates: Partial<WorkoutSession>): WorkoutSession | null {
  const session = getWorkoutSessionById(id);
  if (!session) return null;
  
  const updated = { ...session, ...updates };
  db.runSync(
    `UPDATE workout_sessions SET plan_id=?, day_id=?, name=?, completed_at=?, duration_seconds=?, total_volume=?, notes=?, rating=? WHERE id=?`,
    [bindValue(updated.planId), bindValue(updated.dayId), bindValue(updated.name), bindValue(updated.completedAt), bindValue(updated.durationSeconds),
     bindValue(updated.totalVolume), bindValue(updated.notes), bindValue(updated.rating), bindValue(id)]
  );
  return updated;
}

export function getWorkoutSessionById(id: string): WorkoutSession | null {
  const row = db.getFirstSync<SessionRow>(`SELECT * FROM workout_sessions WHERE id = ?`, [id]);
  if (!row) return null;
  
  const session = mapSessionRow(row);
  session.exercises = getSessionExercises(id);
  return session;
}

export function getSessionExercises(sessionId: string): SessionExercise[] {
  const rows = db.getAllSync<SessionExerciseRow>(`SELECT * FROM session_exercises WHERE session_id = ? ORDER BY "order"`, [sessionId]);
  return rows.map(row => {
    const se = mapSessionExerciseRow(row);
    se.exercise = getExerciseById(row.exercise_id) || undefined;
    se.sets = getSessionSets(se.id);
    return se;
  });
}

export function getSessionSets(sessionExerciseId: string): SessionSet[] {
  const rows = db.getAllSync<SessionSetRow>(`SELECT * FROM session_sets WHERE session_exercise_id = ? ORDER BY set_number`, [sessionExerciseId]);
  return rows.map(mapSessionSetRow);
}

export function getUserWorkoutSessions(userId: string, limit = 50): WorkoutSession[] {
  const rows = db.getAllSync<SessionRow>(`SELECT * FROM workout_sessions WHERE user_id = ? ORDER BY started_at DESC LIMIT ?`, [userId, limit]);
  return rows.map(mapSessionRow);
}

// ========== CARDIO SESSION OPERATIONS ==========
export function createCardioSession(session: Omit<CardioSession, 'id'>): CardioSession {
  const id = generateId();
  const newSession: CardioSession = { ...session, id };
  
  db.runSync(
    `INSERT INTO cardio_sessions (id, user_id, type, started_at, completed_at, duration_seconds, distance_meters, calories_burned, avg_heart_rate, max_heart_rate, avg_pace, route, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [bindValue(newSession.id), bindValue(newSession.userId), bindValue(newSession.type), bindValue(newSession.startedAt),
     bindValue(newSession.completedAt), bindValue(newSession.durationSeconds), bindValue(newSession.distanceMeters),
     bindValue(newSession.caloriesBurned), bindValue(newSession.avgHeartRate), bindValue(newSession.maxHeartRate),
     bindValue(newSession.avgPace), bindValue(json(newSession.route || [])), bindValue(newSession.notes)]
  );
  return newSession;
}

export function getUserCardioSessions(userId: string, limit = 50): CardioSession[] {
  const rows = db.getAllSync<CardioRow>(`SELECT * FROM cardio_sessions WHERE user_id = ? ORDER BY started_at DESC LIMIT ?`, [userId, limit]);
  return rows.map(mapCardioRow);
}

// ========== PROGRESS OPERATIONS ==========
export function createProgressEntry(entry: Omit<ProgressEntry, 'id'>): ProgressEntry {
  const id = generateId();
  const newEntry: ProgressEntry = { ...entry, id };
  
  db.runSync(
    `INSERT INTO progress_entries (id, user_id, date, weight, body_fat_percentage, muscle_mass, measurements, photos, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [bindValue(newEntry.id), bindValue(newEntry.userId), bindValue(newEntry.date), bindValue(newEntry.weight), bindValue(newEntry.bodyFatPercentage),
     bindValue(newEntry.muscleMass), bindValue(json(newEntry.measurements)), bindValue(json(newEntry.photos)), bindValue(newEntry.notes)]
  );
  return newEntry;
}

export function getUserProgressEntries(userId: string): ProgressEntry[] {
  const rows = db.getAllSync<ProgressRow>(`SELECT * FROM progress_entries WHERE user_id = ? ORDER BY date DESC`, [userId]);
  return rows.map(mapProgressRow);
}

// ========== NUTRITION OPERATIONS ==========
export function createNutritionEntry(entry: Omit<NutritionEntry, 'id'>): NutritionEntry {
  const id = generateId();
  const newEntry: NutritionEntry = { ...entry, id };
  
  db.runSync(
    `INSERT INTO nutrition_entries (id, user_id, date, total_calories, total_protein, total_carbs, total_fat, total_fiber, water_ml)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [bindValue(newEntry.id), bindValue(newEntry.userId), bindValue(newEntry.date), bindValue(newEntry.totalCalories), bindValue(newEntry.totalProtein),
     bindValue(newEntry.totalCarbs), bindValue(newEntry.totalFat), bindValue(newEntry.totalFiber), bindValue(newEntry.waterMl)]
  );
  return newEntry;
}

export function getUserNutritionEntries(userId: string, startDate?: string, endDate?: string): NutritionEntry[] {
  let query = `SELECT * FROM nutrition_entries WHERE user_id = ?`;
  const params: (string | number)[] = [userId];
  
  if (startDate) {
    query += ` AND date >= ?`;
    params.push(startDate);
  }
  if (endDate) {
    query += ` AND date <= ?`;
    params.push(endDate);
  }
  query += ` ORDER BY date DESC`;
  
  const rows = db.getAllSync<NutritionRow>(query, params);
  return rows.map(mapNutritionRow);
}

// ========== ACHIEVEMENTS ==========
export function createAchievement(achievement: Omit<Achievement, 'id'>): Achievement {
  const id = generateId();
  const newAchievement: Achievement = { ...achievement, id };
  
  db.runSync(
    `INSERT INTO achievements (id, user_id, type, title, description, icon, earned_at, metadata)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [bindValue(newAchievement.id), bindValue(newAchievement.userId), bindValue(newAchievement.type), bindValue(newAchievement.title),
     bindValue(newAchievement.description), bindValue(newAchievement.icon), bindValue(newAchievement.earnedAt), bindValue(json(newAchievement.metadata))]
  );
  return newAchievement;
}

export function getUserAchievements(userId: string): Achievement[] {
  const rows = db.getAllSync<AchievementRow>(`SELECT * FROM achievements WHERE user_id = ? ORDER BY earned_at DESC`, [userId]);
  return rows.map(mapAchievementRow);
}

// ========== SETTINGS ==========
export function getSettings(userId: string): Settings | null {
  const row = db.getFirstSync<SettingsRow>(`SELECT * FROM settings WHERE user_id = ?`, [userId]);
  return row ? mapSettingsRow(row) : null;
}

export function upsertSettings(settings: Settings): Settings {
  const existing = getSettings(settings.userId);
  if (existing) {
    db.runSync(
      `UPDATE settings SET units=?, weight_unit=?, height_unit=?, distance_unit=?, energy_unit=?, theme=?, accent_color=?, font_size=?, notifications=?, privacy=?, auto_backup=?, language=?, auto_start_rest_timer=?, haptic_feedback=?, sound_enabled=?, keep_screen_awake=? WHERE user_id=?`,
      [bindValue(settings.units), bindValue(settings.weightUnit), bindValue(settings.heightUnit), bindValue(settings.distanceUnit), bindValue(settings.energyUnit), bindValue(settings.theme), bindValue(settings.accentColor), bindValue(settings.fontSize), bindValue(json(settings.notifications)), bindValue(json(settings.privacy)),
       bindValue(settings.autoBackup ? 1 : 0), bindValue(settings.language), bindValue(settings.autoStartRestTimer ? 1 : 0), bindValue(settings.hapticFeedback ? 1 : 0), bindValue(settings.soundEnabled ? 1 : 0), bindValue(settings.keepScreenAwake ? 1 : 0), bindValue(settings.userId)]
    );
  } else {
    db.runSync(
      `INSERT INTO settings (user_id, units, weight_unit, height_unit, distance_unit, energy_unit, theme, accent_color, font_size, notifications, privacy, auto_backup, language, auto_start_rest_timer, haptic_feedback, sound_enabled, keep_screen_awake)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [bindValue(settings.userId), bindValue(settings.units), bindValue(settings.weightUnit), bindValue(settings.heightUnit), bindValue(settings.distanceUnit), bindValue(settings.energyUnit), bindValue(settings.theme), bindValue(settings.accentColor), bindValue(settings.fontSize), bindValue(json(settings.notifications)),
       bindValue(json(settings.privacy)), bindValue(settings.autoBackup ? 1 : 0), bindValue(settings.language), bindValue(settings.autoStartRestTimer ? 1 : 0), bindValue(settings.hapticFeedback ? 1 : 0), bindValue(settings.soundEnabled ? 1 : 0), bindValue(settings.keepScreenAwake ? 1 : 0)]
    );
  }
  return settings;
}

// ========== HELPER MAPPERS ==========
interface UserRow {
  id: string; email: string; name: string; role: string; avatar: string | null;
  height: number | null; weight: number | null; age: number | null; gender: string | null;
  activity_level: string | null; goal: string | null; target_weight: number | null;
  created_at: string; updated_at: string;
}

function mapUserRow(row: UserRow): User {
  return {
    id: row.id, email: row.email, name: row.name, role: row.role as User['role'],
    avatar: row.avatar || undefined, height: row.height || undefined, weight: row.weight || undefined,
    age: row.age || undefined, gender: row.gender as User['gender'] || undefined,
    activityLevel: row.activity_level as User['activityLevel'] || undefined,
    goal: row.goal as User['goal'] || undefined, targetWeight: row.target_weight || undefined,
    createdAt: row.created_at, updatedAt: row.updated_at
  };
}

interface ExerciseRow {
  id: string; name: string; muscle_group: string; secondary_muscles: string;
  equipment: string; difficulty: string; instructions: string; tips: string | null;
  video_url: string | null; image_url: string | null; is_custom: number;
  created_by: string | null; created_at: string;
}

function mapExerciseRow(row: ExerciseRow): Exercise {
  return {
    id: row.id, name: row.name, muscleGroup: row.muscle_group as MuscleGroup,
    secondaryMuscles: parseJson<MuscleGroup[]>(row.secondary_muscles),
    equipment: parseJson<EquipmentType[]>(row.equipment),
    difficulty: row.difficulty as DifficultyLevel,
    instructions: parseJson<string[]>(row.instructions),
    tips: parseJson<string[]>(row.tips),
    videoUrl: row.video_url || undefined, imageUrl: row.image_url || undefined,
    isCustom: row.is_custom === 1, createdBy: row.created_by || undefined,
    createdAt: row.created_at
  };
}

interface PlanRow {
  id: string; name: string; description: string | null; goal: string; difficulty: string;
  duration_weeks: number; days_per_week: number; created_by: string;
  is_public: number; is_custom: number; tags: string | null;
  created_at: string; updated_at: string;
}

function mapPlanRow(row: PlanRow): WorkoutPlan {
  return {
    id: row.id, name: row.name, description: row.description || '', goal: row.goal as GoalType,
    difficulty: row.difficulty as DifficultyLevel, durationWeeks: row.duration_weeks,
    daysPerWeek: row.days_per_week, createdBy: row.created_by,
    isPublic: row.is_public === 1, isCustom: row.is_custom === 1,
    tags: parseJson<string[]>(row.tags), workoutDays: [],
    createdAt: row.created_at, updatedAt: row.updated_at
  };
}

interface DayRow {
  id: string; plan_id: string; day_index: number; name: string; focus: string; notes: string | null;
}

function mapDayRow(row: DayRow): WorkoutDay {
  return {
    id: row.id, planId: row.plan_id, dayIndex: row.day_index, name: row.name,
    focus: parseJson<MuscleGroup[]>(row.focus), exercises: [], notes: row.notes || undefined
  };
}

interface WorkoutExerciseRow {
  id: string; day_id: string; exercise_id: string; "order": number;
  sets: number; reps: string; rest_seconds: number; rpe: number | null;
  percentage_1rm: number | null; notes: string | null;
}

function mapWorkoutExerciseRow(row: WorkoutExerciseRow): WorkoutExercise {
  return {
    id: row.id, dayId: row.day_id, exerciseId: row.exercise_id, order: row.order,
    sets: row.sets, reps: row.reps, restSeconds: row.rest_seconds,
    rpe: row.rpe || undefined, percentage1RM: row.percentage_1rm || undefined,
    notes: row.notes || undefined
  };
}

interface SessionRow {
  id: string; user_id: string; plan_id: string | null; day_id: string | null;
  name: string; started_at: string; completed_at: string | null;
  duration_seconds: number | null; total_volume: number | null;
  notes: string | null; rating: number | null;
}

function mapSessionRow(row: SessionRow): WorkoutSession {
  return {
    id: row.id, userId: row.user_id, planId: row.plan_id || undefined,
    dayId: row.day_id || undefined, name: row.name, startedAt: row.started_at,
    completedAt: row.completed_at || undefined, durationSeconds: row.duration_seconds || undefined,
    totalVolume: row.total_volume || undefined, notes: row.notes || undefined,
    rating: row.rating as WorkoutSession['rating'] || undefined, exercises: []
  };
}

interface SessionExerciseRow {
  id: string; session_id: string; exercise_id: string; "order": number;
}

function mapSessionExerciseRow(row: SessionExerciseRow): SessionExercise {
  return { id: row.id, sessionId: row.session_id, exerciseId: row.exercise_id, order: row.order, sets: [] };
}

interface SessionSetRow {
  id: string; session_exercise_id: string; set_number: number;
  weight: number | null; reps: number | null; distance: number | null;
  duration_seconds: number | null; rpe: number | null; completed: number; is_warmup: number;
}

function mapSessionSetRow(row: SessionSetRow): SessionSet {
  return {
    id: row.id, sessionExerciseId: row.session_exercise_id, setNumber: row.set_number,
    weight: row.weight || undefined, reps: row.reps || undefined,
    distance: row.distance || undefined, durationSeconds: row.duration_seconds || undefined,
    rpe: row.rpe || undefined, completed: row.completed === 1, isWarmup: row.is_warmup === 1
  };
}

interface CardioRow {
  id: string; user_id: string; type: string; started_at: string; completed_at: string | null;
  duration_seconds: number; distance_meters: number; calories_burned: number;
  avg_heart_rate: number | null; max_heart_rate: number | null; avg_pace: number | null;
  route: string | null; notes: string | null;
}

function mapCardioRow(row: CardioRow): CardioSession {
  return {
    id: row.id, userId: row.user_id, type: row.type as CardioType,
    startedAt: row.started_at, completedAt: row.completed_at || undefined,
    durationSeconds: row.duration_seconds, distanceMeters: row.distance_meters,
    caloriesBurned: row.calories_burned, avgHeartRate: row.avg_heart_rate || undefined,
    maxHeartRate: row.max_heart_rate || undefined, avgPace: row.avg_pace || undefined,
    route: parseJson<GeoPoint[]>(row.route), notes: row.notes || undefined
  };
}

interface ProgressRow {
  id: string; user_id: string; date: string; weight: number | null;
  body_fat_percentage: number | null; muscle_mass: number | null;
  measurements: string; photos: string; notes: string | null;
}

function mapProgressRow(row: ProgressRow): ProgressEntry {
  return {
    id: row.id, userId: row.user_id, date: row.date,
    weight: row.weight || undefined, bodyFatPercentage: row.body_fat_percentage || undefined,
    muscleMass: row.muscle_mass || undefined,
    measurements: parseJson<BodyMeasurements>(row.measurements),
    photos: parseJson<ProgressPhoto[]>(row.photos),
    notes: row.notes || undefined
  };
}

interface NutritionRow {
  id: string; user_id: string; date: string; total_calories: number;
  total_protein: number; total_carbs: number; total_fat: number;
  total_fiber: number; water_ml: number;
}

function mapNutritionRow(row: NutritionRow): NutritionEntry {
  return {
    id: row.id, userId: row.user_id, date: row.date,
    totalCalories: row.total_calories, totalProtein: row.total_protein,
    totalCarbs: row.total_carbs, totalFat: row.total_fat,
    totalFiber: row.total_fiber, waterMl: row.water_ml, meals: []
  };
}

interface AchievementRow {
  id: string; user_id: string; type: string; title: string; description: string;
  icon: string; earned_at: string; metadata: string | null;
}

function mapAchievementRow(row: AchievementRow): Achievement {
  return {
    id: row.id, userId: row.user_id, type: row.type as AchievementType,
    title: row.title, description: row.description, icon: row.icon,
    earnedAt: row.earned_at, metadata: parseJson<Record<string, unknown>>(row.metadata)
  };
}

interface SettingsRow {
  user_id: string; units: string; weight_unit: string; height_unit: string;
  distance_unit: string; energy_unit: string; theme: string; accent_color: string;
  font_size: string; notifications: string; privacy: string; auto_backup: number; language: string;
  auto_start_rest_timer: number; haptic_feedback: number;
  sound_enabled: number; keep_screen_awake: number;
}

function mapSettingsRow(row: SettingsRow): Settings {
  return {
    userId: row.user_id, 
    units: row.units as 'metric' | 'imperial',
    weightUnit: row.weight_unit as 'kg' | 'lbs',
    heightUnit: row.height_unit as 'cm' | 'ft',
    distanceUnit: row.distance_unit as 'km' | 'mi',
    energyUnit: row.energy_unit as 'kcal' | 'kJ',
    theme: row.theme as 'light' | 'dark' | 'system',
    accentColor: row.accent_color,
    fontSize: row.font_size as 'small' | 'medium' | 'large',
    notifications: parseJson<NotificationSettings>(row.notifications),
    privacy: parseJson<PrivacySettings>(row.privacy),
    autoBackup: row.auto_backup === 1, 
    language: row.language,
    autoStartRestTimer: row.auto_start_rest_timer === 1,
    hapticFeedback: row.haptic_feedback === 1,
    soundEnabled: row.sound_enabled === 1,
    keepScreenAwake: row.keep_screen_awake === 1,
  };
}

// Seed default exercises
export function seedDefaultExercises() {
  const count = db.getFirstSync<{count: number}>(`SELECT COUNT(*) as count FROM exercises`);
  if (count && count.count > 0) return;

  const defaultExercises: Omit<Exercise, 'id' | 'createdAt'>[] = [
    // Chest
    { name: 'Bench Press', muscleGroup: 'chest', secondaryMuscles: ['triceps', 'shoulders'], equipment: ['barbell', 'bench'], difficulty: 'intermediate', instructions: ['Lie on bench, grip bar slightly wider than shoulders', 'Lower bar to chest with control', 'Press up explosively'], tips: ['Keep shoulders retracted', 'Don\'t bounce the bar'], isCustom: false },
    { name: 'Incline Dumbbell Press', muscleGroup: 'chest', secondaryMuscles: ['shoulders', 'triceps'], equipment: ['dumbbell', 'incline_bench'], difficulty: 'intermediate', instructions: ['Set bench to 30-45 degrees', 'Press dumbbells up and slightly together'], tips: ['Don\'t go too heavy on incline'], isCustom: false },
    { name: 'Push-Ups', muscleGroup: 'chest', secondaryMuscles: ['triceps', 'shoulders'], equipment: ['bodyweight'], difficulty: 'beginner', instructions: ['Hands slightly wider than shoulders', 'Lower chest to floor', 'Push back up'], tips: ['Keep core tight', 'Full range of motion'], isCustom: false },
    { name: 'Chest Flyes', muscleGroup: 'chest', secondaryMuscles: ['shoulders'], equipment: ['dumbbell', 'cable', 'machine'], difficulty: 'beginner', instructions: ['Arms slightly bent, open wide', 'Squeeze chest to bring together'], tips: ['Don\'t go too deep'], isCustom: false },
    { name: 'Dips', muscleGroup: 'chest', secondaryMuscles: ['triceps', 'shoulders'], equipment: ['dip_bars', 'bodyweight'], difficulty: 'intermediate', instructions: ['Support body on bars', 'Lower until shoulders below elbows', 'Push up'], tips: ['Lean forward for chest focus'], isCustom: false },

    // Back
    { name: 'Pull-Ups', muscleGroup: 'back', secondaryMuscles: ['biceps', 'forearms'], equipment: ['pullup_bar', 'bodyweight'], difficulty: 'intermediate', instructions: ['Hang from bar, palms away', 'Pull chin over bar', 'Lower with control'], tips: ['Engage lats, not just arms'], isCustom: false },
    { name: 'Bent Over Rows', muscleGroup: 'back', secondaryMuscles: ['biceps', 'forearms'], equipment: ['barbell', 'dumbbell'], difficulty: 'intermediate', instructions: ['Hinge at hips, back flat', 'Pull weight to lower ribs', 'Squeeze shoulder blades'], tips: ['Don\'t use momentum'], isCustom: false },
    { name: 'Lat Pulldowns', muscleGroup: 'lats', secondaryMuscles: ['biceps', 'forearms'], equipment: ['machine', 'cable'], difficulty: 'beginner', instructions: ['Sit, grip bar wide', 'Pull to upper chest', 'Control the return'], tips: ['Lean back slightly'], isCustom: false },
    { name: 'Deadlifts', muscleGroup: 'lower_back', secondaryMuscles: ['glutes', 'hamstrings', 'traps', 'forearms'], equipment: ['barbell'], difficulty: 'advanced', instructions: ['Feet hip-width, grip outside legs', 'Drive through heels, stand tall', 'Hinge back down'], tips: ['Keep bar close to body', 'Neutral spine'], isCustom: false },
    { name: 'Face Pulls', muscleGroup: 'back', secondaryMuscles: ['shoulders', 'traps'], equipment: ['cable', 'band'], difficulty: 'beginner', instructions: ['Rope at face height', 'Pull toward face, separate hands', 'Squeeze rear delts'], tips: ['High elbows, external rotation'], isCustom: false },

    // Shoulders
    { name: 'Overhead Press', muscleGroup: 'shoulders', secondaryMuscles: ['triceps', 'traps'], equipment: ['barbell', 'dumbbell'], difficulty: 'intermediate', instructions: ['Press from shoulders overhead', 'Lock out at top', 'Control down'], tips: ['Don\'t arch lower back'], isCustom: false },
    { name: 'Lateral Raises', muscleGroup: 'shoulders', secondaryMuscles: [], equipment: ['dumbbell', 'cable', 'band'], difficulty: 'beginner', instructions: ['Raise arms to shoulder height', 'Slight bend in elbows', 'Control down'], tips: ['Pinkies up at top'], isCustom: false },
    { name: 'Rear Delt Flyes', muscleGroup: 'shoulders', secondaryMuscles: ['back'], equipment: ['dumbbell', 'cable', 'machine'], difficulty: 'beginner', instructions: ['Bent over, arms hang down', 'Raise out to sides', 'Squeeze rear delts'], tips: ['Focus on rear delt, not traps'], isCustom: false },
    { name: 'Arnold Press', muscleGroup: 'shoulders', secondaryMuscles: ['triceps'], equipment: ['dumbbell'], difficulty: 'intermediate', instructions: ['Start palms facing you', 'Rotate as you press up', 'Reverse on way down'], tips: ['Smooth rotation'], isCustom: false },

    // Arms
    { name: 'Bicep Curls', muscleGroup: 'biceps', secondaryMuscles: ['forearms'], equipment: ['dumbbell', 'barbell', 'ez_bar', 'cable'], difficulty: 'beginner', instructions: ['Curl weight up', 'Squeeze at top', 'Control down'], tips: ['Keep elbows pinned'], isCustom: false },
    { name: 'Hammer Curls', muscleGroup: 'biceps', secondaryMuscles: ['forearms'], equipment: ['dumbbell'], difficulty: 'beginner', instructions: ['Neutral grip, curl up', 'Squeeze at top'], tips: ['Great for forearm thickness'], isCustom: false },
    { name: 'Tricep Pushdowns', muscleGroup: 'triceps', secondaryMuscles: [], equipment: ['cable', 'band'], difficulty: 'beginner', instructions: ['Elbows pinned, push down', 'Full extension', 'Control up'], tips: ['Rope for better contraction'], isCustom: false },
    { name: 'Skull Crushers', muscleGroup: 'triceps', secondaryMuscles: [], equipment: ['ez_bar', 'dumbbell', 'barbell'], difficulty: 'intermediate', instructions: ['Lower behind head', 'Extend arms up'], tips: ['Keep elbows in'], isCustom: false },

    // Legs
    { name: 'Squats', muscleGroup: 'quadriceps', secondaryMuscles: ['glutes', 'hamstrings', 'lower_back'], equipment: ['barbell', 'smith_machine'], difficulty: 'intermediate', instructions: ['Bar on upper back', 'Squat to parallel or below', 'Drive up'], tips: ['Knees track toes'], isCustom: false },
    { name: 'Leg Press', muscleGroup: 'quadriceps', secondaryMuscles: ['glutes', 'hamstrings'], equipment: ['machine'], difficulty: 'beginner', instructions: ['Feet shoulder-width', 'Lower sled', 'Press up'], tips: ['Don\'t lock knees'], isCustom: false },
    { name: 'Romanian Deadlifts', muscleGroup: 'hamstrings', secondaryMuscles: ['glutes', 'lower_back'], equipment: ['barbell', 'dumbbell'], difficulty: 'intermediate', instructions: ['Hinge at hips, slight knee bend', 'Feel stretch in hamstrings', 'Squeeze glutes up'], tips: ['Keep bar close'], isCustom: false },
    { name: 'Lunges', muscleGroup: 'quadriceps', secondaryMuscles: ['glutes', 'hamstrings'], equipment: ['dumbbell', 'barbell', 'bodyweight'], difficulty: 'beginner', instructions: ['Step forward, drop back knee', 'Drive through front heel'], tips: ['Front knee over ankle'], isCustom: false },
    { name: 'Calf Raises', muscleGroup: 'calves', secondaryMuscles: [], equipment: ['machine', 'dumbbell', 'bodyweight'], difficulty: 'beginner', instructions: ['Raise on toes', 'Squeeze at top', 'Deep stretch at bottom'], tips: ['Straight and bent knee versions'], isCustom: false },
    { name: 'Hip Thrusts', muscleGroup: 'glutes', secondaryMuscles: ['hamstrings'], equipment: ['barbell', 'bench', 'machine'], difficulty: 'intermediate', instructions: ['Upper back on bench', 'Drive hips up', 'Squeeze glutes'], tips: ['Chin tucked, full extension'], isCustom: false },

    // Core
    { name: 'Plank', muscleGroup: 'abs', secondaryMuscles: [], equipment: ['bodyweight'], difficulty: 'beginner', instructions: ['Forearms on ground', 'Straight line head to heels', 'Hold'], tips: ['Don\'t sag hips'], isCustom: false },
    { name: 'Hanging Leg Raises', muscleGroup: 'abs', secondaryMuscles: ['forearms'], equipment: ['pullup_bar'], difficulty: 'advanced', instructions: ['Hang from bar', 'Raise legs to parallel', 'Control down'], tips: ['Avoid swinging'], isCustom: false },
    { name: 'Russian Twists', muscleGroup: 'obliques', secondaryMuscles: ['abs'], equipment: ['bodyweight', 'plate', 'dumbbell'], difficulty: 'beginner', instructions: ['Sit, lean back, rotate side to side'], tips: ['Tap weight each side'], isCustom: false },

    // Cardio
    { name: 'Running', muscleGroup: 'cardio', secondaryMuscles: [], equipment: ['cardio_machine', 'bodyweight'], difficulty: 'beginner', instructions: ['Run at comfortable pace'], tips: ['Build up gradually'], isCustom: false },
    { name: 'Cycling', muscleGroup: 'cardio', secondaryMuscles: [], equipment: ['cardio_machine'], difficulty: 'beginner', instructions: ['Pedal at steady pace'], tips: ['Adjust resistance'], isCustom: false },
    { name: 'Rowing', muscleGroup: 'cardio', secondaryMuscles: ['back', 'quadriceps'], equipment: ['cardio_machine'], difficulty: 'beginner', instructions: ['Legs, body, arms - arms, body, legs'], tips: ['Power from legs'], isCustom: false },
  ];

  for (const ex of defaultExercises) {
    createExercise(ex);
  }
}

// Initialize and seed
initDatabase();
seedDefaultExercises();