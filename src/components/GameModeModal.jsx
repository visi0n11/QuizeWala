import React, { useState } from 'react';
import { X, BookOpen, Zap, Shield, Play } from 'lucide-react';
import { sound } from '../utils/audio.js';

export function GameModeModal({ quiz, isOpen, onClose, onStart }) {
  const [selectedMode, setSelectedMode] = useState('classic');

  if (!isOpen) return null;

  const modes = [
    {
      id: 'classic',
      title: 'Classic Study',
      description: 'Relaxed pace with full explanations after every question. Perfect for deep comprehension.',
      icon: <BookOpen className="w-5 h-5 text-blue-500" />,
      tag: 'Untimed / Standard',
    },
    {
      id: 'sprint',
      title: 'Speed Sprint',
      description: '20 seconds per question with combo streak multipliers (up to 3x XP). Fast and exhilarating.',
      icon: <Zap className="w-5 h-5 text-amber-500" />,
      tag: '20s Timer · Combo Streaks',
    },
    {
      id: 'survival',
      title: 'Sudden Death Survival',
      description: 'You start with 3 lives. One mistake loses a heart. Can you reach the end undefeated?',
      icon: <Shield className="w-5 h-5 text-rose-500" />,
      tag: '3 Lives · Hardcore',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              {quiz.category} · {quiz.questions.length} Questions
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {quiz.title}
            </h2>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="py-5 space-y-3">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Select Game Challenge Mode:
          </label>

          <div className="space-y-2.5">
            {modes.map(mode => {
              const isSelected = selectedMode === mode.id;
              return (
                <div
                  key={mode.id}
                  onClick={() => {
                    sound.playClick();
                    setSelectedMode(mode.id);
                  }}
                  className={`flex items-start gap-3.5 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/30 ring-1 ring-blue-500/30'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/50'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                    {mode.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {mode.title}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        {mode.tag}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      {mode.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action button */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onStart(quiz, selectedMode);
            }}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Launch Quiz</span>
          </button>
        </div>
      </div>
    </div>
  );
}
