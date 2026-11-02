import React, { useState } from 'react';
import { X, Printer, Award, ShieldCheck } from 'lucide-react';
import { sound } from '../utils/audio.js';

export function CertificateModal({
  quiz,
  attempt,
  defaultName,
  isOpen,
  onClose,
}) {
  const [recipientName, setRecipientName] = useState(defaultName || 'Knowledge Scholar');

  if (!isOpen) return null;

  const handlePrint = () => {
    sound.playClick();
    window.print();
  };

  const certificateId = `CERT-${attempt.id.slice(-6).toUpperCase()}-${Math.floor(attempt.timestamp % 10000)}`;
  const dateFormatted = new Date(attempt.timestamp).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 my-8">
        {/* Controls */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 print:hidden">
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Certificate Name:
            </label>
            <input
              type="text"
              value={recipientName}
              onChange={e => setRecipientName(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your Full Name"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
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

        {/* Printable Certificate Frame */}
        <div
          id="printable-certificate"
          className="relative rounded-2xl border-8 border-double border-amber-600/40 p-8 sm:p-12 bg-gradient-to-b from-amber-50/40 via-white to-amber-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 text-center space-y-6 shadow-inner"
        >
          {/* Top Seal */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-white flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900">
              <Award className="w-8 h-8" />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-[0.3em] text-amber-700 dark:text-amber-400 font-bold block">
              MindSprint Assessment Academy
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white uppercase font-serif">
              Certificate of Achievement
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              This verifiable credential certifies the successful completion and mastery of
            </p>
          </div>

          <div className="py-2">
            <h3 className="text-2xl sm:text-3xl font-serif italic text-blue-700 dark:text-blue-400 underline decoration-amber-400/60 underline-offset-8">
              {recipientName || 'Valued Scholar'}
            </h3>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
            having demonstrated exceptional rigor and intellect in the academic subject examination:{' '}
            <strong className="text-slate-900 dark:text-white font-semibold block mt-1">
              {quiz.title}
            </strong>
          </p>

          {/* Certificate Stats Matrix */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto pt-4 border-t border-b border-amber-200/80 dark:border-amber-900/40 py-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Score</span>
              <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {attempt.accuracy}%
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Mode</span>
              <span className="text-base font-bold capitalize text-slate-700 dark:text-slate-300">
                {attempt.gameMode}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Questions</span>
              <span className="text-base font-bold font-mono text-slate-700 dark:text-slate-300">
                {attempt.correctCount}/{attempt.totalQuestions}
              </span>
            </div>
          </div>

          {/* Footer signatures & verification id */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500 dark:text-slate-400">
            <div className="text-left space-y-1">
              <span className="font-mono text-[10px] uppercase block">Issued On: {dateFormatted}</span>
              <span className="font-mono text-[10px] text-slate-400 block flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                <span>Verify ID: {certificateId}</span>
              </span>
            </div>

            <div className="text-center sm:text-right space-y-1">
              <div className="w-36 h-0.5 bg-slate-300 dark:bg-slate-700 mx-auto sm:ml-auto" />
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
                Academic Registrar
              </span>
              <span className="text-[10px] text-slate-400 block">MindSprint Learning Platform</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
