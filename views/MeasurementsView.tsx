
import React, { useState } from 'react';
import { useApp } from '../store';
import { Icons } from '../components/Icons';
import { BodyMeasurement } from '../types';

export const MeasurementsView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { measurements, addMeasurement } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<Partial<BodyMeasurement>>({ weight: 0 });

  const handleSave = () => {
    if (!form.weight) return;
    addMeasurement({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      ...form
    } as BodyMeasurement);
    setShowAdd(false);
    setForm({ weight: 0 });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
            <Icons.ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold">Measurements</h2>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-indigo-600 text-white p-2 rounded-xl shadow-lg"
        >
          <Icons.Plus className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-4">
        {measurements.map(m => (
          <div key={m.id} className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold text-slate-400">{new Date(m.date).toLocaleDateString()}</span>
              <span className="text-lg font-bold text-indigo-600">{m.weight} kg</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {m.waist && <div className="text-center"><div className="text-[10px] text-slate-400 uppercase font-bold">Waist</div><div className="font-bold">{m.waist}cm</div></div>}
              {m.bodyFat && <div className="text-center"><div className="text-[10px] text-slate-400 uppercase font-bold">Body Fat</div><div className="font-bold">{m.bodyFat}%</div></div>}
              {m.arms && <div className="text-center"><div className="text-[10px] text-slate-400 uppercase font-bold">Arms</div><div className="font-bold">{m.arms}cm</div></div>}
            </div>
          </div>
        ))}
        {measurements.length === 0 && (
          <div className="text-center py-20 text-slate-400">No measurements logged yet.</div>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAdd(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6">
            <h3 className="text-xl font-bold mb-6">Log New Entry</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Weight (kg)</label>
                <input type="number" onChange={e => setForm({...form, weight: parseFloat(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 focus:ring-2 ring-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Waist (cm)</label>
                  <input type="number" onChange={e => setForm({...form, waist: parseFloat(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Body Fat (%)</label>
                  <input type="number" onChange={e => setForm({...form, bodyFat: parseFloat(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3" />
                </div>
              </div>
              <button onClick={handleSave} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg mt-4">Save Entry</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
