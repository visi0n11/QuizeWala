import React, { useState } from 'react';
import {
  Award,
  Flame,
  Target,
  Zap,
  Shield,
  Cpu,
  Sparkles,
  Compass,
  CheckCircle,
  BookOpen,
  Edit2,
  Check,
} from 'lucide-react';
import { BADGE_DEFINITIONS, saveProfile } from '../utils/storage.js';
import { sound } from '../utils/audio.js';

export function StatsView({
  profile,
  onUpdateProfile,
  onStartQuiz,
}) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile.name);

  const xpCurrentLevel = profile.xp % 250;
  const levelProgressPercent = Math.min(100, Math.round((xpCurrentLevel / 250) * 100));

  const totalAttempts = profile.attempts.length;
  const avgAccuracy =
    totalAttempts > 0
      ? Math.round(
          profile.attempts.reduce((acc, curr) => acc + curr.accuracy, 0) /
            totalAttempts
        )
      : 0;

  const highestCombo =
    totalAttempts > 0
      ? Math.max(...profile.attempts.map(a => a.maxCombo || 0))
      : 0;

  const handleSaveName = () => {
    sound.playClick();
    const updated = { ...profile, name: nameInput.trim() || 'Knowledge Scholar' };
    saveProfile(updated);
    onUpdateProfile(updated);
    setIsEditingName(false);
  };

  const getBadgeIcon = iconName => {
    switch (iconName) {
      case 'Compass':
        return <Compass className="w-5 h-5" />;
      case 'Target':
        return <Target className="w-5 h-5" />;
      case 'Zap':
        return <Zap className="w-5 h-5" />;
      case 'Shield':
        return <Shield className="w-5 h-5" />;
      case 'Flame':
        return <Flame className="w-5 h-5" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fade-in">
      {/* Profile Header & XP Progress */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-md">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    className="px-2.5 py-1 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1 rounded-md bg-blue-600 text-white cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    {profile.name}
                  </h1>
                  <button
                    onClick={() => {
                      sound.playClick();
                      setIsEditingName(true);
                    }}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                    title="Edit Name"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span>Level {profile.level} Scholar</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">
                {profile.xp} Total XP
              </span>
              <span aria-hidden="true">·</span>
              <span>{profile.streakDays} Day Streak</span>
            </div>
          </div>
        </div>

        {/* Level Progress Bar */}
        <div className="w-full md:w-72 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-600 dark:text-slate-300">
              Level {profile.level} Progress
            </span>
            <span className="font-mono text-slate-400">
              {xpCurrentLevel} / 250 XP
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${levelProgressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* KPI Matrix Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <BookOpen className="w-4 h-4 text-blue-500" />
            <span>Quizzes Completed</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
            {totalAttempts}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Target className="w-4 h-4 text-emerald-500" />
            <span>Average Accuracy</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
            {avgAccuracy}%
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Highest Combo Streak</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-600 dark:text-amber-400 tabular-nums">
            {highestCombo}x
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Award className="w-4 h-4 text-purple-500" />
            <span>Badges Unlocked</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-purple-600 dark:text-purple-400 tabular-nums">
            {profile.badges.length} / {BADGE_DEFINITIONS.length}
          </div>
        </div>
      </div>

      {/* Badges Shelf */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Knowledge Badges &amp; Trophies
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Achievements earned by mastering JavaScript concepts, streaks, and survival runs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {BADGE_DEFINITIONS.map(badge => {
            const isUnlocked = profile.badges.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                  isUnlocked
                    ? 'bg-white dark:bg-slate-900 border-amber-300 dark:border-amber-900/60 shadow-sm'
                    : 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200/80 dark:border-slate-800/80 opacity-60'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                    isUnlocked
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {getBadgeIcon(badge.icon)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {badge.title}
                    </span>
                    {isUnlocked && (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    {badge.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Attempts Log */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Past Quiz Attempts Log
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            A chronological timeline of your recent tests and assessments.
          </p>
        </div>

        {profile.attempts.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              No quiz attempts recorded yet.
            </p>
            <button
              onClick={() => {
                sound.playClick();
                onStartQuiz();
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer"
            >
              Start First Quiz
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Quiz Title</th>
                    <th className="py-3 px-4">Mode</th>
                    <th className="py-3 px-4">Accuracy</th>
                    <th className="py-3 px-4">Questions</th>
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {profile.attempts.map(att => (
                    <tr
                      key={att.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {att.quizTitle}
                      </td>
                      <td className="py-3 px-4 capitalize font-medium text-slate-600 dark:text-slate-300">
                        {att.gameMode}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-mono font-bold ${
                            att.accuracy >= 80
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : att.accuracy >= 50
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {att.accuracy}%
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                        {att.correctCount} / {att.totalQuestions}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">
                        {att.timeSpentSeconds}s
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(att.timestamp).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
