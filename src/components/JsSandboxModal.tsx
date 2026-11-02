import React, { useState } from 'react';
import { X, Play, RotateCcw, Terminal, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

interface JsSandboxModalProps {
  initialCode?: string;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export const JsSandboxModal: React.FC<JsSandboxModalProps> = ({
  initialCode = `// Test any JavaScript expression or snippet
console.log("Hello from JavaScript Sandbox!");
console.log([] + []);
console.log(typeof NaN);
console.log([1, 2, 3].map(x => x * 2));
`,
  isOpen,
  onClose,
  title = 'Interactive JavaScript Sandbox',
}) => {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<string[]>([]);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRunCode = () => {
    sound.playClick();
    setError(null);
    const logs: string[] = [];

    const startTime = performance.now();

    try {
      // Create safe sandbox logging interceptor
      const customConsole = {
        log: (...args: any[]) => {
          const formatted = args
            .map(arg => {
              if (typeof arg === 'object' && arg !== null) {
                try {
                  return JSON.stringify(arg, null, 2);
                } catch {
                  return String(arg);
                }
              }
              if (typeof arg === 'string') {
                return `"${arg}"`;
              }
              return String(arg);
            })
            .join(' ');
          logs.push(formatted);
        },
        warn: (...args: any[]) => {
          logs.push(`[WARN] ${args.join(' ')}`);
        },
        error: (...args: any[]) => {
          logs.push(`[ERROR] ${args.join(' ')}`);
        },
        info: (...args: any[]) => {
          logs.push(`[INFO] ${args.join(' ')}`);
        },
      };

      // Execute in isolated function context
      const runner = new Function('console', code);
      const result = runner(customConsole);

      if (result !== undefined) {
        logs.push(`<- ${typeof result === 'object' ? JSON.stringify(result) : String(result)}`);
      }

      const elapsed = Math.round((performance.now() - startTime) * 100) / 100;
      setExecutionTime(elapsed);
      setOutput(logs.length > 0 ? logs : ['(Code executed with 0 console logs)']);
      sound.playCorrect();
    } catch (err: any) {
      setError(err?.toString() || 'Execution Error');
      sound.playWrong();
    }
  };

  const handleReset = () => {
    sound.playClick();
    setCode(initialCode);
    setOutput([]);
    setError(null);
    setExecutionTime(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-5 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold font-mono text-sm">
              JS
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {title}
              </h2>
              <span className="text-[11px] text-slate-400">
                In-browser live ECMAScript execution sandbox
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Code Editor Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>JavaScript Code:</span>
            <span className="text-[11px] font-mono">ES2024 / V8</span>
          </div>
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 font-mono text-xs">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
              <span>main.js</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                  title="Reset code"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              rows={8}
              className="w-full p-4 bg-transparent text-amber-300 dark:text-amber-200 font-mono text-xs focus:outline-none resize-y selection:bg-blue-600"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Run Controls */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleRunCode}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 dark:bg-amber-400 dark:hover:bg-amber-300 rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run JavaScript (Eval)</span>
          </button>

          {executionTime !== null && (
            <span className="text-[11px] font-mono text-slate-400">
              Completed in {executionTime}ms
            </span>
          )}
        </div>

        {/* Console Output */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Terminal className="w-3.5 h-3.5 text-blue-500" />
            <span>Captured Console Output:</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono min-h-[90px] max-h-48 overflow-y-auto space-y-1">
            {error && (
              <div className="text-rose-400 flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {!error && output.length === 0 && (
              <span className="text-slate-500 italic">
                Press "Run JavaScript" above to evaluate output...
              </span>
            )}
            {!error &&
              output.map((line, idx) => (
                <div key={idx} className="text-emerald-400 leading-relaxed break-all">
                  <span className="text-slate-600 select-none mr-2">&gt;</span>
                  {line}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
