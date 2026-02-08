
import React from 'react';
import { Icons } from './Icons';
import { useApp } from '../store';

const NavItem: React.FC<{ label: string; icon: keyof typeof Icons; isActive: boolean; onClick: () => void }> = ({ 
  label, icon, isActive, onClick 
}) => {
  const Icon = Icons[icon];
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-full py-2 transition-colors ${
        isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:text-slate-500'
      }`}
    >
      <Icon className="w-6 h-6" />
      <span className="text-[10px] mt-1 font-medium">{label}</span>
    </button>
  );
};

export const Layout: React.FC<{ children: React.ReactNode; currentPath: string; onNavigate: (path: string) => void }> = ({ 
  children, currentPath, onNavigate 
}) => {
  const { darkMode, toggleDarkMode, activeWorkout } = useApp();

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'dark bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Icons.Dumbbell className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Om's<span className="text-indigo-600">Tracker</span></h1>
        </div>
        <div className="flex items-center gap-3">
          {activeWorkout && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-bold animate-pulse">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              LIVE
            </div>
          )}
          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {darkMode ? <Icons.Sun className="w-5 h-5" /> : <Icons.Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-24 overflow-x-hidden">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-around px-2">
          <NavItem label="Home" icon="LayoutDashboard" isActive={currentPath === '/'} onClick={() => onNavigate('/')} />
          <NavItem label="Library" icon="Dumbbell" isActive={currentPath === '/exercises'} onClick={() => onNavigate('/exercises')} />
          <div className="relative -mt-8">
            <button 
              onClick={() => onNavigate('/log')}
              className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transform transition-transform active:scale-95 ${
                activeWorkout ? 'bg-green-600' : 'bg-indigo-600'
              }`}
            >
              {activeWorkout ? <Icons.History className="w-7 h-7 text-white" /> : <Icons.Plus className="w-8 h-8 text-white" />}
            </button>
          </div>
          <NavItem label="History" icon="Calendar" isActive={currentPath === '/history'} onClick={() => onNavigate('/history')} />
          <NavItem label="Stats" icon="BarChart2" isActive={currentPath === '/stats'} onClick={() => onNavigate('/stats')} />
        </div>
      </nav>
    </div>
  );
};
