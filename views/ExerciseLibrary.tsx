
import React, { useState, useRef, useMemo } from 'react';
import { useApp } from '../store';
import { Icons } from '../components/Icons';
import { MuscleGroup, Difficulty, Exercise, ExerciseType } from '../types';
import { DEFAULT_EXERCISES } from '../constants';

export const ExerciseLibrary: React.FC = () => {
  const { customExercises, addCustomExercise, updateExercise, exerciseOverrides } = useApp();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<MuscleGroup | 'All'>('All');
  const [activeType, setActiveType] = useState<ExerciseType | 'All'>('All');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  
  const [newEx, setNewEx] = useState<Partial<Exercise>>({
    name: '',
    category: MuscleGroup.Chest,
    equipment: 'Dumbbells',
    difficulty: Difficulty.Beginner,
    type: ExerciseType.Strength
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const allExercises = useMemo(() => {
    const combined = [...DEFAULT_EXERCISES, ...customExercises];
    return combined.map(ex => ({
      ...ex,
      ...(exerciseOverrides[ex.id] || {})
    }));
  }, [customExercises, exerciseOverrides]);

  const filtered = allExercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || ex.category === activeCategory;
    const matchesType = activeType === 'All' || ex.type === activeType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (isEdit && editingExercise) {
          updateExercise(editingExercise.id, { image: base64 });
          setEditingExercise(prev => prev ? { ...prev, image: base64 } : null);
        } else {
          setNewEx({ ...newEx, image: base64 });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const saveCustomExercise = () => {
    if (!newEx.name) return;
    const ex: Exercise = {
      id: 'custom-' + Date.now(),
      name: newEx.name,
      category: newEx.category as MuscleGroup,
      difficulty: newEx.difficulty as Difficulty,
      equipment: newEx.equipment || 'Bodyweight',
      type: newEx.type as ExerciseType,
      image: newEx.image,
      custom: true
    };
    addCustomExercise(ex);
    setShowAddModal(false);
    setNewEx({ name: '', category: MuscleGroup.Chest, difficulty: Difficulty.Beginner, type: ExerciseType.Strength });
  };

  const categories = ['All', ...Object.values(MuscleGroup)];
  const types = ['All', ...Object.values(ExerciseType)];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black">Exercise Library</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
        >
          <Icons.Plus className="w-4 h-4" />
          Add New
        </button>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Icons.Dumbbell className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800 border-none rounded-2xl shadow-sm focus:ring-2 ring-indigo-500 text-sm font-bold"
          />
        </div>

        <div className="space-y-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat as any)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest transition-all ${
                  activeCategory === cat 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-100 dark:border-slate-700'
                }`}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {types.map(t => (
              <button 
                key={t}
                onClick={() => setActiveType(t as any)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest transition-all ${
                  activeType === t 
                    ? 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900' 
                    : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-100 dark:border-slate-700'
                }`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filtered.map(ex => (
          <div 
            key={ex.id} 
            className="bg-white dark:bg-slate-800 p-3 rounded-3xl border border-slate-100 dark:border-slate-700 flex items-center gap-4 hover:shadow-md transition-all group"
          >
            <div 
              onClick={() => setEditingExercise(ex)}
              className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-700 flex-shrink-0 relative cursor-pointer group/img"
            >
              {ex.image ? (
                <img src={ex.image} alt={ex.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300 group-hover:text-indigo-500 transition-colors">
                  <Icons.Camera className="w-6 h-6" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                <Icons.Plus className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1" onClick={() => setEditingExercise(ex)}>
              <h4 className="font-black text-sm text-slate-900 dark:text-white leading-tight">{ex.name}</h4>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-wider bg-indigo-50 dark:bg-indigo-900/20 px-1.5 py-0.5 rounded">{ex.category}</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{ex.equipment}</span>
                {ex.type && (
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded">{ex.type}</span>
                )}
              </div>
            </div>
            <button 
              onClick={() => setEditingExercise(ex)}
              className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              <Icons.Settings className="w-4 h-4 text-slate-200 group-hover:text-slate-400" />
            </button>
          </div>
        ))}
      </div>

      {/* Floating Add Custom Button (Alternative) */}
      <button 
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-24 right-6 w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center transform active:scale-95 transition-all z-30 hover:rotate-90 md:hidden"
      >
        <Icons.Plus className="w-8 h-8" />
      </button>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-black">New Exercise</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-full"><Icons.X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6 no-scrollbar">
              <div className="flex flex-col items-center gap-4">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-32 h-32 rounded-3xl bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-2 overflow-hidden group/img-btn"
                >
                  {newEx.image ? (
                    <img src={newEx.image} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Icons.Camera className="w-8 h-8 text-slate-300 group-hover/img-btn:text-indigo-500 transition-colors" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Add Image</span>
                    </>
                  )}
                </button>
                <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={(e) => handleImageUpload(e)} />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block tracking-widest">Exercise Name</label>
                  <input 
                    type="text" 
                    value={newEx.name}
                    onChange={e => setNewEx({...newEx, name: e.target.value})}
                    placeholder="e.g. Bulgarian Split Squat"
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 font-bold focus:ring-2 ring-indigo-500" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block tracking-widest">Muscle Group</label>
                    <select 
                      value={newEx.category}
                      onChange={e => setNewEx({...newEx, category: e.target.value as MuscleGroup})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 font-bold focus:ring-2 ring-indigo-500 appearance-none"
                    >
                      {Object.values(MuscleGroup).map(mg => <option key={mg} value={mg}>{mg}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block tracking-widest">Type</label>
                    <select 
                      value={newEx.type}
                      onChange={e => setNewEx({...newEx, type: e.target.value as ExerciseType})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 font-bold focus:ring-2 ring-indigo-500 appearance-none"
                    >
                      {Object.values(ExerciseType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block tracking-widest">Equipment</label>
                  <input 
                    type="text" 
                    value={newEx.equipment}
                    onChange={e => setNewEx({...newEx, equipment: e.target.value})}
                    placeholder="Dumbbells, Machine, etc."
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 font-bold focus:ring-2 ring-indigo-500" 
                  />
                </div>
              </div>
              <button 
                onClick={saveCustomExercise}
                className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black shadow-xl shadow-indigo-500/20 active:scale-95 transition-all"
              >
                Create Exercise
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Exercise / Image Modal */}
      {editingExercise && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setEditingExercise(null)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black">Edit Exercise</h3>
              <button onClick={() => setEditingExercise(null)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full"><Icons.X className="w-5 h-5" /></button>
            </div>
            
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <div className="w-full aspect-square rounded-3xl bg-slate-100 dark:bg-slate-800 overflow-hidden relative group">
                  {editingExercise.image ? (
                    <img src={editingExercise.image} alt={editingExercise.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                      <Icons.Camera className="w-12 h-12 mb-2" />
                      <span className="text-[10px] font-black uppercase tracking-widest">No Image</span>
                    </div>
                  )}
                  <button 
                    onClick={() => editFileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white font-black text-xs uppercase tracking-widest"
                  >
                    Change Photo
                  </button>
                </div>
                <input type="file" hidden ref={editFileInputRef} accept="image/*" onChange={(e) => handleImageUpload(e, true)} />
              </div>

              <div className="text-center">
                <h4 className="font-black text-lg">{editingExercise.name}</h4>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{editingExercise.category} • {editingExercise.equipment}</p>
              </div>

              <button 
                onClick={() => setEditingExercise(null)}
                className="w-full bg-slate-100 dark:bg-slate-800 py-4 rounded-2xl font-black text-sm uppercase tracking-widest active:scale-95 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
