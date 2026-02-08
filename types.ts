
export enum MuscleGroup {
  Back = 'Back',
  Shoulder = 'Shoulder',
  Chest = 'Chest',
  Legs = 'Legs',
  Arms = 'Arms',
  Core = 'Core',
  Cardio = 'Cardio'
}

export enum ExerciseType {
  Strength = 'Strength',
  Hypertrophy = 'Hypertrophy',
  Cardio = 'Cardio',
  Bodyweight = 'Bodyweight',
  Flexibility = 'Flexibility'
}

export enum Difficulty {
  Beginner = 'Beginner',
  Intermediate = 'Intermediate',
  Advanced = 'Advanced'
}

export enum SetType {
  Warmup = 'Warmup',
  Working = 'Working',
  DropSet = 'Drop Set',
  Failure = 'To Failure'
}

export interface Exercise {
  id: string;
  name: string;
  category: MuscleGroup;
  difficulty: Difficulty;
  equipment: string;
  type?: ExerciseType;
  demoUrl?: string;
  custom?: boolean;
  image?: string;
}

export interface WorkoutSet {
  id: string;
  reps: number;
  weight: number;
  restTime: number; // in seconds
  notes: string;
  type: SetType;
  completed: boolean;
}

export interface PerformedExercise {
  exerciseId: string;
  sets: WorkoutSet[];
  startTime?: string; // ISO string for when this exercise was added/started
}

export interface Workout {
  id: string;
  name: string;
  date: string; // ISO string
  exercises: PerformedExercise[];
  notes?: string;
  energyLevel?: number; // 1-10
  sleepQuality?: number; // 1-10
}

export interface BodyMeasurement {
  id: string;
  date: string;
  weight?: number;
  bodyFat?: number;
  chest?: number;
  waist?: number;
  arms?: number;
  thighs?: number;
}

export interface ProgressPhoto {
  id: string;
  date: string;
  imageUrl: string;
  label?: string;
}

export interface UserProfile {
  height: number;
  targetWeight: number;
}

export interface AppState {
  workouts: Workout[];
  customExercises: Exercise[];
  exerciseOverrides: Record<string, Partial<Exercise>>; // To store edits (like images) for default exercises
  measurements: BodyMeasurement[];
  photos: ProgressPhoto[];
  activeWorkout: Workout | null;
  darkMode: boolean;
  profile: UserProfile;
}
