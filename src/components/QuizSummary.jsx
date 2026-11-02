import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Award,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  XCircle,
  Flame,
  Clock,
  ArrowRight,
  FileBadge,
  Sparkles,
} from 'lucide-react';
import { sound } from '../utils/audio.js';

export function QuizSummary({
  quiz,
  attempt,
  newBadges,
  onPlayAgain,
  onRetakeMissed,
  onOpenCertificate,
  onBackToCatalog,
}) {
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (attempt.accuracy >= 60) {
      sound.playFanfare();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [attempt.accuracy]);

  const missedQuestions = quiz.questions.filter(
    q => attempt.userAnswers[q.id] !== q.correctIndex
  );

  const getTier = accuracy => {
    if (accuracy >= 90) return { label: 'Grandmaster', color: 'text-amber-500' };
    if (accuracy >= 70) return { label: 'Scholar', color: 'text-blue-500' };
    if (accuracy >= 50) return { label: 'Adventurer', color: 'text-emerald-500' };
    return { label: 'Apprentice', color: 'text-slate-500' };
  };

  const tier = getTier(attempt.accuracy);
  const displayedQuestions = filter === 'wrong' ? missedQuestions : quiz.questions;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 sm:py-14 space-y-8 animate-fade-in">
      {/* Hero Score Box */}
      <div className="relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 sm:p-10 shadow-xl overflow-hidden text-center space-y-6">
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>{quiz.title}</span>
            <span aria-hidden="true">·</span>
            <span className="capitalize">{attempt.gameMode} Mode</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Quiz Completed!
          </h1>
          <p className="text-sm font-semibold tracking-wide uppercase">
            Performance Tier: <span className={tier.color}>{tier.label}</span>
          </p>
        </div>

        {/* Score Radial Metric */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 py-4">
          <div className="flex flex-col items-center">
            <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-blue-600 dark:text-blue-400 tabular-nums">
              {attempt.accuracy}%
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
              Final Accuracy
            </span>
          </div>

          <div className="h-12 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 text-left">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 font-medium block">Questions</span>
              <span className="text-base font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                {attempt.correctCount} / {attempt.totalQuestions}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-500" /> Max Streak
              </span>
              <span className="text-base font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                {attempt.maxCombo}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3 text-blue-500" /> Time Spent
              </span>
              <span className="text-base font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                {attempt.timeSpentSeconds}s
              </span>
            </div>
          </div>
        </div>

        {/* XP & Badges announcement */}
        <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 flex flex-wrap items-center justify-between gap-4 max-w-xl mx-auto">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-blue-800 dark:text-blue-300 block">
                Knowledge Rewards
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                +{attempt.xpEarned} XP Earned
              </span>
            </div>
          </div>

          {newBadges.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800">
              <Sparkles className="w-4 h-4" />
              <span>{newBadges.length} New Badge Unlocked!</span>
            </div>
          )}
        </div>

        {/* Primary Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onOpenCertificate();
            }}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-xl shadow-md transition-all cursor-pointer"
          >
            <FileBadge className="w-4 h-4" />
            <span>Generate Official Certificate</span>
          </button>

          {missedQuestions.length > 0 && (
            <button
              onClick={() => {
                sound.playClick();
                onRetakeMissed(missedQuestions);
              }}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Missed Questions ({missedQuestions.length})</span>
            </button>
          )}

          <button
            onClick={() => {
              sound.playClick();
              onPlayAgain();
            }}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>Play Quiz Again</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onBackToCatalog();
            }}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <span>Back to Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Comprehensive Pedagogical Review Breakdown */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Detailed Question Breakdown
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review correct answers, your chosen choices, and verified explanatory notes.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
            <button
              onClick={() => {
                sound.playClick();
                setFilter('all');
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Questions ({quiz.questions.length})
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setFilter('wrong');
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filter === 'wrong'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Missed Only ({missedQuestions.length})
            </button>
          </div>
        </div>

        {displayedQuestions.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-semibold text-sm">Flawless execution! No missed questions to display.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedQuestions.map((q, idx) => {
              const userAnswerIndex = attempt.userAnswers[q.id];
              const isCorrect = userAnswerIndex === q.correctIndex;
              const isTimedOutOrSkipped = userAnswerIndex === -1 || userAnswerIndex === undefined;

              return (
                <div
                  key={q.id}
                  className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          isCorrect
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {isCorrect ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <span className="text-xs font-mono font-semibold text-slate-400 block mb-1">
                          Question #{idx + 1}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug whitespace-pre-line">
                          {q.question}
                        </h3>
                      </div>
                    </div>

                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-md shrink-0 ${
                        isCorrect
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isCorrect ? 'Correct' : isTimedOutOrSkipped ? 'Timed Out / Skipped' : 'Incorrect'}
                    </span>
                  </div>

                  {/* Options status */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs">
                    {q.options.map((opt, optIdx) => {
                      const isOptionCorrect = optIdx === q.correctIndex;
                      const isOptionChosen = optIdx === userAnswerIndex;

                      let style =
                        'border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400';

                      if (isOptionCorrect) {
                        style =
                          'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold';
                      } else if (isOptionChosen && !isCorrect) {
                        style =
                          'border-rose-300 dark:border-rose-800/80 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 font-semibold';
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${style}`}
                        >
                          <span className="truncate">{opt}</span>
                          {isOptionCorrect && (
                            <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                              Verified Answer
                            </span>
                          )}
                          {isOptionChosen && !isCorrect && (
                            <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 shrink-0">
                              Your Choice
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Pedagogical Explanation */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                      Why this matters:
                    </span>
                    {q.explanation}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
