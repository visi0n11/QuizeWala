import React from 'react';
import { Sparkles, Play, Search, Compass, BookOpen } from 'lucide-react';
import { sound } from '../utils/audio.js';

export function HeroSection({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  categories,
  onStartDailyQuiz,
  onOpenAiGenerator,
  totalQuizzesCount,
}) {
  return (
    <section className="relative overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-16 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Heading, Meta, CTAs */}
          <div className="lg:col-span-7 space-y-6">
            {/* Clean unboxed metadata with typographic separators */}
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="text-blue-600 dark:text-blue-400 font-semibold">MindSprint JavaScript Platform</span>
              <span aria-hidden="true">·</span>
              <span>Full-Stack Knowledge Engine</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{totalQuizzesCount} Curated Challenges</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15] text-balance">
              Sharpen your mind with curated quizzes &amp; adaptive challenges.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              Master JavaScript fundamentals, computer science, world history, and quantum physics through timed speed sprints, sudden-death survival, and instant AI-generated question decks.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  sound.playClick();
                  onStartDailyQuiz();
                }}
                className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-xl shadow-md shadow-blue-500/15 hover:shadow-lg transition-all cursor-pointer whitespace-nowrap"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Play Daily Brain Sprint</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onOpenAiGenerator();
                }}
                className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-all cursor-pointer whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Generate Custom AI Quiz</span>
              </button>
            </div>

            {/* Trust points */}
            <div className="flex flex-wrap items-center gap-6 pt-4 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-blue-500 shrink-0" />
                <span>3 Adaptive Game Modes</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>In-Depth Fact Explanations</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Verifiable Certificates</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Anchor Image */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-900 group">
              <img
                src="/src/assets/images/quiz_hero_banner_1793542768079.jpg"
                alt="MindSprint Interactive Knowledge Workspace"
                className="w-full h-[280px] sm:h-[340px] object-cover group-hover:scale-102 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent flex flex-col justify-end p-6">
                <div className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-1">
                  Featured Challenge Deck
                </div>
                <div className="text-lg font-bold text-white mb-1">
                  JavaScript Core &amp; Modern ES6+ Mastery
                </div>
                <div className="text-xs text-slate-300">
                  5 rigorous questions on event loop microtasks, lexical closures, prototypes, and async promises.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Category Filter Strip */}
        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Search bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by topic, keyword, or concept..."
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Interactive Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {categories.map(cat => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      sound.playClick();
                      onSelectCategory(cat);
                    }}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
