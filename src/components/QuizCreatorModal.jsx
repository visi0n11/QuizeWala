import React, { useState } from 'react';
import { X, Plus, Trash2, Download, Upload, Check, AlertCircle, Play } from 'lucide-react';
import { sound } from '../utils/audio.js';

export function QuizCreatorModal({
  isOpen,
  onClose,
  onSaveQuiz,
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('JavaScript');
  const [difficulty, setDifficulty] = useState('Medium');

  const [questions, setQuestions] = useState([
    {
      id: `q-custom-${Date.now()}-1`,
      question: '',
      options: ['', '', '', ''],
      correctIndex: 0,
      explanation: '',
      hint: '',
    },
  ]);

  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleAddQuestion = () => {
    sound.playClick();
    setQuestions(prev => [
      ...prev,
      {
        id: `q-custom-${Date.now()}-${prev.length + 1}`,
        question: '',
        options: ['', '', '', ''],
        correctIndex: 0,
        explanation: '',
        hint: '',
      },
    ]);
  };

  const handleRemoveQuestion = idx => {
    sound.playClick();
    if (questions.length <= 1) {
      setError('A quiz must contain at least 1 question.');
      return;
    }
    setQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  const updateQuestionText = (idx, text) => {
    setQuestions(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], question: text };
      return copy;
    });
  };

  const updateOptionText = (qIdx, optIdx, text) => {
    setQuestions(prev => {
      const copy = [...prev];
      const newOptions = [...copy[qIdx].options];
      newOptions[optIdx] = text;
      copy[qIdx] = { ...copy[qIdx], options: newOptions };
      return copy;
    });
  };

  const setCorrectOptionIndex = (qIdx, optIdx) => {
    sound.playClick();
    setQuestions(prev => {
      const copy = [...prev];
      copy[qIdx] = { ...copy[qIdx], correctIndex: optIdx };
      return copy;
    });
  };

  const updateExplanation = (qIdx, text) => {
    setQuestions(prev => {
      const copy = [...prev];
      copy[qIdx] = { ...copy[qIdx], explanation: text };
      return copy;
    });
  };

  const updateHint = (qIdx, text) => {
    setQuestions(prev => {
      const copy = [...prev];
      copy[qIdx] = { ...copy[qIdx], hint: text };
      return copy;
    });
  };

  const handleExportJSON = () => {
    sound.playClick();
    const exportData = {
      title: title || 'Custom Quiz',
      description,
      category,
      difficulty,
      questions,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(title || 'quiz').toLowerCase().replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = e => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const parsed = JSON.parse(event.target?.result);
        if (parsed.questions && Array.isArray(parsed.questions)) {
          setTitle(parsed.title || 'Imported Quiz');
          setDescription(parsed.description || '');
          setCategory(parsed.category || 'JavaScript');
          setDifficulty(parsed.difficulty || 'Medium');
          setQuestions(parsed.questions);
          setError(null);
          sound.playCorrect();
        } else {
          setError('Invalid JSON format: missing "questions" array.');
        }
      } catch {
        setError('Failed to parse uploaded JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const validateAndSave = startImmediately => {
    if (!title.trim()) {
      setError('Quiz Title is required.');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        setError(`Question #${i + 1} has no question prompt.`);
        return;
      }
      for (let j = 0; j < 4; j++) {
        if (!q.options[j] || !q.options[j].trim()) {
          setError(`Question #${i + 1} is missing Option ${j + 1}.`);
          return;
        }
      }
    }

    setError(null);
    sound.playFanfare();

    const newQuiz = {
      id: `custom-quiz-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || `Custom quiz with ${questions.length} questions.`,
      category: category.trim() || 'Custom',
      difficulty,
      estimatedMinutes: Math.max(1, Math.ceil(questions.length * 1.2)),
      questions,
      isCustom: true,
      author: 'You',
    };

    onSaveQuiz(newQuiz, startImmediately);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Quiz Authoring Studio
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Create custom questions, set pedagogical explanations, and export/import decks.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Export as JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Import</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </label>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Quiz Title: *
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g., JavaScript Closures & Event Loop"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category:
              </label>
              <input
                type="text"
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder="e.g. JavaScript, Science, Tech"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Brief Overview:
              </label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Short description of concepts tested in this quiz"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Difficulty:
              </label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Question List */}
          <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Questions ({questions.length})
              </h3>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>

            {questions.map((q, qIdx) => (
              <div
                key={q.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Question #{qIdx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(qIdx)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Delete question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <textarea
                    rows={2}
                    value={q.question}
                    onChange={e => updateQuestionText(qIdx, e.target.value)}
                    placeholder="Enter the question prompt (code snippets supported)..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 font-medium resize-none"
                  />
                </div>

                {/* 4 Options Grid */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400 block">
                    Answer Options (Select radio to set the correct answer):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {q.options.map((opt, optIdx) => {
                      const isCorrect = q.correctIndex === optIdx;
                      return (
                        <div
                          key={optIdx}
                          className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all ${
                            isCorrect
                              ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`correct-${q.id}`}
                            checked={isCorrect}
                            onChange={() => setCorrectOptionIndex(qIdx, optIdx)}
                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            title="Mark as correct answer"
                          />
                          <input
                            type="text"
                            value={opt}
                            onChange={e => updateOptionText(qIdx, optIdx, e.target.value)}
                            placeholder={`Option ${optIdx + 1}`}
                            className="flex-1 bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Explanation & Hint */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Fact Explanation (Pedagogical Note):
                    </label>
                    <input
                      type="text"
                      value={q.explanation}
                      onChange={e => updateExplanation(qIdx, e.target.value)}
                      placeholder="Why this answer is factually correct..."
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Optional Hint:
                    </label>
                    <input
                      type="text"
                      value={q.hint || ''}
                      onChange={e => updateHint(qIdx, e.target.value)}
                      placeholder="Subtle clue for students..."
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500">
            Total {questions.length} questions prepared.
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => validateAndSave(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save Quiz</span>
            </button>

            <button
              type="button"
              onClick={() => validateAndSave(true)}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Save &amp; Play Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
