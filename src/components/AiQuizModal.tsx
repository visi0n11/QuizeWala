import React, { useState } from 'react';
import { X, Sparkles, Loader2, ArrowRight, BookOpen, AlertCircle, Check } from 'lucide-react';
import { Quiz, Difficulty } from '../types/quiz';
import { sound } from '../utils/audio';

interface AiQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuizGenerated: (quiz: Quiz, startImmediately: boolean) => void;
}

export const AiQuizModal: React.FC<AiQuizModalProps> = ({
  isOpen,
  onClose,
  onQuizGenerated,
}) => {
  const [topic, setTopic] = useState('');
  const [contextText, setContextText] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickTopics = [
    'Quantum Computing & Superposition',
    'Human Brain & Neuroplasticity',
    'The Roman Republic to Empire',
    'Modern Artificial Intelligence & LLMs',
    'Deep Sea Oceanography',
    'Renaissance Architecture & Philosophy',
  ];

  const handleGenerate = async (startImmediately: boolean) => {
    if (!topic.trim() && !contextText.trim()) {
      setError('Please provide a quiz topic or paste source text.');
      return;
    }

    setIsLoading(true);
    setError(null);
    sound.playClick();

    try {
      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          contextText: contextText.trim(),
          difficulty,
          count: questionCount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate quiz. Please check server.');
      }

      const data = await response.json();
      if (!data.quiz) {
        throw new Error('Invalid response structure from quiz generator.');
      }

      sound.playFanfare();
      onQuizGenerated(data.quiz, startImmediately);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error communicating with AI quiz service.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 my-6">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                AI Quiz Generator
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Powered by Gemini 3.8 Flash · Synthesize tests on any topic or text
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Input Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Topic or Subject:
            </label>
            <input
              type="text"
              placeholder="e.g., Photosynthesis & Cellular Respiration"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Quick topic buttons */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
              Or pick an intellectual topic:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickTopics.map((item, i) => (
                <button
                  key={i}
                  type="button"
                  disabled={isLoading}
                  onClick={() => {
                    sound.playClick();
                    setTopic(item);
                  }}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Optional context text / notes paste */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Paste Custom Notes or Article Content (Optional):
            </label>
            <textarea
              rows={3}
              placeholder="Paste syllabus summary, textbook excerpts, or meeting takeaways to generate questions directly from your material..."
              value={contextText}
              onChange={e => setContextText(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
            />
          </div>

          {/* Difficulty & Count */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Difficulty:
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
                {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map(d => (
                  <button
                    key={d}
                    type="button"
                    disabled={isLoading}
                    onClick={() => {
                      sound.playClick();
                      setDifficulty(d);
                    }}
                    className={`py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      difficulty === d
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Questions Count:
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
                {[5, 8, 10].map(count => (
                  <button
                    key={count}
                    type="button"
                    disabled={isLoading}
                    onClick={() => {
                      sound.playClick();
                      setQuestionCount(count);
                    }}
                    className={`py-1.5 text-xs font-semibold rounded-lg font-mono transition-colors cursor-pointer ${
                      questionCount === count
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {count} Qs
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Loading state indicator */}
        {isLoading && (
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
            <div className="text-xs">
              <span className="font-bold text-slate-900 dark:text-white block">
                Synthesizing Pedagogical Deck...
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                Generating distinct choices, verified keys, and conceptual explanations.
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleGenerate(false)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            <BookOpen className="w-4 h-4" />
            <span>Save to Catalog</span>
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleGenerate(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate &amp; Play Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
