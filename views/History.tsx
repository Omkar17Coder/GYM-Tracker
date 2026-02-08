
import React, { useState, useMemo } from 'react';
import { useApp } from '../store';
import { Icons } from '../components/Icons';
import { Workout } from '../types';
import { DEFAULT_EXERCISES } from '../constants';

export const History: React.FC = () => {
  const { workouts, customExercises, exerciseOverrides, measurements } = useApp();
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [viewType, setViewType] = useState<'list' | 'calendar'>('list');
  const [currentDate, setCurrentDate] = useState(new Date());

  const library = useMemo(() => {
    const combined = [...DEFAULT_EXERCISES, ...customExercises];
    return combined.map(ex => ({
      ...ex,
      ...(exerciseOverrides[ex.id] || {})
    }));
  }, [customExercises, exerciseOverrides]);

  const groupedWorkouts = useMemo(() => {
    const groups: Record<string, Workout[]> = {};
    workouts.forEach(w => {
      const dateKey = new Date(w.date).toDateString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(w);
    });
    return groups;
  }, [workouts]);

  const downloadData = () => {
    const data = {
      workouts,
      measurements,
      exportDate: new Date().toISOString(),
      app: "FitTrack Pro"
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `training-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }, [currentDate]);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-3xl font-black uppercase tracking-tighter">History</h2>
        <div className="flex items-center gap-3">
          <button 
            onClick={downloadData}
            title="Download Backup"
            className="p-3.5 bg-white dark:bg-slate-800 text-slate-500 border border-slate-100 dark:border-slate-700 rounded-2xl hover:text-indigo-600 transition-all shadow-sm active:scale-95"
          >
            <Icons.PlusCircle className="w-5 h-5 rotate-180" />
          </button>
          <div className="bg-white dark:bg-slate-800 p-1.5 rounded-[1.5rem] border border-slate-100 dark:border-slate-700 flex shadow-sm">
            <button 
              onClick={() => setViewType('list')}
              className={`px-5 py-2 text-[10px] font-black tracking-widest rounded-xl transition-all ${
                viewType === 'list' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400'
              }`}
            >
              LIST
            </button>
            <button 
              onClick={() => setViewType('calendar')}
              className={`px-5 py-2 text-[10px] font-black tracking-widest rounded-xl transition-all ${
                viewType === 'calendar' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400'
              }`}
            >
              CAL
            </button>
          </div>
        </div>
      </div>

      {viewType === 'list' ? (
        workouts.length > 0 ? (
          <div className="space-y-8">
            {Object.entries(groupedWorkouts).map(([date, sessionList]) => (
              <div key={date} className="space-y-4">
                <h3 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse"></span>
                  {date === new Date().toDateString() ? 'TODAY' : date.toUpperCase()}
                </h3>
                {sessionList.map(workout => (
                  <div 
                    key={workout.id} 
                    className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 group cursor-pointer hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all shadow-sm active:scale-[0.98]"
                    onClick={() => setSelectedWorkout(workout)}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex-1">
                        <h3 className="font-black text-xl text-slate-900 dark:text-white leading-none mb-2">
                          {workout.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Icons.Clock className="w-3.5 h-3.5 text-slate-400" />
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            {new Date(workout.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <div className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 p-4 rounded-3xl shadow-inner transition-transform group-hover:scale-110">
                        <Icons.History className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {workout.exercises.map((ex, i) => {
                        const info = library.find(l => l.id === ex.exerciseId);
                        return (
                          <span key={i} className="text-[9px] bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 px-3.5 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700 font-black uppercase tracking-widest">
                            {info?.name || 'Unknown'}: {ex.sets.length}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[3rem] p-24 text-center">
            <Icons.Calendar className="w-20 h-20 text-slate-200 mx-auto mb-6 opacity-30" />
            <h3 className="font-black text-slate-400 text-lg uppercase tracking-widest">No history logged</h3>
            <p className="text-xs text-slate-400 mt-2 font-medium">Your progress journey starts with your first log.</p>
          </div>
        )
      ) : (
        /* CALENDAR VIEW */
        <div className="bg-white dark:bg-slate-800 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-sm p-8 space-y-8 animate-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-black text-xl uppercase tracking-tighter">
              {currentDate.toLocaleDateString([], { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex gap-3">
              <button onClick={prevMonth} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl hover:bg-indigo-50 transition-colors"><Icons.ChevronLeft className="w-5 h-5" /></button>
              <button onClick={nextMonth} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl hover:bg-indigo-50 transition-colors"><Icons.ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-3">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
              <div key={d} className="text-center text-[10px] font-black text-slate-400 tracking-widest mb-2">{d}</div>
            ))}
            {daysInMonth.map((day, idx) => {
              const dateStr = day ? day.toDateString() : '';
              const dayWorkouts = groupedWorkouts[dateStr];
              const isToday = day && day.toDateString() === new Date().toDateString();

              return (
                <div key={idx} className="aspect-square flex flex-col items-center justify-center relative">
                  {day && (
                    <button 
                      onClick={() => dayWorkouts && setViewType('list')}
                      className={`w-full h-full rounded-[1.25rem] flex flex-col items-center justify-center transition-all ${
                        dayWorkouts 
                        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 font-black scale-105 z-10' 
                        : isToday 
                        ? 'border-2 border-indigo-600 text-indigo-600 font-black' 
                        : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span className="text-xs">{day.getDate()}</span>
                      {dayWorkouts && <span className="text-[7px] mt-1 font-black opacity-60 uppercase">{dayWorkouts.length} EX</span>}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedWorkout && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-2xl" onClick={() => setSelectedWorkout(null)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] p-10 overflow-y-auto max-h-[85vh] shadow-2xl no-scrollbar border border-slate-100 dark:border-slate-800 animate-in slide-in-from-bottom-8 duration-300">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h3 className="text-3xl font-black tracking-tighter mb-2 text-slate-900 dark:text-white leading-none">{selectedWorkout.name}</h3>
                <p className="text-[10px] text-indigo-600 font-black uppercase tracking-[0.2em] bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-xl inline-block">
                  {new Date(selectedWorkout.date).toDateString().toUpperCase()}
                </p>
              </div>
              <button onClick={() => setSelectedWorkout(null)} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl active:scale-95 transition-all text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <Icons.X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-10">
              {selectedWorkout.exercises.map((perfEx, idx) => {
                const info = library.find(l => l.id === perfEx.exerciseId);
                const addedTime = perfEx.startTime ? new Date(perfEx.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

                return (
                  <div key={idx} className="space-y-5">
                    <div className="flex justify-between items-end border-b-2 border-slate-100 dark:border-slate-800 pb-3">
                      <div>
                        <h4 className="font-black text-sm uppercase tracking-widest text-slate-900 dark:text-white leading-none">{info?.name || `Exercise ${idx + 1}`}</h4>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-1">{info?.category}</p>
                      </div>
                      {addedTime && <span className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-lg">AT {addedTime}</span>}
                    </div>
                    <div className="space-y-2">
                      <div className="grid grid-cols-4 gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-5 mb-1">
                        <div>SET</div>
                        <div>KG</div>
                        <div>REPS</div>
                        <div className="text-right">VOL</div>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-[2rem] space-y-1.5 shadow-inner">
                        {perfEx.sets.map((set, si) => (
                          <div key={si} className="grid grid-cols-4 gap-2 text-xs p-4 rounded-[1.25rem] border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all items-center bg-white dark:bg-slate-900 shadow-sm">
                            <div className="font-black text-slate-400">#{si + 1}</div>
                            <div className="font-black text-slate-900 dark:text-white">{set.weight}</div>
                            <div className="font-black text-slate-900 dark:text-white">{set.reps}</div>
                            <div className="text-right font-black text-indigo-600 dark:text-indigo-400">{(set.weight * set.reps).toLocaleString()}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
