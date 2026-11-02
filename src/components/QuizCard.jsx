import React from 'react';
import { Play, Clock, HelpCircle, Trash2, Atom, Cpu, Landmark, Globe, Palette, Zap, Sparkles, Code2 } from 'lucide-react';
import { sound } from '../utils/audio.js';

export function QuizCard({ quiz, onSelect, onDeleteCustom }) {
  const getCategoryIcon = category => {
    switch ((category || '').toLowerCase()) {
      case 'javascript':
        return <Code2 className="w-4 h-4 text-amber-500" />;
      case 'science':
        return <Atom className="w-4 h-4 text-sky-500" />;
      case 'technology':
        return <Cpu className="w-4 h-4 text-cyan-500" />;
      case 'history':
        return <Landmark className="w-4 h-4 text-amber-500" />;
      case 'geography':
        return <Globe className="w-4 h-4 text-emerald-500" />;
      case 'arts & culture':
        return <Palette className="w-4 h-4 text-pink-500" />;
      case 'daily challenge':
        return <Zap className="w-4 h-4 text-amber-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-purple-500" />;
    }
  };

  const getDifficultyBadge = difficulty => {
    switch ((difficulty || '').toLowerCase()) {
      case 'easy':
        return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/50';
      case 'medium':
        return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/50';
      case 'hard':
        return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/50';
      default:
        return 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="group relative flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-600/50 shadow-sm hover:shadow-md transition-all overflow-hidden">
      {/* Thumbnail or Fallback Artwork */}
      <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        {quiz.coverImage ? (
          <img
            src={quiz.coverImage}
            alt={quiz.title}
            className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
            referrerPolicy="no-referrer"
            onError={e => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 text-slate-400 dark:text-slate-500 p-6 text-center">
            {getCategoryIcon(quiz.category)}
            <span className="text-xs font-medium mt-2 text-slate-500 dark:text-slate-400">{quiz.category}</span>
          </div>
        )}

        {/* Top Floating Status tags */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950/75 backdrop-blur-md text-white text-[11px] font-medium">
            {getCategoryIcon(quiz.category)}
            <span>{quiz.category}</span>
          </div>

          <div className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getDifficultyBadge(quiz.difficulty)}`}>
            {quiz.difficulty}
          </div>
        </div>

        {/* Custom quiz delete option */}
        {quiz.isCustom && onDeleteCustom && (
          <button
            onClick={e => {
              e.stopPropagation();
              sound.playClick();
              if (confirm(`Delete custom quiz "${quiz.title}"?`)) {
                onDeleteCustom(quiz.id);
              }
            }}
            title="Delete this custom quiz"
            className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-slate-900/80 hover:bg-rose-600 text-white transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Body Content */}
      <div className="flex-1 p-5 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
            {quiz.title}
          </h3>
          <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {quiz.description}
          </p>
        </div>

        {/* Unboxed Metadata Strip */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span className="tabular-nums font-medium">{quiz.questions.length} questions</span>
          </div>
          <span aria-hidden="true">·</span>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="tabular-nums font-medium">~{quiz.estimatedMinutes} mins</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            sound.playClick();
            onSelect(quiz);
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-sm transition-all cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Start Challenge</span>
        </button>
      </div>
    </div>
  );
}
