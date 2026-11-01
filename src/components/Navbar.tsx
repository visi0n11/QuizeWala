import React from 'react';
import { Zap, Volume2, VolumeX, Moon, Sun, Award, Plus, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

interface NavbarProps {
  currentView: 'catalog' | 'stats';
  onNavigate: (view: 'catalog' | 'stats') => void;
  userXp: number;
  userLevel: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenAiModal: () => void;
  onOpenCreateModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  userXp,
  userLevel,
  soundEnabled,
  onToggleSound,
  darkMode,
  onToggleDarkMode,
  onOpenAiModal,
  onOpenCreateModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Single text wordmark */}
        <button
          onClick={() => {
            sound.playClick();
            onNavigate('catalog');
          }}
          className="flex items-center gap-2 group text-left cursor-pointer focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
              MindSprint
            </span>
          </div>
        </button>

        {/* Zone 2: 4-5 single-line clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => {
              sound.playClick();
              onNavigate('catalog');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-blue-600 dark:hover:text-blue-400 ${
              currentView === 'catalog' ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''
            }`}
          >
            Quiz Catalog
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onOpenAiModal();
            }}
            className="flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>AI Quiz Generator</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onOpenCreateModal();
            }}
            className="flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <Plus className="w-4 h-4 text-emerald-500" />
            <span>Create Quiz</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onNavigate('stats');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-blue-600 dark:hover:text-blue-400 ${
              currentView === 'stats' ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''
            }`}
          >
            Stats &amp; Badges
          </button>
        </nav>

        {/* Zone 3: 1 primary action & compact utility controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* XP & Level Indicator */}
          <button
            onClick={() => {
              sound.playClick();
              onNavigate('stats');
            }}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Your current Level and XP"
          >
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span className="tabular-nums">Lvl {userLevel}</span>
            <span className="text-slate-400 dark:text-slate-500">·</span>
            <span className="tabular-nums font-mono text-blue-600 dark:text-blue-400">{userXp} XP</span>
          </button>

          {/* Sound toggle */}
          <button
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={onToggleDarkMode}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Primary Quick Start Action */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenAiModal();
            }}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            AI Sprint
          </button>
        </div>
      </div>
    </header>
  );
};
