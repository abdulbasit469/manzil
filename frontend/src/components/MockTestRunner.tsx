import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Send,
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ListOrdered,
} from 'lucide-react';
import type { MockPaperPack } from '../data/mockTestTypes';
import { computeScore, scaledTimeMinutes } from '../data/mockTestScoring';

type Phase = 'intro' | 'running' | 'results';

interface MockTestRunnerProps {
  pack: MockPaperPack;
  gradientClass: string;
  onClose: () => void;
}

export function MockTestRunner({ pack, gradientClass, onClose }: MockTestRunnerProps) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    Array(pack.questions.length).fill(null)
  );
  const [timeLeftSec, setTimeLeftSec] = useState(0);

  const timeLimitMin = useMemo(
    () =>
      scaledTimeMinutes(
        pack.officialDurationMinutes || 60,
        pack.questions.length,
        pack.officialTotalQuestions || pack.questions.length
      ),
    [pack]
  );

  const startTest = useCallback(() => {
    setPhase('running');
    setCurrentIndex(0);
    setAnswers(Array(pack.questions.length).fill(null));
    setTimeLeftSec(timeLimitMin * 60);
  }, [pack.questions.length, timeLimitMin]);

  useEffect(() => {
    if (phase !== 'running') return;
    const id = setInterval(() => {
      setTimeLeftSec((s) => (s <= 0 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'running' || timeLeftSec > 0) return;
    setPhase('results');
  }, [phase, timeLeftSec]);

  const submitFinal = useCallback(() => {
    setPhase('results');
  }, []);

  const fmtTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  /** Local practice only — not a rank vs other users (no leaderboard). */
  function performanceBand(pct: number): { label: string; hint: string; barClass: string } {
    if (pct >= 90) return { label: 'Excellent', hint: 'Strong grip — keep revising weak topics below.', barClass: 'bg-emerald-500' };
    if (pct >= 75) return { label: 'Good', hint: 'Solid prep — drill mistakes in the review list.', barClass: 'bg-green-500' };
    if (pct >= 60) return { label: 'Fair', hint: 'On track — focus on sections with most wrong answers.', barClass: 'bg-amber-500' };
    if (pct >= 40) return { label: 'Needs work', hint: 'Review concepts, then retry a fresh paper.', barClass: 'bg-orange-500' };
    return { label: 'Keep practicing', hint: 'Build basics topic-wise — use the review list below.', barClass: 'bg-red-500' };
  }

  const result = useMemo(
    () => computeScore(answers, pack.questions, pack.negativeMarking),
    [answers, pack.questions, pack.negativeMarking]
  );

  const q = pack.questions[currentIndex];
  const answeredCount = answers.filter((a) => a !== null && a !== undefined).length;

  if (phase === 'intro') {
    return (
      <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden"
        >
          <div className={`bg-gradient-to-r ${gradientClass} p-6 text-white`}>
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">{pack.testName} — Practice</h2>
                <p className="text-white/90 text-sm mt-1">Indicative MCQs — not an official paper</p>
              </div>
              <button type="button" onClick={onClose} className="p-2 rounded-full bg-white/20 hover:bg-white/30">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="p-6 space-y-4 text-sm text-slate-700">
            <p>
              This run is a <strong>full-length MCQ practice paper</strong> ({pack.questions.length} questions) built to
              match the <strong>{pack.testName}</strong> section structure. Official reference: {pack.officialTotalQuestions}{' '}
              questions, {pack.officialDurationLabel}.
            </p>
            <p>
              <strong>Timer:</strong> {timeLimitMin} minutes (matches official duration when the paper is full-length).
            </p>
            <p>
              <strong>Negative marking:</strong> {pack.negativeMarkingLabel}
            </p>
            <p className="text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs">
              Items are computer-generated for drill — not past papers. Confirm syllabus and rules on the official site.
            </p>
            <div className="flex gap-2 pt-2">
              <Button className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600" onClick={startTest}>
                Start practice
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (phase === 'results') {
    const pct = result.maxScore > 0 ? Math.round((result.score / result.maxScore) * 1000) / 10 : 0;
    const band = performanceBand(pct);
    return (
      <div className="fixed inset-0 z-[60] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl my-8"
        >
          <div className={`bg-gradient-to-r ${gradientClass} p-6 text-white`}>
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">{pack.testName} — Results</h2>
              <button type="button" onClick={onClose} className="p-2 rounded-full bg-white/20 hover:bg-white/30">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Your score (this attempt)</p>
              <p className="mt-1 text-5xl font-bold tabular-nums text-slate-900">{pct}%</p>
              <p className="mt-2 text-sm font-semibold text-slate-800">{band.label}</p>
              <p className="mt-1 text-xs text-slate-600 max-w-md mx-auto">{band.hint}</p>
              <div className="mt-4 h-2 rounded-full bg-slate-200 overflow-hidden max-w-sm mx-auto">
                <div className={`h-full ${band.barClass} transition-all`} style={{ width: `${Math.min(100, pct)}%` }} />
              </div>
              <p className="mt-3 text-[11px] text-slate-500">
                Personal practice only — not a rank vs other students (no leaderboard).
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="p-4 text-center border-green-200 bg-green-50/50">
                <p className="text-xs text-slate-600">Correct</p>
                <p className="text-2xl font-bold text-green-700">{result.correct}</p>
              </Card>
              <Card className="p-4 text-center border-red-200 bg-red-50/50">
                <p className="text-xs text-slate-600">Wrong</p>
                <p className="text-2xl font-bold text-red-700">{result.wrong}</p>
              </Card>
              <Card className="p-4 text-center border-slate-200">
                <p className="text-xs text-slate-600">Unanswered</p>
                <p className="text-2xl font-bold text-slate-700">{result.unanswered}</p>
              </Card>
              <Card className="p-4 text-center border-amber-200 bg-amber-50/50">
                <p className="text-xs text-slate-600">Score</p>
                <p className="text-2xl font-bold text-amber-800">
                  {result.score % 1 === 0 ? result.score : result.score.toFixed(2)} / {result.maxScore}
                </p>
              </Card>
            </div>
            <p className="text-center text-sm text-slate-600">
              Percentage uses your final marks out of maximum ({result.maxScore}), including negative marking where applicable.
            </p>
            <div className="border rounded-xl divide-y max-h-[min(70vh,28rem)] overflow-y-auto">
              {pack.questions.map((ques, i) => {
                const a = answers[i];
                const ok = a === ques.correctIndex;
                const missed = a !== null && a !== undefined && !ok;
                return (
                  <div key={ques.id} className="p-3 flex gap-2 text-sm items-start">
                    {a === null || a === undefined ? (
                      <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    ) : ok ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="text-xs font-medium text-amber-700">{ques.section}</span>
                      <p className="text-slate-800">{ques.text}</p>
                      {missed && (
                        <p className="text-xs text-slate-500 mt-1">
                          Your answer: {ques.options[a as 0 | 1 | 2 | 3]} · Correct: {ques.options[ques.correctIndex]}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600" onClick={onClose}>
              Close
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  /* running */
  const isLast = currentIndex === pack.questions.length - 1;
  const lowTime = timeLeftSec <= 120 && timeLeftSec > 0;

  return (
    <div className="fixed inset-0 z-[60] bg-slate-100 flex flex-col">
      <header className={`bg-gradient-to-r ${gradientClass} text-white px-4 py-3 flex flex-wrap items-center justify-between gap-2 shadow-md`}>
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-bold truncate">{pack.testName}</span>
          <span className="text-white/80 text-sm hidden sm:inline">Full MCQ paper</span>
        </div>
        <div
          className={`flex items-center gap-2 font-mono text-lg ${lowTime ? 'text-amber-200 animate-pulse' : ''}`}
        >
          <Clock className="w-5 h-5 shrink-0" />
          {fmtTime(timeLeftSec)}
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="bg-white/15 border-white/40 text-white hover:bg-white/25"
            onClick={() => {
              if (window.confirm('Submit the test now? You can still review results after.')) submitFinal();
            }}
          >
            <Send className="w-4 h-4 mr-1" />
            Submit
          </Button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Exit practice? Your answers will be lost.')) onClose();
            }}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 md:p-8 max-w-3xl mx-auto w-full">
        <details className="mb-4 group">
          <summary className="cursor-pointer text-sm font-medium text-amber-800 flex items-center gap-2 list-none">
            <ListOrdered className="w-4 h-4" />
            Jump to question ({pack.questions.length})
          </summary>
          <div className="mt-2 max-h-36 overflow-y-auto flex flex-wrap gap-1 p-2 bg-white rounded-lg border border-slate-200">
            {pack.questions.map((_, i) => (
              <button
                key={i}
                type="button"
                title={`Q${i + 1}`}
                onClick={() => setCurrentIndex(i)}
                className={`w-8 h-8 text-xs rounded border ${
                  currentIndex === i
                    ? 'bg-amber-500 text-white border-amber-600'
                    : answers[i] !== null && answers[i] !== undefined
                      ? 'bg-green-50 border-green-300 text-green-900'
                      : 'bg-slate-50 border-slate-200 hover:border-amber-400'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </details>
        <p className="text-sm text-slate-600 mb-4">
          Question {currentIndex + 1} of {pack.questions.length} · {answeredCount} answered
        </p>
        <div className="mb-2">
          <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
            {q.section}
          </span>
        </div>
        <h3 className="text-lg md:text-xl font-medium text-slate-900 mb-6">{q.text}</h3>
        <div className="space-y-3">
          {q.options.map((opt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                const next = [...answers];
                next[currentIndex] = idx as 0 | 1 | 2 | 3;
                setAnswers(next);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                answers[currentIndex] === idx
                  ? 'border-amber-500 bg-amber-50 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-amber-300'
              }`}
            >
              <span className="font-medium text-amber-800 mr-2">{String.fromCharCode(65 + idx)}.</span>
              {opt}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 mt-10 justify-between">
          <Button
            variant="outline"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Previous
          </Button>
          {!isLast ? (
            <Button
              className="bg-gradient-to-r from-amber-500 to-amber-600"
              onClick={() => setCurrentIndex((i) => Math.min(pack.questions.length - 1, i + 1))}
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button className="bg-gradient-to-r from-green-600 to-emerald-600" onClick={submitFinal}>
              <Send className="w-4 h-4 mr-2" /> Submit
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
