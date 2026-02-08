
import React, { useState, useRef } from 'react';
import { useApp } from '../store';
import { Icons } from '../components/Icons';

export const PhotosView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { photos, addPhoto } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        addPhoto({
          id: Date.now().toString(),
          date: new Date().toISOString(),
          imageUrl: reader.result as string,
          label: 'Progress Update'
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
            <Icons.ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold">Progress Photos</h2>
        </div>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="bg-indigo-600 text-white p-2 rounded-xl shadow-lg"
        >
          <Icons.Camera className="w-6 h-6" />
        </button>
        <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleCapture} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {photos.map(p => (
          <div key={p.id} className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-slate-200 dark:bg-slate-800 shadow-md">
            <img src={p.imageUrl} alt="Progress" className="w-full h-full object-cover" />
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent text-white">
              <div className="text-[10px] font-bold opacity-80">{new Date(p.date).toLocaleDateString()}</div>
              <div className="text-xs font-bold">{p.label}</div>
            </div>
          </div>
        ))}
      </div>
      {photos.length === 0 && (
        <div className="text-center py-20 text-slate-400">Capture your first progress photo!</div>
      )}
    </div>
  );
};
