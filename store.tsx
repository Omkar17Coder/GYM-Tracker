
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppState, Workout, Exercise, BodyMeasurement, ProgressPhoto, UserProfile } from './types';
import { DEFAULT_EXERCISES } from './constants';

interface AppContextType extends AppState {
  addWorkout: (workout: Workout) => void;
  updateWorkout: (workout: Workout) => void;
  deleteWorkout: (id: string) => void;
  addCustomExercise: (exercise: Exercise) => void;
  updateExercise: (id: string, updates: Partial<Exercise>) => void;
  addMeasurement: (measurement: BodyMeasurement) => void;
  addPhoto: (photo: ProgressPhoto) => void;
  setActiveWorkout: (workout: Workout | null) => void;
  toggleDarkMode: () => void;
  updateProfile: (profile: UserProfile) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('fit_track_pro_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.profile) parsed.profile = { height: 175, targetWeight: 75 };
      if (!parsed.exerciseOverrides) parsed.exerciseOverrides = {};
      // Respect saved dark mode, otherwise default to true
      if (parsed.darkMode === undefined) parsed.darkMode = true;
      return parsed;
    }
    return {
      workouts: [],
      customExercises: [],
      exerciseOverrides: {},
      measurements: [],
      photos: [],
      activeWorkout: null,
      darkMode: true, // DEFAULT DARK MODE
      profile: { height: 175, targetWeight: 75 }
    };
  });

  useEffect(() => {
    localStorage.setItem('fit_track_pro_state', JSON.stringify(state));
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state]);

  const addWorkout = useCallback((workout: Workout) => {
    setState(prev => ({ ...prev, workouts: [workout, ...prev.workouts] }));
  }, []);

  const updateWorkout = useCallback((workout: Workout) => {
    setState(prev => ({
      ...prev,
      workouts: prev.workouts.map(w => w.id === workout.id ? workout : w)
    }));
  }, []);

  const deleteWorkout = useCallback((id: string) => {
    setState(prev => ({ ...prev, workouts: prev.workouts.filter(w => w.id !== id) }));
  }, []);

  const addCustomExercise = useCallback((exercise: Exercise) => {
    setState(prev => ({ ...prev, customExercises: [...prev.customExercises, exercise] }));
  }, []);

  const updateExercise = useCallback((id: string, updates: Partial<Exercise>) => {
    setState(prev => {
      const isCustom = prev.customExercises.some(ex => ex.id === id);
      if (isCustom) {
        return {
          ...prev,
          customExercises: prev.customExercises.map(ex => ex.id === id ? { ...ex, ...updates } : ex)
        };
      } else {
        return {
          ...prev,
          exerciseOverrides: {
            ...prev.exerciseOverrides,
            [id]: { ...(prev.exerciseOverrides[id] || {}), ...updates }
          }
        };
      }
    });
  }, []);

  const addMeasurement = useCallback((measurement: BodyMeasurement) => {
    setState(prev => ({ ...prev, measurements: [measurement, ...prev.measurements] }));
  }, []);

  const addPhoto = useCallback((photo: ProgressPhoto) => {
    setState(prev => ({ ...prev, photos: [photo, ...prev.photos] }));
  }, []);

  const setActiveWorkout = useCallback((workout: Workout | null) => {
    setState(prev => ({ ...prev, activeWorkout: workout }));
  }, []);

  const toggleDarkMode = useCallback(() => {
    setState(prev => ({ ...prev, darkMode: !prev.darkMode }));
  }, []);

  const updateProfile = useCallback((profile: UserProfile) => {
    setState(prev => ({ ...prev, profile }));
  }, []);

  return (
    <AppContext.Provider value={{
      ...state,
      addWorkout,
      updateWorkout,
      deleteWorkout,
      addCustomExercise,
      updateExercise,
      addMeasurement,
      addPhoto,
      setActiveWorkout,
      toggleDarkMode,
      updateProfile
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
