
import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../store';
import { Icons } from '../components/Icons';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MuscleGroup } from '../types';
import { DEFAULT_EXERCISES } from '../constants';

export const Dashboard: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { workouts, customExercises, exerciseOverrides, profile, updateProfile, measurements } = useApp();
  const [now, setNow] = useState(new Date());
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [tempProfile, setTempProfile] = useState(profile);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const library = useMemo(() => {
    const combined = [...DEFAULT_EXERCISES, ...customExercises];
    return combined.map(ex => ({
      ...ex,
      ...(exerciseOverrides[ex.id] || {})
    }));
  }, [customExercises, exerciseOverrides]);

  const muscleVolumeData = useMemo(() => {
    const volumes: Record<string, number> = {};
    Object.values(MuscleGroup).forEach(m => (volumes[m] = 0));

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    workouts.forEach(w => {
      if (new Date(w.date) >= last7Days) {
        w.exercises.forEach(pe => {
          const info = library.find(l => l.id === pe.exerciseId);
          if (info) {
            const vol = pe.sets.reduce((acc, s) => acc + (s.weight * s.reps), 0);
            volumes[info.category] += vol;
          }
        });
      }
    });

    return Object.entries(volumes)
      .map(([name, volume]) => ({ name, volume }))
      .filter(d => d.volume > 0)
      .sort((a, b) => b.volume - a.volume);
  }, [workouts, library]);

  const currentWeight = measurements[0]?.weight || 0;

  const handleProfileSave = () => {
    updateProfile(tempProfile);
    setShowProfileModal(false);
  };

  const colors = ['#4f46e5', '#7c3aed', '#db2777', '#ea580c', '#16a34a', '#2563eb', '#ca8a04'];

  return (
    <div className="space-y-6">
      {/* Header with Clock */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex-1">
          <h2 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white flex items-baseline gap-2">
            {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </h2>
          <p className="text-indigo-600 font-black uppercase text-xs tracking-widest mt-1">
            {now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        
        <button 
          onClick={() => {
            setTempProfile(profile);
            setShowProfileModal(true);
          }}
          className="flex items-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-3xl shadow-sm hover:shadow-md transition-all active:scale-95 text-sm font-bold"
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Icons.Target className="w-6 h-6" />
          </div>
          <div className="text-left">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Athlete Stats</p>
            <p className="text-lg font-black leading-tight text-slate-900 dark:text-white">
              {currentWeight || '---'} kg <span className="text-slate-400 font-medium">/</span> {profile.height} cm
            </p>
          </div>
        </button>
      </div>

      {/* Creative Exercise Section: Weekly Muscle Load */}
      <section className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Icons.Dumbbell className="w-32 h-32 rotate-45" />
        </div>
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div>
            <h3 className="font-black text-xl flex items-center gap-2">
              <Icons.Flame className="w-6 h-6 text-orange-500" />
              Weekly Intensity
            </h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Volume by Muscle Group (7D)</p>
          </div>
        </div>

        <div className="h-64 w-full relative z-10">
          {muscleVolumeData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={muscleVolumeData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  fontSize={10} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontWeight: 800}}
                  width={70}
                />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', background: '#1e293b', color: 'white' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Bar dataKey="volume" radius={[0, 8, 8, 0]} barSize={24}>
                  {muscleVolumeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                 <Icons.Dumbbell className="w-8 h-8 opacity-20" />
              </div>
              <div className="text-center">
                <p className="text-sm font-black uppercase tracking-widest">No intensity data</p>
                <p className="text-[10px] font-bold opacity-60 mt-1">Finish a workout to see muscle breakdown</p>
              </div>
              <button onClick={() => onNavigate('/log')} className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-500/20 active:scale-95 transition-all">Start Session</button>
            </div>
          )}
        </div>
      </section>

      {/* Quick Access Grid */}
      <section>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'PRs', icon: 'Trophy', color: 'bg-yellow-500', path: '/prs' },
            { label: 'Body', icon: 'Target', color: 'bg-blue-500', path: '/measurements' },
            { label: 'Photos', icon: 'Camera', color: 'bg-purple-500', path: '/photos' }
          ].map((item) => (
            <button 
              key={item.label} 
              onClick={() => onNavigate(item.path)}
              className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 flex flex-col items-center gap-3 group active:scale-95 transition-all shadow-sm"
            >
              <div className={`${item.color} p-4 rounded-3xl shadow-xl shadow-black/10 group-hover:scale-110 transition-transform`}>
                {React.createElement((Icons as any)[item.icon], { className: "w-6 h-6 text-white" })}
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{item.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowProfileModal(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black">Edit Profile</h3>
              <button onClick={() => setShowProfileModal(false)} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-full"><Icons.X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-black text-slate-400 uppercase mb-2 block tracking-widest">Height (cm)</label>
                <input 
                  type="number" 
                  value={tempProfile.height}
                  onChange={e => setTempProfile({...tempProfile, height: parseInt(e.target.value) || 0})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 font-black text-xl focus:ring-2 ring-indigo-500" 
                />
              </div>
              <div>
                <label className="text-xs font-black text-slate-400 uppercase mb-2 block tracking-widest">Target Weight (kg)</label>
                <input 
                  type="number" 
                  value={tempProfile.targetWeight}
                  onChange={e => setTempProfile({...tempProfile, targetWeight: parseInt(e.target.value) || 0})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 font-black text-xl focus:ring-2 ring-indigo-500" 
                />
              </div>
              <button onClick={handleProfileSave} className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black shadow-xl shadow-indigo-500/20 mt-4 transition-transform active:scale-95">
                Update Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
