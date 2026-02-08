
import React from 'react';
import { useApp } from '../store';
import { Icons } from '../components/Icons';
import { DEFAULT_EXERCISES } from '../constants';

export const PRsView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { workouts, customExercises } = useApp();
  const allExercises = [...DEFAULT_EXERCISES, ...customExercises];

  const prs = React.useMemo(() => {
    const records: Record<string, { weight: number; reps: number; date: string }> = {};

    workouts.forEach(workout => {
      workout.exercises.forEach(perfEx => {
        perfEx.sets.forEach(set => {
          if (set.completed && set.weight > 0) {
            const currentRecord = records[perfEx.exerciseId];
            if (!currentRecord || set.weight > currentRecord.weight || (set.weight === currentRecord.weight && set.reps > currentRecord.reps)) {
              records[perfEx.exerciseId] = {
                weight: set.weight,
                reps: set.reps,
                date: workout.date
              };
            }
          }
        });
      });
    });

    return Object.entries(records).map(([exerciseId, record]) => {
      const exInfo = allExercises.find(e => e.id === exerciseId);
      return {
        ...record,
        exerciseName: exInfo?.name || 'Unknown Exercise',
        category: exInfo?.category || 'Other'
      };
    }).sort((a, b) => b.weight - a.weight);
  }, [workouts, allExercises]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
          <Icons.ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold">Personal Records</h2>
      </div>

      {prs.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {prs.map((pr, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-lg">{pr.exerciseName}</h4>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">{pr.category}</p>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-xl">
                  <Icons.Trophy className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{pr.weight}</span>
                  <span className="text-sm font-bold text-slate-400 ml-1">kg</span>
                  <div className="text-xs font-medium text-slate-400 mt-1">For {pr.reps} reps</div>
                </div>
                <div className="text-[10px] font-bold text-slate-400">
                  {new Date(pr.date).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-100 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
          <Icons.Trophy className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">No records yet. Log some heavy sets!</p>
        </div>
      )}
    </div>
  );
};
