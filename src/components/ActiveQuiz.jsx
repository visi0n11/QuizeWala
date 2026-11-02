import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Timer,
  Heart,
  Flame,
  Lightbulb,
  Scissors,
  Hourglass,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Flag,
  ArrowLeft,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { sound } from '../utils/audio.js';

export function ActiveQuiz({
  quiz,
  mode,
  onFinish,
  onExit,
  soundEnabled,
  onToggleSound,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [eliminatedOptions, setEliminatedOptions] = useState({});
  const [revealedHints, setRevealedHints] = useState({});
  const [bookmarkedIds, setBookmarkedIds] = useState([]);

  // Lifelines
  const [hasUsedFiftyFifty, setHasUsedFiftyFifty] = useState(false);
  const [hasUsedHint, setHasUsedHint] = useState(false);
  const [hasUsedFreeze, setHasUsedFreeze] = useState(false);

  // Stats & game mechanics
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [lives, setLives] = useState(mode === 'survival' ? 3 : 1);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  // Drawer
  const [showDrawer, setShowDrawer] = useState(false);

  // Timer
  const startTimeRef = useRef(Date.now());
  const initialTimeForMode = mode === 'sprint' ? 20 : mode === 'survival' ? 25 : 60;
  const [timeRemaining, setTimeRemaining] = useState(initialTimeForMode);

  const currentQuestion = quiz.questions[currentIndex];
  const isLastQuestion = currentIndex === quiz.questions.length - 1;

  const finalizeQuiz = useCallback(
    (finalAnswers, finalCorrect, finalWrong, finalScore, finalMaxCombo) => {
      const timeSpentSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
      const total = quiz.questions.length;
      const accuracy = total > 0 ? Math.round((finalCorrect / total) * 100) : 0;
      const xpEarned = Math.round(finalScore / 5) + finalCorrect * 20 + (mode === 'sprint' ? 50 : 0);

      const attempt = {
        id: `attempt-${Date.now()}`,
        quizId: quiz.id,
        quizTitle: quiz.title,
        category: quiz.category,
        gameMode: mode,
        score: finalScore,
        totalQuestions: total,
        correctCount: finalCorrect,
        wrongCount: finalWrong,
        accuracy: accuracy,
        timeSpentSeconds: timeSpentSeconds,
        maxCombo: finalMaxCombo,
        xpEarned: xpEarned,
        timestamp: Date.now(),
        userAnswers: finalAnswers,
      };

      onFinish(attempt);
    },
    [quiz, mode, onFinish]
  );

  const handleTimeOut = useCallback(() => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedOption(-1);
    sound.playWrong();

    const newAnswers = { ...userAnswers, [currentQuestion.id]: -1 };
    setUserAnswers(newAnswers);
    setWrongCount(w => w + 1);
    setCombo(0);

    if (mode === 'survival') {
      const remainingLives = lives - 1;
      setLives(remainingLives);
      if (remainingLives <= 0) {
        setTimeout(() => {
          finalizeQuiz(newAnswers, correctCount, wrongCount + 1, score, maxCombo);
        }, 1200);
      }
    }
  }, [isAnswered, userAnswers, currentQuestion.id, mode, lives, finalizeQuiz, correctCount, wrongCount, score, maxCombo]);

  useEffect(() => {
    if (isAnswered) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeOut();
          return 0;
        }
        if (prev <= 4) {
          sound.playClick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIndex, isAnswered, handleTimeOut]);

  const handleSelectOption = index => {
    if (isAnswered) return;
    const isEliminated = (eliminatedOptions[currentQuestion.id] || []).includes(index);
    if (isEliminated) return;

    setSelectedOption(index);
    setIsAnswered(true);

    const isAnswerCorrect = index === currentQuestion.correctIndex;
    const newAnswers = { ...userAnswers, [currentQuestion.id]: index };
    setUserAnswers(newAnswers);

    if (isAnswerCorrect) {
      sound.playCorrect();
      const newCombo = combo + 1;
      const newMaxCombo = Math.max(maxCombo, newCombo);
      setCombo(newCombo);
      setMaxCombo(newMaxCombo);

      if (newCombo >= 3) {
        sound.playStreak(newCombo);
      }

      const multiplier = newCombo >= 5 ? 2.5 : newCombo >= 3 ? 1.8 : 1.0;
      const pointsAdded = Math.round((100 + timeRemaining * 5) * multiplier);
      setScore(s => s + pointsAdded);
      setCorrectCount(c => c + 1);
    } else {
      sound.playWrong();
      setCombo(0);
      setWrongCount(w => w + 1);

      if (mode === 'survival') {
        const remainingLives = lives - 1;
        setLives(remainingLives);
        if (remainingLives <= 0) {
          setTimeout(() => {
            finalizeQuiz(newAnswers, correctCount, wrongCount + 1, score, maxCombo);
          }, 1400);
          return;
        }
      }
    }
  };

  const handleNext = useCallback(() => {
    sound.playClick();
    if (isLastQuestion) {
      finalizeQuiz(userAnswers, correctCount, wrongCount, score, maxCombo);
    } else {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeRemaining(initialTimeForMode);
    }
  }, [isLastQuestion, finalizeQuiz, userAnswers, correctCount, wrongCount, score, maxCombo, initialTimeForMode]);

  const handleFiftyFifty = () => {
    if (hasUsedFiftyFifty || isAnswered) return;
    sound.playLifeline();
    setHasUsedFiftyFifty(true);

    const wrongIndices = [0, 1, 2, 3].filter(idx => idx !== currentQuestion.correctIndex);
    const shuffled = wrongIndices.sort(() => 0.5 - Math.random());
    const toEliminate = shuffled.slice(0, 2);

    setEliminatedOptions(prev => ({
      ...prev,
      [currentQuestion.id]: toEliminate,
    }));
  };

  const handleRevealHint = () => {
    if (hasUsedHint || isAnswered || !currentQuestion.hint) return;
    sound.playLifeline();
    setHasUsedHint(true);
    setRevealedHints(prev => ({
      ...prev,
      [currentQuestion.id]: true,
    }));
  };

  const handleFreezeTime = () => {
    if (hasUsedFreeze || isAnswered) return;
    sound.playLifeline();
    setHasUsedFreeze(true);
    setTimeRemaining(prev => prev + 15);
  };

  const toggleBookmark = qId => {
    sound.playClick();
    setBookmarkedIds(prev =>
      prev.includes(qId) ? prev.filter(id => id !== qId) : [...prev, qId]
    );
  };

  useEffect(() => {
    const handleKeyDown = e => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (!isAnswered) {
        if (['1', '2', '3', '4'].includes(e.key)) {
          const index = parseInt(e.key, 10) - 1;
          if (index >= 0 && index < currentQuestion.options.length) {
            handleSelectOption(index);
          }
        }
      } else {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, currentQuestion, handleNext]);

  const isCurrentBookmarked = bookmarkedIds.includes(currentQuestion.id);
  const currentEliminated = eliminatedOptions[currentQuestion.id] || [];
  const isHintActive = revealedHints[currentQuestion.id];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors">
      {/* Top HUD Bar */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => {
                if (confirm('Leave current quiz in progress? Your session will be lost.')) {
                  onExit();
                }
              }}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Exit Quiz"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="truncate">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block truncate">
                {quiz.title}
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Question {currentIndex + 1} of {quiz.questions.length}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {mode === 'survival' && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400">
                <Heart className="w-4 h-4 fill-current animate-pulse" />
                <span className="text-xs font-bold tabular-nums">{lives}</span>
              </div>
            )}

            {combo >= 2 && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-amber-600 dark:text-amber-400 animate-bounce">
                <Flame className="w-4 h-4 fill-current" />
                <span className="text-xs font-extrabold tabular-nums">
                  {combo >= 5 ? 'x2.5' : combo >= 3 ? 'x1.8' : 'x1.5'}
                </span>
              </div>
            )}

            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-bold font-mono tabular-nums transition-colors ${
                timeRemaining <= 5
                  ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-700 text-rose-600 dark:text-rose-400 animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Timer className="w-3.5 h-3.5" />
              <span>{timeRemaining}s</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Score</span>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400 font-mono tabular-nums">
                {score}
              </span>
            </div>

            <button
              onClick={() => toggleBookmark(currentQuestion.id)}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                isCurrentBookmarked
                  ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={isCurrentBookmarked ? 'Remove question bookmark' : 'Bookmark question for review'}
            >
              {isCurrentBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setShowDrawer(prev => !prev)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Question grid drawer"
            >
              <Flag className="w-4 h-4" />
            </button>

            <button
              onClick={onToggleSound}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / quiz.questions.length) * 100}%` }}
          />
        </div>
      </header>

      {/* Main Question Stage */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 flex flex-col justify-between">
        <div className="space-y-6">
          {/* Lifelines */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 text-xs">
            <span className="font-semibold text-slate-500 dark:text-slate-400">Available Lifelines:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleFiftyFifty}
                disabled={hasUsedFiftyFifty || isAnswered}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  hasUsedFiftyFifty
                    ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
                title="50:50 removes two incorrect options"
              >
                <Scissors className="w-3.5 h-3.5 text-blue-500" />
                <span>50:50</span>
              </button>

              <button
                onClick={handleRevealHint}
                disabled={hasUsedHint || isAnswered || !currentQuestion.hint}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  hasUsedHint || !currentQuestion.hint
                    ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
                title="Pedagogical hint"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>Hint</span>
              </button>

              <button
                onClick={handleFreezeTime}
                disabled={hasUsedFreeze || isAnswered}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  hasUsedFreeze
                    ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
                title="+15 seconds time boost"
              >
                <Hourglass className="w-3.5 h-3.5 text-emerald-500" />
                <span>+15s</span>
              </button>
            </div>
          </div>

          {isHintActive && currentQuestion.hint && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 flex items-start gap-3 animate-fade-in">
              <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <span className="font-bold block mb-0.5">Helpful Clue:</span>
                {currentQuestion.hint}
              </div>
            </div>
          )}

          {/* Question Text */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              {quiz.category} · Question #{currentIndex + 1}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug whitespace-pre-line">
              {currentQuestion.question}
            </h2>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 gap-3 pt-2">
            {currentQuestion.options.map((option, idx) => {
              const isEliminated = currentEliminated.includes(idx);
              const isChosen = selectedOption === idx;
              const isCorrect = idx === currentQuestion.correctIndex;

              let cardStyle =
                'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-600 text-slate-900 dark:text-slate-100';

              if (isEliminated) {
                cardStyle =
                  'opacity-30 line-through cursor-not-allowed border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/40 text-slate-400';
              } else if (isAnswered) {
                if (isCorrect) {
                  cardStyle =
                    'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500/30';
                } else if (isChosen) {
                  cardStyle =
                    'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-950 dark:text-rose-100 ring-2 ring-rose-500/30';
                } else {
                  cardStyle = 'opacity-50 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400';
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswered || isEliminated}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border text-left font-medium transition-all cursor-pointer ${cardStyle}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-mono font-bold text-slate-600 dark:text-slate-300 shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-sm sm:text-base leading-snug break-words">{option}</span>
                  </div>

                  {isAnswered && (
                    <div className="shrink-0 ml-3">
                      {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                      {!isCorrect && isChosen && <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Box */}
          {isAnswered && (
            <div className="p-4 sm:p-5 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/70 dark:bg-blue-950/30 text-slate-800 dark:text-slate-200 space-y-2 animate-fade-in">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-300">
                <HelpCircle className="w-4 h-4" />
                <span>Pedagogical Explanation:</span>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed">{currentQuestion.explanation}</p>
            </div>
          )}
        </div>

        {/* Footer Next Button */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span>Keyboard shortcuts:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[11px]">1-4</kbd>
            <span>select</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[11px]">Space</kbd>
            <span>next</span>
          </div>

          {isAnswered && (
            <button
              onClick={handleNext}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              <span>{isLastQuestion ? 'Complete Quiz & View Results' : 'Next Question'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </main>

      {/* Slide-out Question Navigator Drawer */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 h-full p-6 flex flex-col shadow-2xl border-l border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Question Navigator</h3>
              <button
                onClick={() => setShowDrawer(false)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-2">
              {quiz.questions.map((q, idx) => {
                const answer = userAnswers[q.id];
                const isCurrent = idx === currentIndex;
                const isBookmarked = bookmarkedIds.includes(q.id);

                let statusText = 'Not answered';
                let dotColor = 'bg-slate-300 dark:bg-slate-700';

                if (answer !== undefined) {
                  if (answer === q.correctIndex) {
                    statusText = 'Correct';
                    dotColor = 'bg-emerald-500';
                  } else {
                    statusText = 'Incorrect';
                    dotColor = 'bg-rose-500';
                  }
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      sound.playClick();
                      setCurrentIndex(idx);
                      setSelectedOption(userAnswers[q.id] ?? null);
                      setIsAnswered(userAnswers[q.id] !== undefined);
                      setShowDrawer(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left text-xs transition-colors cursor-pointer ${
                      isCurrent
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className={`w-2.5 h-2.5 rounded-full ${dotColor} shrink-0`} />
                      <span className="font-bold text-slate-900 dark:text-white">#{idx + 1}</span>
                      <span className="truncate text-slate-600 dark:text-slate-400">{q.question}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isBookmarked && <Bookmark className="w-3.5 h-3.5 text-amber-500" />}
                      <span className="text-[11px] text-slate-400">{statusText}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 text-center">
              Click any question to inspect or review.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
