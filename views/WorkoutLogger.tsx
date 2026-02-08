
import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../store';
import { Icons } from '../components/Icons';
import { Workout, SetType, PerformedExercise, WorkoutSet } from '../types';
import { DEFAULT_EXERCISES } from '../constants';

const RestTimer: React.FC<{ seconds: number; onFinish: () => void }> = ({ seconds, onFinish }) => {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    if (timeLeft <= 0) {
      onFinish();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onFinish]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m}:${rs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed top-24 right-4 bg-indigo-600 text-white px-4 py-3 rounded-2xl shadow-2xl z-50 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="bg-white/20 p-1.5 rounded-lg">
        <Icons.Clock className="w-4 h-4" />
      </div>
      <span className="font-black text-sm tabular-nums">Rest: {formatTime(timeLeft)}</span>
      <button onClick={onFinish} className="hover:bg-white/10 p-1 rounded-md"><Icons.X className="w-4 h-4" /></button>
    </div>
  );
};

export const WorkoutLogger: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { activeWorkout, setActiveWorkout, addWorkout, customExercises, exerciseOverrides } = useApp();
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restDuration, setRestDuration] = useState(60);

  const library = useMemo(() => {
    const combined = [...DEFAULT_EXERCISES, ...customExercises];
    return combined.map(ex => ({
      ...ex,
      ...(exerciseOverrides[ex.id] || {})
    }));
  }, [customExercises, exerciseOverrides]);

  const startWorkout = (isPast: boolean = false) => {
    const now = new Date();
    const newWorkout: Workout = {
      id: Date.now().toString(),
      name: isPast ? 'Logged Session' : 'Active Session',
      date: now.toISOString(),
      exercises: [],
    };
    setActiveWorkout(newWorkout);
  };

  const addExerciseToWorkout = (exerciseId: string) => {
    if (!activeWorkout) return;
    const now = new Date().toISOString();
    const newPerformed: PerformedExercise = {
      exerciseId,
      startTime: now,
      sets: [{
        id: Math.random().toString(),
        reps: 10,
        weight: 0,
        restTime: 60,
        notes: '',
        type: SetType.Working,
        completed: false
      }]
    };
    setActiveWorkout({
      ...activeWorkout,
      exercises: [...activeWorkout.exercises, newPerformed]
    });
    setShowExercisePicker(false);
  };

  const updateSet = (exerciseIndex: number, setIndex: number, updates: Partial<WorkoutSet>) => {
    if (!activeWorkout) return;
    const newExercises = JSON.parse(JSON.stringify(activeWorkout.exercises));
    newExercises[exerciseIndex].sets[setIndex] = {
      ...newExercises[exerciseIndex].sets[setIndex],
      ...updates
    };
    setActiveWorkout({ ...activeWorkout, exercises: newExercises });

    if (updates.completed === true) {
      setRestDuration(newExercises[exerciseIndex].sets[setIndex].restTime || 60);
      setShowRestTimer(true);
    }
  };

  const addSet = (exerciseIndex: number) => {
    if (!activeWorkout) return;
    const newExercises = JSON.parse(JSON.stringify(activeWorkout.exercises));
    const lastSet = newExercises[exerciseIndex].sets[newExercises[exerciseIndex].sets.length - 1];
    newExercises[exerciseIndex].sets.push({
      ...lastSet,
      id: Math.random().toString(),
      completed: false
    });
    setActiveWorkout({ ...activeWorkout, exercises: newExercises });
  };

  const cloneSet = (exerciseIndex: number, setIndex: number) => {
    if (!activeWorkout) return;
    const newExercises = JSON.parse(JSON.stringify(activeWorkout.exercises));
    const setToClone = newExercises[exerciseIndex].sets[setIndex];
    newExercises[exerciseIndex].sets.splice(setIndex + 1, 0, {
      ...setToClone,
      id: Math.random().toString(),
      completed: false
    });
    setActiveWorkout({ ...activeWorkout, exercises: newExercises });
  };

  const finishWorkout = () => {
    if (!activeWorkout) return;
    const completedExercises = activeWorkout.exercises.map(ex => ({
      ...ex,
      sets: ex.sets.filter(s => s.completed)
    })).filter(ex => ex.sets.length > 0);

    if (completedExercises.length > 0) {
      addWorkout({ ...activeWorkout, exercises: completedExercises });
    }
    setActiveWorkout(null);
    onComplete();
  };

  const getSetTypeShort = (type: SetType) => {
    switch(type) {
      case SetType.Warmup: return 'W';
      case SetType.DropSet: return 'D';
      case SetType.Failure: return 'F';
      default: return 'S';
    }
  };

  const cycleSetType = (exerciseIndex: number, setIndex: number, current: SetType) => {
    const types = Object.values(SetType);
    const nextIndex = (types.indexOf(current) + 1) % types.length;
    updateSet(exerciseIndex, setIndex, { type: types[nextIndex] });
  };

  if (!activeWorkout) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6 space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 rounded-full"></div>
          <div className="relative bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-700">
            <Icons.Dumbbell className="w-16 h-16 text-indigo-600 mb-2" />
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-black tracking-tight">Track Your Gains</h2>
          <p className="text-slate-500 mt-2 max-w-xs text-sm font-medium">Log your exercises manually or start a live tracking session.</p>
        </div>
        
        <div className="w-full max-w-sm space-y-3">
          <button 
            onClick={() => startWorkout(false)}
            className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black shadow-xl shadow-indigo-500/30 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
          >
            <Icons.PlusCircle className="w-5 h-5" />
            Start Live Session
          </button>

          <button 
            onClick={() => startWorkout(true)}
            className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white py-5 rounded-[2rem] font-black border border-slate-200 dark:border-slate-700 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
          >
            <Icons.Calendar className="w-5 h-5 text-indigo-500" />
            Add Past History
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {showRestTimer && <RestTimer seconds={restDuration} onFinish={() => setShowRestTimer(false)} />}
      
      <div className="flex items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="flex flex-col flex-1">
          <input 
            type="text" 
            value={activeWorkout.name} 
            onChange={(e) => setActiveWorkout({...activeWorkout, name: e.target.value})}
            className="bg-transparent border-none text-2xl font-black focus:ring-0 p-0 text-slate-900 dark:text-white"
            placeholder="Workout Title"
          />
          <div className="flex items-center gap-2 mt-1">
            <Icons.Calendar className="w-3 h-3 text-indigo-500" />
            <input 
              type="datetime-local"
              value={new Date(new Date(activeWorkout.date).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
              onChange={(e) => setActiveWorkout({...activeWorkout, date: new Date(e.target.value).toISOString()})}
              className="bg-transparent border-none p-0 text-[10px] font-black text-slate-400 uppercase tracking-widest focus:ring-0 cursor-pointer hover:text-indigo-500 transition-colors"
            />
          </div>
        </div>
        <button 
          onClick={finishWorkout}
          className="bg-green-600 text-white px-8 py-3 rounded-2xl text-xs font-black shadow-lg shadow-green-500/20 uppercase tracking-widest active:scale-95 transition-all"
        >
          Finish
        </button>
      </div>

      <div className="space-y-6">
        {activeWorkout.exercises.map((perfEx, exIdx) => {
          const exInfo = library.find(e => e.id === perfEx.exerciseId);
          
          return (
            <div key={exIdx} className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center shadow-inner overflow-hidden">
                    {exInfo?.image ? (
                      <img src={exInfo.image} className="w-full h-full object-cover" />
                    ) : (
                      <Icons.Dumbbell className="w-7 h-7 text-slate-300" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm leading-none">{exInfo?.name}</h4>
                    <span className="text-[9px] font-black text-indigo-500/60 uppercase tracking-widest mt-2 block">{exInfo?.category} • {exInfo?.equipment}</span>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    const newExs = activeWorkout.exercises.filter((_, i) => i !== exIdx);
                    setActiveWorkout({...activeWorkout, exercises: newExs});
                  }}
                  className="text-slate-300 hover:text-red-500 transition-colors p-2 bg-slate-50 dark:bg-slate-900 rounded-xl"
                >
                  <Icons.Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-3 text-[10px] font-black text-slate-400 uppercase px-4 tracking-[0.15em] mb-1">
                  <div className="col-span-2">TYPE</div>
                  <div className="col-span-3 text-center">KG</div>
                  <div className="col-span-3 text-center">REPS</div>
                  <div className="col-span-4 text-right">ACTION</div>
                </div>

                {perfEx.sets.map((set, sIdx) => (
                  <div key={set.id} className={`grid grid-cols-12 gap-3 items-center transition-all duration-300 ${set.completed ? 'opacity-40 grayscale-[0.5]' : ''}`}>
                    <div className="col-span-2">
                      <button 
                        onClick={() => cycleSetType(exIdx, sIdx, set.type)}
                        disabled={set.completed}
                        className={`w-full aspect-square rounded-xl flex items-center justify-center font-black text-[10px] transition-colors ${
                          set.type === SetType.Working ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400' :
                          set.type === SetType.Warmup ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/40' :
                          'bg-red-100 text-red-600 dark:bg-red-900/40'
                        }`}
                      >
                        {getSetTypeShort(set.type)}
                      </button>
                    </div>
                    <div className="col-span-3">
                      <input 
                        type="number" 
                        value={set.weight || ''} 
                        onChange={(e) => updateSet(exIdx, sIdx, { weight: parseFloat(e.target.value) || 0 })}
                        disabled={set.completed}
                        placeholder="0"
                        className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-center font-black py-4 focus:ring-2 ring-indigo-500 text-sm shadow-inner"
                      />
                    </div>
                    <div className="col-span-3">
                      <input 
                        type="number" 
                        value={set.reps || ''} 
                        onChange={(e) => updateSet(exIdx, sIdx, { reps: parseInt(e.target.value) || 0 })}
                        disabled={set.completed}
                        placeholder="0"
                        className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-center font-black py-4 focus:ring-2 ring-indigo-500 text-sm shadow-inner"
                      />
                    </div>
                    <div className="col-span-4 flex justify-end gap-2">
                      {!set.completed && (
                        <button 
                          onClick={() => cloneSet(exIdx, sIdx)}
                          className="w-11 h-11 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 hover:text-indigo-500 transition-colors"
                        >
                          <Icons.PlusCircle className="w-5 h-5" />
                        </button>
                      )}
                      <button 
                        onClick={() => updateSet(exIdx, sIdx, { completed: !set.completed })}
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                          set.completed ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-slate-100 dark:bg-slate-900 text-slate-300'
                        }`}
                      >
                        <Icons.CheckCircle className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                ))}

                <button 
                  onClick={() => addSet(exIdx)}
                  className="w-full py-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-indigo-500 transition-colors mt-2"
                >
                  + Add Empty Set
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button 
        onClick={() => setShowExercisePicker(true)}
        className="w-full bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 py-6 rounded-[2.5rem] font-black flex items-center justify-center gap-3 border border-slate-100 dark:border-slate-700 shadow-sm uppercase tracking-widest text-xs active:scale-[0.98] transition-all hover:bg-indigo-50 dark:hover:bg-indigo-900/10 mb-8"
      >
        <Icons.Plus className="w-5 h-5" />
        Choose Exercise
      </button>

      {showExercisePicker && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowExercisePicker(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-[3rem] sm:rounded-[3rem] overflow-hidden max-h-[90vh] flex flex-col shadow-2xl border-t border-slate-200 dark:border-slate-800">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-2xl font-black">Exercises</h3>
              <button onClick={() => setShowExercisePicker(false)} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl active:scale-95"><Icons.X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-3 no-scrollbar">
              {library.map(ex => (
                <button 
                  key={ex.id} 
                  onClick={() => addExerciseToWorkout(ex.id)}
                  className="w-full flex items-center gap-5 p-5 bg-slate-50 dark:bg-slate-800 rounded-[2rem] hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all text-left group active:scale-[0.98]"
                >
                  <div className="w-16 h-16 rounded-[1.25rem] bg-white dark:bg-slate-700 overflow-hidden flex-shrink-0 shadow-sm border border-slate-100 dark:border-slate-600">
                    {ex.image ? (
                      <img src={ex.image} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Icons.Dumbbell className="w-7 h-7" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm">{ex.name}</div>
                    <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-2">{ex.category} • {ex.equipment}</div>
                  </div>
                  <div className="bg-white dark:bg-slate-700 p-3 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                    <Icons.Plus className="w-5 h-5 text-indigo-600" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
