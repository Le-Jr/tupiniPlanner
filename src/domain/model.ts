export const categories = [
  "movement",
  "meal",
  "guitar",
  "hydration",
  "sleep",
  "custom",
] as const;
export type Category = (typeof categories)[number];
export type Status = "pending" | "completed" | "skipped" | "postponed";
export interface UserProfile {
  id: string;
  displayName: string;
  heightCm?: number;
  birthYear?: number;
  onboardingCompleted: boolean;
  consentAt: string;
  createdAt: string;
  sleepRoutine?: string;
  activityLevel?: string;
  limitations?: string;
  mealRoutine?: string;
}
export interface HealthBaseline {
  id: string;
  measuredAt: string;
  weightKg: number;
  bodyFatPercent?: number;
  leanMassKg?: number;
  visceralIndex?: number;
  source: string;
  notes?: string;
}
export interface Goal {
  id: string;
  category: Category | "body";
  title: string;
  targetValue?: number;
  unit?: string;
  active: boolean;
  createdAt: string;
}
export interface TaskTemplate {
  id: string;
  category: Category;
  title: string;
  recurrenceDays: number[];
  oneOffDate?: string;
  localTime?: string;
  active: boolean;
  xpValue: number;
  order: number;
  createdDate: string;
  workoutRef?: "walk" | "calisthenics";
}
export interface TaskOccurrence {
  id: string;
  templateId?: string;
  localDate: string;
  titleSnapshot: string;
  category: Category;
  status: Status;
  completedAt?: string;
  notes?: string;
  reason?: string;
  localTime?: string;
  xpValue: number;
  order: number;
  workoutRef?: "walk" | "calisthenics";
  originId?: string;
}
export interface WorkoutSession {
  id: string;
  localDate: string;
  workoutType: "walk" | "calisthenics";
  minutes: number;
  effort?: number;
  exercises: { name: string; sets: number; reps: number }[];
  notes?: string;
}
export interface MealLog {
  id: string;
  localDate: string;
  mealType: string;
  at?: string;
  description?: string;
  hunger?: number;
  notes?: string;
  status: "completed" | "skipped" | "postponed";
}
export interface GuitarSession {
  id: string;
  localDate: string;
  durationMinutes: number;
  technique?: string;
  repertoire?: string;
  bpm?: number;
  notes?: string;
}
export interface BodyMeasurement {
  id: string;
  date: string;
  weightKg?: number;
  waistCm?: number;
  bodyFatPercent?: number;
  measurementMethod?: string;
  notes?: string;
}
export interface XPEvent {
  id: string;
  sourceType: "task" | "day";
  sourceId: string;
  points: number;
  createdAt: string;
}
export interface BadgeUnlock {
  id: string;
  badgeId: string;
  unlockedAt: string;
}
export interface DailyReflection {
  id: string;
  localDate: string;
  notes: string;
  mood?: string;
  createdAt: string;
}
export interface AppSettings {
  id: string;
  lastAgendaDate?: string;
  guitarTimer?: {
    elapsedSeconds: number;
    startedAt?: number;
    localDate: string;
    targetSeconds: number;
  };
  theme: "forest" | "midnight";
  animationsEnabled: boolean;
  reducedMotion: boolean;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  notificationsEnabled: boolean;
  hideBody: boolean;
  hideStreak: boolean;
  skipReactions: boolean;
  /** Online 80s GIFs via GIPHY; undefined (older data) means enabled. */
  gifsEnabled?: boolean;
  /** Local reminder preferences; undefined (older data) uses the defaults. */
  reminders?: {
    missions: boolean;
    lead: number;
    morning: boolean;
    morningTime: string;
    evening: boolean;
    eveningTime: string;
  };
  locale: "pt-BR";
  guitarMinutes: number;
  guitarWeeklyGoal: number;
  guitarBlocks: number[];
}
export interface State {
  profiles: UserProfile[];
  baselines: HealthBaseline[];
  goals: Goal[];
  templates: TaskTemplate[];
  occurrences: TaskOccurrence[];
  workouts: WorkoutSession[];
  meals: MealLog[];
  guitar: GuitarSession[];
  measurements: BodyMeasurement[];
  xp: XPEvent[];
  badges: BadgeUnlock[];
  reflections: DailyReflection[];
  settings: AppSettings[];
}
export const tables = [
  "profiles",
  "baselines",
  "goals",
  "templates",
  "occurrences",
  "workouts",
  "meals",
  "guitar",
  "measurements",
  "xp",
  "badges",
  "reflections",
  "settings",
] as const;
export const defaultSettings: AppSettings = {
  id: "settings",
  theme: "forest",
  animationsEnabled: true,
  reducedMotion: false,
  soundEnabled: false,
  hapticsEnabled: false,
  notificationsEnabled: false,
  hideBody: false,
  hideStreak: false,
  skipReactions: false,
  locale: "pt-BR",
  guitarMinutes: 35,
  guitarWeeklyGoal: 4,
  guitarBlocks: [5, 10, 15, 5],
};
export function emptyState(): State {
  return {
    profiles: [],
    baselines: [],
    goals: [],
    templates: [],
    occurrences: [],
    workouts: [],
    meals: [],
    guitar: [],
    measurements: [],
    xp: [],
    badges: [],
    reflections: [],
    settings: [
      { ...defaultSettings, guitarBlocks: [...defaultSettings.guitarBlocks] },
    ],
  };
}
export const categoryNames: Record<Category, string> = {
  movement: "Movimento",
  meal: "Alimentação",
  guitar: "Guitarra",
  hydration: "Hidratação",
  sleep: "Sono",
  custom: "Pessoal",
};
