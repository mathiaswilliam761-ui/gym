import { create } from 'zustand';
import { v7 as uuidv7 } from 'uuid';
import { 
  WorkoutPlan, WorkoutDay, WorkoutExercise, Exercise, MuscleGroup, GoalType, DifficultyLevel 
} from '../types';
import { getAllExercises, getExercisesByMuscleGroup, searchExercises } from '../db';

export interface DraftExercise {
  id: string;
  exerciseId: string;
  order: number;
  sets: number;
  reps: string;
  restSeconds: number;
  rpe?: number;
  percentage1RM?: number;
  notes?: string;
  exercise?: Exercise;
}

export interface DraftDay {
  id: string;
  dayIndex: number;
  name: string;
  focus: MuscleGroup[];
  exercises: DraftExercise[];
}

export interface DraftPlan {
  name: string;
  description: string;
  goal: GoalType;
  difficulty: DifficultyLevel;
  durationWeeks: number;
  daysPerWeek: number;
  tags: string[];
  days: DraftDay[];
}

export interface ValidationError {
  type: 'error' | 'warn';
  message: string;
  field?: string;
}

interface PlanBuilderState {
  draft: DraftPlan | null;
  isDirty: boolean;
  
  // Plan initialization
  startNewPlan: (template?: DraftPlan) => void;
  loadPlanForEditing: (plan: WorkoutPlan) => void;
  discardDraft: () => void;
  
  // Plan-level updates
  updatePlanMeta: (updates: Partial<Omit<DraftPlan, 'days'>>) => void;
  
  // Day management
  addDay: (name?: string, focus?: MuscleGroup[]) => void;
  removeDay: (dayId: string) => void;
  reorderDays: (fromIndex: number, toIndex: number) => void;
  updateDay: (dayId: string, updates: Partial<DraftDay>) => void;
  
  // Exercise management within a day
  addExerciseToDay: (dayId: string, exerciseId: string) => void;
  removeExerciseFromDay: (dayId: string, exerciseId: string) => void;
  reorderExercises: (dayId: string, fromIndex: number, toIndex: number) => void;
  updateExerciseInDay: (dayId: string, exerciseId: string, updates: Partial<DraftExercise>) => void;
  
  // Exercise library access
  getExercisesByMuscleGroup: (muscleGroup: MuscleGroup) => Exercise[];
  searchExercises: (query: string) => Exercise[];
  getAllExercises: () => Exercise[];
  
  // Validation
  validateDraft: () => ValidationError[];
  getValidationWarnings: () => ValidationError[];
  
  // Persistence
  savePlan: (userId: string) => Promise<string>; // returns planId
  exportDraft: () => string; // JSON string
  importDraft: (json: string) => boolean;
}

const createEmptyDraft = (): DraftPlan => ({
  name: '',
  description: '',
  goal: 'gain_muscle',
  difficulty: 'intermediate',
  durationWeeks: 8,
  daysPerWeek: 4,
  tags: [],
  days: [],
});

const createDefaultDay = (dayIndex: number): DraftDay => ({
  id: uuidv7(),
  dayIndex,
  name: `Day ${dayIndex + 1}`,
  focus: [],
  exercises: [],
});

const createDraftExercise = (exerciseId: string, order: number): DraftExercise => ({
  id: uuidv7(),
  exerciseId,
  order,
  sets: 3,
  reps: '8-12',
  restSeconds: 90,
});

export const usePlanBuilderStore = create<PlanBuilderState>((set, get) => ({
  draft: null,
  isDirty: false,

  startNewPlan: (template) => {
    const baseDraft = template || createEmptyDraft();
    // Auto-create days based on daysPerWeek
    const days = Array.from({ length: baseDraft.daysPerWeek }, (_, i) => 
      createDefaultDay(i)
    );
    set({ 
      draft: { ...baseDraft, days }, 
      isDirty: false 
    });
  },

  loadPlanForEditing: (plan) => {
    const draft: DraftPlan = {
      name: plan.name,
      description: plan.description,
      goal: plan.goal,
      difficulty: plan.difficulty,
      durationWeeks: plan.durationWeeks,
      daysPerWeek: plan.daysPerWeek,
      tags: plan.tags,
      days: plan.workoutDays.map(day => ({
        id: day.id,
        dayIndex: day.dayIndex,
        name: day.name,
        focus: day.focus,
        exercises: day.exercises.map((we, idx) => ({
          id: we.id,
          exerciseId: we.exerciseId,
          order: we.order,
          sets: we.sets,
          reps: we.reps,
          restSeconds: we.restSeconds,
          rpe: we.rpe,
          percentage1RM: we.percentage1RM,
          notes: we.notes,
          exercise: we.exercise,
        })),
      })),
    };
    set({ draft, isDirty: false });
  },

  discardDraft: () => {
    set({ draft: null, isDirty: false });
  },

  updatePlanMeta: (updates) => {
    set(state => {
      if (!state.draft) return state;
      return {
        draft: { ...state.draft, ...updates },
        isDirty: true,
      };
    });
  },

  addDay: (name, focus) => {
    set(state => {
      if (!state.draft) return state;
      const newDayIndex = state.draft.days.length;
      const newDay = createDefaultDay(newDayIndex);
      if (name) newDay.name = name;
      if (focus) newDay.focus = focus;
      return {
        draft: { ...state.draft, days: [...state.draft.days, newDay] },
        isDirty: true,
      };
    });
  },

  removeDay: (dayId) => {
    set(state => {
      if (!state.draft) return state;
      const filteredDays = state.draft.days
        .filter(d => d.id !== dayId)
        .map((d, idx) => ({ ...d, dayIndex: idx }));
      return {
        draft: { ...state.draft, days: filteredDays },
        isDirty: true,
      };
    });
  },

  reorderDays: (fromIndex, toIndex) => {
    set(state => {
      if (!state.draft) return state;
      const days = [...state.draft.days];
      const [removed] = days.splice(fromIndex, 1);
      days.splice(toIndex, 0, removed);
      // Update dayIndex after reorder
      days.forEach((d, idx) => { d.dayIndex = idx; });
      return {
        draft: { ...state.draft, days },
        isDirty: true,
      };
    });
  },

  updateDay: (dayId, updates) => {
    set(state => {
      if (!state.draft) return state;
      return {
        draft: {
          ...state.draft,
          days: state.draft.days.map(d => 
            d.id === dayId ? { ...d, ...updates } : d
          ),
        },
        isDirty: true,
      };
    });
  },

  addExerciseToDay: (dayId, exerciseId) => {
    set(state => {
      if (!state.draft) return state;
      return {
        draft: {
          ...state.draft,
          days: state.draft.days.map(day => {
            if (day.id !== dayId) return day;
            const order = day.exercises.length;
            const newExercise = createDraftExercise(exerciseId, order);
            return {
              ...day,
              exercises: [...day.exercises, newExercise],
            };
          }),
        },
        isDirty: true,
      };
    });
  },

  removeExerciseFromDay: (dayId, exerciseId) => {
    set(state => {
      if (!state.draft) return state;
      return {
        draft: {
          ...state.draft,
          days: state.draft.days.map(day => {
            if (day.id !== dayId) return day;
            const filtered = day.exercises
              .filter(e => e.id !== exerciseId)
              .map((e, idx) => ({ ...e, order: idx }));
            return { ...day, exercises: filtered };
          }),
        },
        isDirty: true,
      };
    });
  },

  reorderExercises: (dayId, fromIndex, toIndex) => {
    set(state => {
      if (!state.draft) return state;
      return {
        draft: {
          ...state.draft,
          days: state.draft.days.map(day => {
            if (day.id !== dayId) return day;
            const exercises = [...day.exercises];
            const [removed] = exercises.splice(fromIndex, 1);
            exercises.splice(toIndex, 0, removed);
            exercises.forEach((e, idx) => { e.order = idx; });
            return { ...day, exercises };
          }),
        },
        isDirty: true,
      };
    });
  },

  updateExerciseInDay: (dayId, exerciseId, updates) => {
    set(state => {
      if (!state.draft) return state;
      return {
        draft: {
          ...state.draft,
          days: state.draft.days.map(day => {
            if (day.id !== dayId) return day;
            return {
              ...day,
              exercises: day.exercises.map(e => 
                e.id === exerciseId ? { ...e, ...updates } : e
              ),
            };
          }),
        },
        isDirty: true,
      };
    });
  },

  getExercisesByMuscleGroup: (muscleGroup) => {
    return getExercisesByMuscleGroup(muscleGroup);
  },

  searchExercises: (query) => {
    return searchExercises(query);
  },

  getAllExercises: () => {
    return getAllExercises();
  },

  validateDraft: () => {
    const { draft } = get();
    if (!draft) return [{ type: 'error', message: 'No draft plan loaded' }];
    
    const errors: ValidationError[] = [];
    
    // Required fields
    if (!draft.name.trim()) {
      errors.push({ type: 'error', message: 'Plan name is required', field: 'name' });
    }
    if (draft.daysPerWeek < 1 || draft.daysPerWeek > 7) {
      errors.push({ type: 'error', message: 'Days per week must be 1-7', field: 'daysPerWeek' });
    }
    if (draft.durationWeeks < 1) {
      errors.push({ type: 'error', message: 'Duration must be at least 1 week', field: 'durationWeeks' });
    }
    if (draft.days.length === 0) {
      errors.push({ type: 'error', message: 'At least one workout day is required' });
    }
    
    // Validate each day
    draft.days.forEach((day, dayIdx) => {
      if (day.exercises.length === 0) {
        errors.push({ 
          type: 'warn', 
          message: `Day ${dayIdx + 1} (${day.name}) has no exercises` 
        });
      }
      
      // Check for duplicate exercises in same day
      const exerciseIds = day.exercises.map(e => e.exerciseId);
      const duplicates = exerciseIds.filter((id, idx) => exerciseIds.indexOf(id) !== idx);
      if (duplicates.length > 0) {
        errors.push({ 
          type: 'warn', 
          message: `Day ${dayIdx + 1} has duplicate exercises` 
        });
      }
    });
    
    return errors;
  },

  getValidationWarnings: () => {
    const { draft } = get();
    if (!draft) return [];
    
    const warnings: ValidationError[] = [];
    
    // Volume analysis per muscle group
    const volumeByMuscle: Record<MuscleGroup, number> = {
      chest: 0, back: 0, shoulders: 0, biceps: 0, triceps: 0, forearms: 0,
      abs: 0, obliques: 0, lower_back: 0, glutes: 0, quadriceps: 0,
      hamstrings: 0, calves: 0, traps: 0, lats: 0, cardio: 0,
    };
    
    // Calculate approximate volume per muscle group
    draft.days.forEach(day => {
      day.exercises.forEach(de => {
        const ex = get().getAllExercises().find(e => e.id === de.exerciseId);
        if (!ex) return;
        
        const volume = de.sets * parseReps(de.reps);
        const primaryMuscle = ex.muscleGroup;
        volumeByMuscle[primaryMuscle] = (volumeByMuscle[primaryMuscle] || 0) + volume;
        
        ex.secondaryMuscles?.forEach(sm => {
          volumeByMuscle[sm] = (volumeByMuscle[sm] || 0) + volume * 0.5;
        });
      });
    });
    
    // Chest-to-back ratio
    const chestVol = volumeByMuscle.chest || 0;
    const backVol = volumeByMuscle.back || 0;
    if (chestVol > 0 && backVol > 0 && chestVol / backVol > 1.5) {
      warnings.push({ 
        type: 'warn', 
        message: `Chest volume (${chestVol}) is ${(chestVol/backVol).toFixed(1)}x back volume (${backVol}) — consider more pulling` 
      });
    }
    
    // Push-to-pull ratio
    const pushVol = (volumeByMuscle.chest || 0) + (volumeByMuscle.shoulders || 0) + (volumeByMuscle.triceps || 0);
    const pullVol = (volumeByMuscle.back || 0) + (volumeByMuscle.biceps || 0) + (volumeByMuscle.lats || 0);
    if (pushVol > 0 && pullVol > 0 && pushVol / pullVol > 1.5) {
      warnings.push({ 
        type: 'warn', 
        message: `Push volume (${pushVol}) is ${(pushVol/pullVol).toFixed(1)}x pull volume (${pullVol}) — imbalance risk` 
      });
    }
    
    // Leg volume check
    const legVol = (volumeByMuscle.quadriceps || 0) + (volumeByMuscle.hamstrings || 0) + (volumeByMuscle.glutes || 0);
    const upperVol = pushVol + pullVol;
    if (legVol > 0 && upperVol > 0 && legVol / upperVol < 0.5) {
      warnings.push({ 
        type: 'warn', 
        message: `Leg volume (${legVol}) is less than half upper body (${upperVol}) — consider more leg work` 
      });
    }
    
    // Frequency check
    const muscleFrequency: Record<MuscleGroup, number> = {
      chest: 0, back: 0, shoulders: 0, biceps: 0, triceps: 0, forearms: 0,
      abs: 0, obliques: 0, lower_back: 0, glutes: 0, quadriceps: 0,
      hamstrings: 0, calves: 0, traps: 0, lats: 0, cardio: 0,
    };
    
    draft.days.forEach(day => {
      day.exercises.forEach(de => {
        const ex = get().getAllExercises().find(e => e.id === de.exerciseId);
        if (ex) {
          muscleFrequency[ex.muscleGroup]++;
          ex.secondaryMuscles?.forEach(sm => muscleFrequency[sm]++);
        }
      });
    });
    
    Object.entries(muscleFrequency).forEach(([muscle, count]) => {
      if (count > 3) {
        warnings.push({ 
          type: 'warn', 
          message: `${muscle} trained ${count}x/week — may need more recovery` 
        });
      }
    });
    
    // Total volume per session
    draft.days.forEach((day, dayIdx) => {
      let dayVolume = 0;
      day.exercises.forEach(de => {
        dayVolume += de.sets * parseReps(de.reps);
      });
      if (dayVolume > 100) {
        warnings.push({ 
          type: 'warn', 
          message: `Day ${dayIdx + 1} has very high volume (${dayVolume} reps) — consider splitting` 
        });
      }
    });
    
    return warnings;
  },

  savePlan: async (userId) => {
    const { draft } = get();
    if (!draft) throw new Error('No draft to save');
    
    const errors = get().validateDraft();
    const hasErrors = errors.some(e => e.type === 'error');
    if (hasErrors) {
      throw new Error(`Validation failed: ${errors.filter(e => e.type === 'error').map(e => e.message).join(', ')}`);
    }
    
    const { createPlanWithDetails } = await import('../db');
    
    // Convert draft to the format expected by createPlanWithDetails
    const planData = {
      name: draft.name,
      description: draft.description,
      goal: draft.goal,
      difficulty: draft.difficulty,
      durationWeeks: draft.durationWeeks,
      daysPerWeek: draft.daysPerWeek,
      createdBy: userId,
      isPublic: false,
      isCustom: true,
      tags: draft.tags,
      version: 1,
      syncedAt: undefined,
      workoutDays: [], // Required by type but created separately
    };
    
    const daysData = draft.days.map(day => ({
      dayIndex: day.dayIndex,
      name: day.name,
      focus: day.focus,
      notes: undefined,
      exercises: [], // Required by type but exercises are passed separately via daysExercises
      version: 1,
      syncedAt: undefined,
    }));
    
    const daysExercises = new Map<string, Omit<WorkoutExercise, 'id' | 'dayId'>[]>();
    draft.days.forEach(day => {
      const exercises = day.exercises.map((ex, idx) => ({
        exerciseId: ex.exerciseId,
        order: ex.order,
        sets: ex.sets,
        reps: ex.reps,
        restSeconds: ex.restSeconds,
        rpe: ex.rpe,
        percentage1RM: ex.percentage1RM,
        notes: ex.notes,
      }));
      daysExercises.set(day.id, exercises);
    });
    
    const savedPlan = createPlanWithDetails(planData, daysData, daysExercises);
    return savedPlan.id;
  },

  exportDraft: () => {
    const { draft } = get();
    if (!draft) return '{}';
    return JSON.stringify(draft, null, 2);
  },

  importDraft: (json) => {
    try {
      const draft = JSON.parse(json) as DraftPlan;
      // Validate structure
      if (!draft.name || !draft.days || !Array.isArray(draft.days)) {
        return false;
      }
      // Regenerate IDs for safety
      const sanitizedDraft = {
        ...draft,
        days: draft.days.map((day, dayIdx) => ({
          ...day,
          id: uuidv7(),
          dayIndex: dayIdx,
          exercises: day.exercises.map((ex, idx) => ({
            ...ex,
            id: uuidv7(),
            order: idx,
          })),
        })),
      };
      set({ draft: sanitizedDraft, isDirty: true });
      return true;
    } catch {
      return false;
    }
  },
}));

// Helper to parse rep strings like "8-12" or "10"
function parseReps(reps: string): number {
  if (reps.includes('-')) {
    const [min, max] = reps.split('-').map(Number);
    return (min + max) / 2;
  }
  if (reps.toUpperCase() === 'AMRAP') return 10; // Estimate
  return parseInt(reps, 10) || 10;
}