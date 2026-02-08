
import React from 'react';
import { useApp } from '../store';
import { Icons } from '../components/Icons';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { DEFAULT_EXERCISES } from '../constants';

export const Stats: React.FC = () => {
  const { workouts, customExercises } = useApp();
  const allExercises = [...DEFAULT_EXERCISES, ...customExercises];

  const chartData = React.useMemo(() => {
    if (workouts.length === 0) return [];
    return [...workouts].reverse().map(w => ({
      name: new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      volume: w.exercises.reduce((acc, ex) => acc + ex.sets.reduce((sAcc, s) => sAcc + ((s.weight || 0) * (s.reps || 0)), 0), 0)
    }));
  }, [workouts]);

  const topPRs = React.useMemo(() => {
    const records: Record<string, { weight: number; reps: number; exerciseId: string }> = {};
    workouts.forEach(w => {
      w.exercises.forEach(perfEx => {
        perfEx.sets.forEach(s => {
          if (s.completed && s.weight > 0) {
            const current = records[perfEx.exerciseId];
            if (!current || s.weight > current.weight) {
              records[perfEx.exerciseId] = { weight: s.weight, reps: s.reps, exerciseId: perfEx.exerciseId };
            }
          }
        });
      });
    });
    return Object.values(records)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3)
      .map(pr => ({
        ...pr,
        name: allExercises.find(e => e.id === pr.exerciseId)?.name || 'Unknown'
      }));
  }, [workouts, allExercises]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Analytics</h2>
        <p className="text-slate-500 text-sm">Real-time data from your tracked sessions.</p>
      </div>

      {chartData.length > 0 ? (
        <section className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <h3 className="font-bold mb-6 flex items-center gap-2">
            <Icons.BarChart2 className="w-5 h-5 text-indigo-500" />
            Total Volume (kg)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="volume" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorVol)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      ) : (
        <div className="bg-slate-100 dark:bg-slate-800/50 p-12 text-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
           <Icons.BarChart2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
           <p className="text-slate-500">Track a few sessions to see your progress chart!</p>
        </div>
      )}

      {topPRs.length > 0 && (
        <section>
          <h3 className="font-bold text-lg mb-4">Top Heavy Lifts</h3>
          <div className="space-y-3">
            {topPRs.map((item, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-lg">
                    <Icons.Trophy className="w-4 h-4 text-yellow-600" />
                  </div>
                  <h4 className="font-bold text-sm">{item.name}</h4>
                </div>
                <div className="text-right">
                  <div className="font-bold text-indigo-600 dark:text-indigo-400">{item.weight} kg</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
