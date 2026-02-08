
import { MuscleGroup, Difficulty, Exercise } from './types';

export const DEFAULT_EXERCISES: Exercise[] = [
  // Chest
  { id: 'c1', name: 'Bench Press', category: MuscleGroup.Chest, difficulty: Difficulty.Intermediate, equipment: 'Barbell' },
  { id: 'c2', name: 'Incline Dumbbell Press', category: MuscleGroup.Chest, difficulty: Difficulty.Intermediate, equipment: 'Dumbbells' },
  { id: 'c3', name: 'Chest Flys', category: MuscleGroup.Chest, difficulty: Difficulty.Beginner, equipment: 'Cable/Dumbbell' },
  { id: 'c4', name: 'Push-ups', category: MuscleGroup.Chest, difficulty: Difficulty.Beginner, equipment: 'Bodyweight' },
  // Back
  { id: 'b1', name: 'Deadlift', category: MuscleGroup.Back, difficulty: Difficulty.Advanced, equipment: 'Barbell' },
  { id: 'b2', name: 'Pull-ups', category: MuscleGroup.Back, difficulty: Difficulty.Intermediate, equipment: 'Pull-up Bar' },
  { id: 'b3', name: 'Lat Pulldown', category: MuscleGroup.Back, difficulty: Difficulty.Beginner, equipment: 'Cable Machine' },
  { id: 'b4', name: 'Bent Over Row', category: MuscleGroup.Back, difficulty: Difficulty.Intermediate, equipment: 'Barbell' },
  // Legs
  { id: 'l1', name: 'Squat', category: MuscleGroup.Legs, difficulty: Difficulty.Advanced, equipment: 'Barbell' },
  { id: 'l2', name: 'Leg Press', category: MuscleGroup.Legs, difficulty: Difficulty.Beginner, equipment: 'Machine' },
  { id: 'l3', name: 'Lunges', category: MuscleGroup.Legs, difficulty: Difficulty.Beginner, equipment: 'Dumbbells' },
  { id: 'l4', name: 'Leg Curls', category: MuscleGroup.Legs, difficulty: Difficulty.Beginner, equipment: 'Machine' },
  // Shoulders
  { id: 's1', name: 'Overhead Press', category: MuscleGroup.Shoulder, difficulty: Difficulty.Intermediate, equipment: 'Barbell' },
  { id: 's2', name: 'Lateral Raise', category: MuscleGroup.Shoulder, difficulty: Difficulty.Beginner, equipment: 'Dumbbells' },
  { id: 's3', name: 'Face Pulls', category: MuscleGroup.Shoulder, difficulty: Difficulty.Beginner, equipment: 'Cables' },
  // Arms
  { id: 'a1', name: 'Bicep Curls', category: MuscleGroup.Arms, difficulty: Difficulty.Beginner, equipment: 'Dumbbells' },
  { id: 'a2', name: 'Tricep Pushdowns', category: MuscleGroup.Arms, difficulty: Difficulty.Beginner, equipment: 'Cables' },
  { id: 'a3', name: 'Hammer Curls', category: MuscleGroup.Arms, difficulty: Difficulty.Beginner, equipment: 'Dumbbells' },
  // Core
  { id: 'cr1', name: 'Plank', category: MuscleGroup.Core, difficulty: Difficulty.Beginner, equipment: 'Bodyweight' },
  { id: 'cr2', name: 'Hanging Leg Raise', category: MuscleGroup.Core, difficulty: Difficulty.Intermediate, equipment: 'Pull-up Bar' },
  // Cardio
  { id: 'cd1', name: 'Running', category: MuscleGroup.Cardio, difficulty: Difficulty.Beginner, equipment: 'Treadmill/Outdoor' },
];

export const NAV_ITEMS = [
  { label: 'Dashboard', icon: 'LayoutDashboard', path: '/' },
  { label: 'Workout', icon: 'PlusCircle', path: '/log' },
  { label: 'History', icon: 'Calendar', path: '/history' },
  { label: 'Exercises', icon: 'Dumbbell', path: '/exercises' },
  { label: 'Stats', icon: 'BarChart2', path: '/stats' },
];
