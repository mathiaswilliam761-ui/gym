import { openDatabaseSync } from 'expo-sqlite';

const db = openDatabaseSync('gymapp.db');

export const CURRENT_SCHEMA_VERSION = 2;

export interface Migration {
  version: number;
  description: string;
  up: () => void;
}

export const migrations: Migration[] = [
  {
    version: 1,
    description: 'Initial schema with all tables',
    up: () => {
      // This is the initial schema - tables are created in initDatabase()
      // The initDatabase function already handles CREATE TABLE IF NOT EXISTS
    },
  },
  {
    version: 2,
    description: 'Add version and synced_at columns for sync conflict resolution',
    up: () => {
      const tables = [
        'users',
        'exercises',
        'workout_plans',
        'workout_days',
        'workout_exercises',
        'workout_sessions',
        'session_exercises',
        'session_sets',
        'cardio_sessions',
        'progress_entries',
        'nutrition_entries',
        'meals',
        'food_items',
        'achievements',
        'settings',
        'workout_templates',
        'template_exercises',
      ];

      for (const table of tables) {
        try {
          db.execSync(`ALTER TABLE ${table} ADD COLUMN version INTEGER DEFAULT 1`);
        } catch (e) {
          // Column might already exist
        }
        try {
          db.execSync(`ALTER TABLE ${table} ADD COLUMN synced_at TEXT`);
        } catch (e) {
          // Column might already exist
        }
      }
    },
  },
];

export function getCurrentSchemaVersion(): number {
  try {
    const result = db.getFirstSync<{ user_version: number }>('PRAGMA user_version');
    return result?.user_version || 0;
  } catch {
    return 0;
  }
}

export function setSchemaVersion(version: number): void {
  db.execSync(`PRAGMA user_version = ${version}`);
}

export function runMigrations(): void {
  const currentVersion = getCurrentSchemaVersion();
  
  if (currentVersion === CURRENT_SCHEMA_VERSION) {
    console.log(`Database schema is up to date (version ${CURRENT_SCHEMA_VERSION})`);
    return;
  }

  if (currentVersion === 0) {
    console.log('Fresh database - running initial schema');
    // The initDatabase() will be called separately to create tables
    setSchemaVersion(CURRENT_SCHEMA_VERSION);
    return;
  }

  console.log(`Migrating database from version ${currentVersion} to ${CURRENT_SCHEMA_VERSION}`);
  
  for (const migration of migrations) {
    if (migration.version > currentVersion && migration.version <= CURRENT_SCHEMA_VERSION) {
      console.log(`Running migration ${migration.version}: ${migration.description}`);
      try {
        migration.up();
        setSchemaVersion(migration.version);
        console.log(`Migration ${migration.version} completed`);
      } catch (error) {
        console.error(`Migration ${migration.version} failed:`, error);
        throw error;
      }
    }
  }
  
  console.log('All migrations completed successfully');
}