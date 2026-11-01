import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { QuizCard } from './components/QuizCard';
import { GameModeModal } from './components/GameModeModal';
import { ActiveQuiz } from './components/ActiveQuiz';
import { QuizSummary } from './components/QuizSummary';
import { CertificateModal } from './components/CertificateModal';
import { AiQuizModal } from './components/AiQuizModal';
import { QuizCreatorModal } from './components/QuizCreatorModal';
import { StatsView } from './components/StatsView';

import { Quiz, GameMode, QuizAttempt, UserProfile } from './types/quiz';
import { PREBUILT_QUIZZES } from './data/prebuiltQuizzes';
import {
  getStoredProfile,
  saveProfile,
  recordQuizAttempt,
  getCustomQuizzes,
  saveCustomQuiz,
  deleteCustomQuiz,
} from './utils/storage';
import { sound } from './utils/audio';

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(getStoredProfile);
  const [customQuizzes, setCustomQuizzes] = useState<Quiz[]>(getCustomQuizzes);

  // Views & navigation
  const [currentView, setCurrentView] = useState<'catalog' | 'stats'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Active quiz session states
  const [selectedQuizForMode, setSelectedQuizForMode] = useState<Quiz | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [activeMode, setActiveMode] = useState<GameMode>('classic');
  const [completedAttempt, setCompletedAttempt] = useState<QuizAttempt | null>(null);
  const [newBadges, setNewBadges] = useState<string[]>([]);

  // Modals
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Sync dark mode class on document
  useEffect(() => {
    if (profile.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [profile.darkMode]);

  // Sync sound setting
  useEffect(() => {
    sound.enabled = profile.soundEnabled;
  }, [profile.soundEnabled]);

  const toggleDarkMode = () => {
    sound.playClick();
    const updated = { ...profile, darkMode: !profile.darkMode };
    setProfile(updated);
    saveProfile(updated);
  };

  const toggleSound = () => {
    sound.playClick();
    const updated = { ...profile, soundEnabled: !profile.soundEnabled };
    setProfile(updated);
    saveProfile(updated);
  };

  // Combine prebuilt and user-created quizzes
  const allQuizzes = useMemo(() => {
    return [...customQuizzes, ...PREBUILT_QUIZZES];
  }, [customQuizzes]);

  // Unique categories for filtering
  const categories = useMemo(() => {
    const set = new Set<string>();
    set.add('All');
    allQuizzes.forEach(q => set.add(q.category));
    return Array.from(set);
  }, [allQuizzes]);

  // Filtered quizzes
  const filteredQuizzes = useMemo(() => {
    return allQuizzes.filter(quiz => {
      const matchesCategory =
        selectedCategory === 'All' ||
        quiz.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch =
        searchQuery.trim() === '' ||
        quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [allQuizzes, selectedCategory, searchQuery]);

  // Launch modal to select mode
  const handleSelectQuiz = (quiz: Quiz) => {
    setSelectedQuizForMode(quiz);
  };

  // Start quiz in chosen mode
  const handleStartGame = (quiz: Quiz, mode: GameMode) => {
    setSelectedQuizForMode(null);
    setCompletedAttempt(null);
    setActiveQuiz(quiz);
    setActiveMode(mode);
  };

  // Quick Daily Challenge launch
  const handleStartDailyChallenge = () => {
    const dailyQuiz = allQuizzes.find(q => q.id === 'quiz-daily-brain-sprint') || allQuizzes[0];
    handleStartGame(dailyQuiz, 'sprint');
  };

  // Finish quiz callback
  const handleFinishQuiz = (attempt: QuizAttempt) => {
    const { updatedProfile, newlyEarnedBadges } = recordQuizAttempt(attempt);
    setProfile(updatedProfile);
    setNewBadges(newlyEarnedBadges);
    setCompletedAttempt(attempt);
  };

  // Retake missed questions drill
  const handleRetakeMissed = (missedQuestions: Quiz['questions']) => {
    if (!activeQuiz) return;
    const reviewQuiz: Quiz = {
      ...activeQuiz,
      id: `review-${activeQuiz.id}-${Date.now()}`,
      title: `Review Drill: ${activeQuiz.title}`,
      description: `Focused review deck targeting the ${missedQuestions.length} missed concepts.`,
      questions: missedQuestions,
      isCustom: true,
    };
    handleStartGame(reviewQuiz, 'classic');
  };

  // Custom Quiz Created
  const handleSaveCustomQuiz = (quiz: Quiz, startImmediately: boolean) => {
    saveCustomQuiz(quiz);
    setCustomQuizzes(getCustomQuizzes());
    if (startImmediately) {
      handleStartGame(quiz, 'classic');
    }
  };

  // Delete Custom Quiz
  const handleDeleteCustomQuiz = (quizId: string) => {
    deleteCustomQuiz(quizId);
    setCustomQuizzes(getCustomQuizzes());
  };

  // Return to Catalog
  const handleBackToCatalog = () => {
    setActiveQuiz(null);
    setCompletedAttempt(null);
    setCurrentView('catalog');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors selection:bg-blue-600 selection:text-white">
      {/* If active in a quiz and NOT finished, render ActiveQuiz full screen */}
      {activeQuiz && !completedAttempt && (
        <ActiveQuiz
          quiz={activeQuiz}
          mode={activeMode}
          onFinish={handleFinishQuiz}
          onExit={handleBackToCatalog}
          soundEnabled={profile.soundEnabled}
          onToggleSound={toggleSound}
        />
      )}

      {/* If quiz is completed, show summary breakdown */}
      {activeQuiz && completedAttempt && (
        <>
          <Navbar
            currentView={currentView}
            onNavigate={setCurrentView}
            userXp={profile.xp}
            userLevel={profile.level}
            soundEnabled={profile.soundEnabled}
            onToggleSound={toggleSound}
            darkMode={profile.darkMode}
            onToggleDarkMode={toggleDarkMode}
            onOpenAiModal={() => setShowAiModal(true)}
            onOpenCreateModal={() => setShowCreateModal(true)}
          />
          <QuizSummary
            quiz={activeQuiz}
            attempt={completedAttempt}
            newBadges={newBadges}
            onPlayAgain={() => handleStartGame(activeQuiz, activeMode)}
            onRetakeMissed={handleRetakeMissed}
            onOpenCertificate={() => setShowCertificateModal(true)}
            onBackToCatalog={handleBackToCatalog}
          />
        </>
      )}

      {/* Main Browse / Stats View */}
      {!activeQuiz && (
        <>
          <Navbar
            currentView={currentView}
            onNavigate={setCurrentView}
            userXp={profile.xp}
            userLevel={profile.level}
            soundEnabled={profile.soundEnabled}
            onToggleSound={toggleSound}
            darkMode={profile.darkMode}
            onToggleDarkMode={toggleDarkMode}
            onOpenAiModal={() => setShowAiModal(true)}
            onOpenCreateModal={() => setShowCreateModal(true)}
          />

          {currentView === 'catalog' && (
            <main className="flex-1 pb-16">
              <HeroSection
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                categories={categories}
                onStartDailyQuiz={handleStartDailyChallenge}
                onOpenAiGenerator={() => setShowAiModal(true)}
                totalQuizzesCount={allQuizzes.length}
              />

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
                <div className="flex items-center justify-between pb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      {selectedCategory === 'All' ? 'All Knowledge Quizzes' : `${selectedCategory} Quizzes`}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Showing {filteredQuizzes.length} available challenges
                    </p>
                  </div>
                </div>

                {filteredQuizzes.length === 0 ? (
                  <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
                    <p className="text-base font-semibold text-slate-600 dark:text-slate-300">
                      No quizzes found matching "{searchQuery}".
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('All');
                      }}
                      className="px-4 py-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      Clear search filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredQuizzes.map(quiz => (
                      <QuizCard
                        key={quiz.id}
                        quiz={quiz}
                        onSelect={handleSelectQuiz}
                        onDeleteCustom={quiz.isCustom ? handleDeleteCustomQuiz : undefined}
                      />
                    ))}
                  </div>
                )}
              </div>
            </main>
          )}

          {currentView === 'stats' && (
            <main className="flex-1 pb-16">
              <StatsView
                profile={profile}
                onUpdateProfile={setProfile}
                onStartQuiz={() => setCurrentView('catalog')}
              />
            </main>
          )}

          {/* Footer */}
          <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-8 text-center text-xs text-slate-500 dark:text-slate-400">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 dark:text-slate-200">MindSprint</span>
                <span aria-hidden="true">·</span>
                <span>Interactive Knowledge &amp; Trivia Arena</span>
              </div>
              <div className="flex items-center gap-4">
                <span>Adaptive Learning</span>
                <span aria-hidden="true">·</span>
                <span>AI-Grounding Deck Generation</span>
                <span aria-hidden="true">·</span>
                <span>Verified Credentials</span>
              </div>
            </div>
          </footer>
        </>
      )}

      {/* Game Mode Selection Modal */}
      {selectedQuizForMode && (
        <GameModeModal
          quiz={selectedQuizForMode}
          isOpen={true}
          onClose={() => setSelectedQuizForMode(null)}
          onStart={handleStartGame}
        />
      )}

      {/* AI Quiz Generator Modal */}
      <AiQuizModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        onQuizGenerated={handleSaveCustomQuiz}
      />

      {/* Custom Quiz Authoring Studio Modal */}
      <QuizCreatorModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSaveQuiz={handleSaveCustomQuiz}
      />

      {/* Verifiable Certificate Modal */}
      {completedAttempt && activeQuiz && (
        <CertificateModal
          quiz={activeQuiz}
          attempt={completedAttempt}
          defaultName={profile.name}
          isOpen={showCertificateModal}
          onClose={() => setShowCertificateModal(false)}
        />
      )}
    </div>
  );
}
