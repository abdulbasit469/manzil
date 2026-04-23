import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
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
  Award,
} from 'lucide-react';
import type { MockPaperPack } from '../data/mockTestTypes';
import { computeScore, scaledTimeMinutes } from '../data/mockTestScoring';

type Phase = 'intro' | 'running' | 'results';
type ConfirmKind = 'submit' | 'exit' | null;

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
  const [confirmKind, setConfirmKind] = useState<ConfirmKind>(null);

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
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-5 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ width: 'min(440px, calc(100vw - 2.5rem))', borderRadius: 20, overflow: 'hidden', background: '#fff', boxShadow: '0 25px 60px rgba(0,0,0,0.28)' }}
        >
          {/* Coloured header */}
          <div
            className={`bg-gradient-to-r ${gradientClass} text-white`}
            style={{ padding: '20px 22px 18px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{pack.testName} — Practice</h2>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>Indicative MCQs — not an official paper</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.22)', color: '#fff', cursor: 'pointer' }}
              >
                <X style={{ width: 15, height: 15 }} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: '20px 22px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.65 }}>
              <p style={{ margin: 0 }}>
                Full-length MCQ practice paper —{' '}
                <strong style={{ color: '#1e293b' }}>{pack.questions.length} questions</strong> matching the{' '}
                <strong style={{ color: '#1e293b' }}>{pack.testName}</strong> structure.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#334155' }}>
                <Clock style={{ width: 15, height: 15, color: '#64748b', flexShrink: 0 }} />
                <span><strong>Timer:</strong> {timeLimitMin} minutes</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#334155' }}>
                <AlertCircle style={{ width: 15, height: 15, color: '#64748b', flexShrink: 0 }} />
                <span><strong>Negative marking:</strong> {pack.negativeMarkingLabel}</span>
              </div>
            </div>


            <div style={{ display: 'flex', gap: 10, paddingTop: 2 }}>
              <button
                type="button"
                onClick={startTest}
                style={{ flex: 1, padding: '11px 0', borderRadius: 12, border: 'none', background: '#F58220', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
              >
                Start Practice
              </button>
              <button
                type="button"
                onClick={onClose}
                style={{ padding: '11px 20px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
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
      /* dark backdrop, centred modal */
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ width: 'min(520px, calc(100vw - 3rem))', maxHeight: 'min(86vh, 620px)', display: 'flex', flexDirection: 'column', borderRadius: 20, background: '#fff', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}
        >
          {/* Gradient header — rounded top corners only */}
          <div
            className={`shrink-0 bg-gradient-to-r ${gradientClass} text-white`}
            style={{ borderRadius: '20px 20px 0 0', padding: '18px 20px 16px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>{pack.testName} — Results</h2>
              <button
                type="button"
                onClick={onClose}
                style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.22)', color: '#fff', cursor: 'pointer' }}
              >
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </div>

          {/* Scrollable body */}
          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>

            {/* Score summary */}
            <div style={{ padding: '22px 22px 18px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8' }}>Your Score</p>
                <p style={{ fontSize: 48, fontWeight: 800, color: '#0f172a', lineHeight: 1.1, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>{pct}%</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: band.barClass === 'bg-emerald-500' ? '#059669' : band.barClass === 'bg-green-500' ? '#16a34a' : band.barClass === 'bg-amber-500' ? '#d97706' : band.barClass === 'bg-orange-500' ? '#ea580c' : '#dc2626', marginTop: 4 }}>{band.label}</p>
                <div style={{ margin: '10px auto 0', height: 6, maxWidth: 200, borderRadius: 99, background: '#f1f5f9', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, pct)}%`, borderRadius: 99, background: band.barClass === 'bg-emerald-500' ? '#10b981' : band.barClass === 'bg-green-500' ? '#22c55e' : band.barClass === 'bg-amber-500' ? '#f59e0b' : band.barClass === 'bg-orange-500' ? '#f97316' : '#ef4444', transition: 'width 0.7s ease' }} />
                </div>
              </div>

              {/* 4 stat tiles */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', borderRadius:14, border:'2px solid #bbf7d0', background:'#f0fdf4', padding:'14px 8px' }}>
                  <CheckCircle2 style={{ width:18, height:18, color:'#16a34a', marginBottom:5 }} />
                  <span style={{ fontSize:22, fontWeight:800, color:'#15803d', lineHeight:1 }}>{result.correct}</span>
                  <span style={{ fontSize:10, fontWeight:600, color:'#16a34a', marginTop:3 }}>Correct</span>
                </div>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', borderRadius:14, border:'2px solid #fecaca', background:'#fef2f2', padding:'14px 8px' }}>
                  <XCircle style={{ width:18, height:18, color:'#ef4444', marginBottom:5 }} />
                  <span style={{ fontSize:22, fontWeight:800, color:'#dc2626', lineHeight:1 }}>{result.wrong}</span>
                  <span style={{ fontSize:10, fontWeight:600, color:'#ef4444', marginTop:3 }}>Wrong</span>
                </div>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', borderRadius:14, border:'2px solid #e2e8f0', background:'#f8fafc', padding:'14px 8px' }}>
                  <AlertCircle style={{ width:18, height:18, color:'#94a3b8', marginBottom:5 }} />
                  <span style={{ fontSize:22, fontWeight:800, color:'#475569', lineHeight:1 }}>{result.unanswered}</span>
                  <span style={{ fontSize:10, fontWeight:600, color:'#94a3b8', marginTop:3 }}>Skipped</span>
                </div>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', borderRadius:14, border:'2px solid #fde68a', background:'#fffbeb', padding:'14px 8px' }}>
                  <Award style={{ width:18, height:18, color:'#d97706', marginBottom:5 }} />
                  <span style={{ fontSize:22, fontWeight:800, color:'#b45309', lineHeight:1 }}>
                    {result.score % 1 === 0 ? result.score : result.score.toFixed(1)}
                  </span>
                  <span style={{ fontSize:10, fontWeight:600, color:'#d97706', marginTop:3 }}>/{result.maxScore}</span>
                </div>
              </div>
            </div>

            {/* Answer review label */}
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'16px 22px 4px' }}>
              <div style={{ flex:1, height:1, background:'#e2e8f0' }} />
              <span style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#94a3b8', flexShrink:0 }}>Answer Review</span>
              <div style={{ flex:1, height:1, background:'#e2e8f0' }} />
            </div>

            {/* Per-question rows */}
            <div style={{ padding: '6px 0' }}>
              {pack.questions.map((ques, i) => {
                const a = answers[i];
                const skipped = a === null || a === undefined;
                const correct = !skipped && a === ques.correctIndex;
                const wrong = !skipped && !correct;
                return (
                  <div
                    key={ques.id}
                    style={{ display:'flex', gap:14, alignItems:'flex-start', padding:'12px 22px', borderBottom:'1px solid #f1f5f9', background: correct ? '#f0fdf4' : wrong ? '#fff1f2' : '#fff' }}
                  >
                    {/* Number circle */}
                    <span style={{ display:'flex', alignItems:'center', justifyContent:'center', width:26, height:26, borderRadius:'50%', flexShrink:0, fontSize:11, fontWeight:700, marginTop:1, background: correct ? '#22c55e' : wrong ? '#ef4444' : '#e2e8f0', color: correct || wrong ? '#fff' : '#64748b' }}>
                      {i + 1}
                    </span>

                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', color:'#b45309', marginBottom:2 }}>{ques.section}</p>
                      <p style={{ fontSize:13, color:'#1e293b', lineHeight:1.5 }}>{ques.text}</p>
                      <div style={{ marginTop:5, fontSize:12, display:'flex', flexDirection:'column', gap:2 }}>
                        {!skipped && (
                          <span style={{ color: correct ? '#15803d' : '#dc2626', fontWeight:500 }}>
                            Your answer: {String.fromCharCode(65 + (a as number))}. {ques.options[a as 0|1|2|3]}{correct ? ' ✓' : ''}
                          </span>
                        )}
                        {skipped && <span style={{ color:'#94a3b8' }}>Not attempted</span>}
                        {!correct && (
                          <span style={{ color:'#16a34a', fontWeight:600 }}>
                            Correct: {String.fromCharCode(65 + ques.correctIndex)}. {ques.options[ques.correctIndex]}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ flexShrink:0, paddingTop:2 }}>
                      {correct ? <CheckCircle2 style={{ width:15, height:15, color:'#22c55e' }} />
                        : wrong ? <XCircle style={{ width:15, height:15, color:'#ef4444' }} />
                        : <AlertCircle style={{ width:15, height:15, color:'#cbd5e1' }} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sticky footer — rounded bottom corners */}
          <div style={{ flexShrink:0, borderTop:'1px solid #f1f5f9', background:'#fafafa', padding:'14px 22px', borderRadius:'0 0 20px 20px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ width:'100%', padding:'11px 0', borderRadius:12, border:'none', background:'#F58220', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', letterSpacing:'0.01em' }}
            >
              Close Results
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  /* running */
  const isLast = currentIndex === pack.questions.length - 1;
  const lowTime = timeLeftSec <= 120 && timeLeftSec > 0;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-slate-100">
      {/* ── Colored navbar ── */}
      <header
        className={`shrink-0 bg-gradient-to-r ${gradientClass} px-4 py-3 text-white shadow-md`}
      >
        <div className="flex items-center justify-between gap-3">
          {/* Left: test name */}
          <span className="truncate text-base font-bold sm:text-lg">
            {pack.testName}
            <span className="ml-2 hidden text-sm font-normal text-white/80 sm:inline">Practice</span>
          </span>

          {/* Centre: live countdown */}
          <div
            className={`flex items-center gap-1.5 rounded-lg border border-white/30 bg-white/20 px-3 py-1 font-mono text-base font-semibold tabular-nums sm:text-lg ${
              lowTime ? 'animate-pulse text-yellow-200' : 'text-white'
            }`}
            aria-live="polite"
            title="Time remaining"
          >
            <Clock className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
            {fmtTime(timeLeftSec)}
          </div>

          {/* Right: submit + close */}
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-white/40 bg-white/15 text-white hover:bg-white/25 hover:text-white"
              onClick={() => setConfirmKind('submit')}
            >
              <Send className="mr-1 h-4 w-4" />
              Submit
            </Button>
            <button
              type="button"
              className="circle-btn-32"
              aria-label="Exit test"
              onClick={() => setConfirmKind('exit')}
              style={{ background: 'rgba(255,255,255,0.22)', color: '#fff', cursor: 'pointer' }}
            >
              <X style={{ width: 15, height: 15 }} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto" style={{ padding: '36px 24px 44px' }}>
        <div className="mx-auto w-full max-w-2xl">

          {/* Jump-to-question accordion — clear gap from navbar */}
          <details className="mb-3 group">
            <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-amber-800 hover:text-amber-900 sm:text-base">
              <ListOrdered className="h-4 w-4 shrink-0" />
              Jump to question ({pack.questions.length})
            </summary>
            <div className="mt-2 flex max-h-36 flex-wrap gap-1.5 overflow-y-auto rounded-lg border border-slate-200 bg-white p-3">
              {pack.questions.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  title={`Q${i + 1}`}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-8 w-8 rounded border text-xs font-medium ${
                    currentIndex === i
                      ? 'border-amber-600 bg-amber-500 text-white'
                      : answers[i] !== null && answers[i] !== undefined
                        ? 'border-green-300 bg-green-50 text-green-900'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-amber-400'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </details>

          {/* Progress line — gap above AND below so it doesn't touch the card */}
          <p className="text-sm text-slate-500" style={{ margin: '10px 0 20px' }}>
            Question {currentIndex + 1} of {pack.questions.length} &middot; {answeredCount} answered
          </p>

          {/* White question card — slightly narrower, reduced padding */}
          <div className="mx-auto rounded-2xl border border-slate-200 bg-white shadow-sm" style={{ padding: '24px', maxWidth: '680px' }}>

            {/* Section badge */}
            <span className="mb-5 inline-block rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900 sm:text-sm">
              {q.section}
            </span>

            {/* Question text */}
            <h3 className="mb-8 text-base font-semibold leading-relaxed text-slate-900 sm:text-lg md:text-xl">
              {q.text}
            </h3>

            {/* Options */}
            <div className="flex flex-col gap-4">
              {q.options.map((opt, idx) => {
                const selected = answers[currentIndex] === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      const next = [...answers];
                      next[currentIndex] = idx as 0 | 1 | 2 | 3;
                      setAnswers(next);
                    }}
                    style={{ padding: '14px 20px', gap: 16 }}
                    className={`flex w-full items-center rounded-xl border-2 text-left text-sm transition-all sm:text-base ${
                      selected
                        ? 'border-amber-500 bg-amber-50 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-amber-300'
                    }`}
                  >
                    {/* Letter badge with its own padding so it never touches border */}
                    <span
                      style={{ width: 36, height: 36, flexShrink: 0 }}
                      className={`flex items-center justify-center rounded-full text-sm font-bold ${
                        selected ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="min-w-0 flex-1 leading-snug text-slate-800">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Previous / Next */}
            <div className="mt-12 flex items-center justify-between gap-3 border-t-2 border-slate-100 pt-8">
              <Button
                variant="outline"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                className="border-slate-300 bg-white px-6 text-slate-500 hover:text-slate-800"
              >
                <ChevronLeft className="mr-1 h-4 w-4" /> Previous
              </Button>

              {!isLast ? (
                <Button
                  onClick={() => setCurrentIndex((i) => Math.min(pack.questions.length - 1, i + 1))}
                  style={{ backgroundColor: '#F58220', color: '#fff' }}
                  className="px-7 hover:opacity-90"
                >
                  Next <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={submitFinal}
                  className="bg-emerald-600 px-7 text-white hover:bg-emerald-700"
                >
                  <Send className="mr-2 h-4 w-4" /> Submit
                </Button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ── Custom confirm modal (replaces browser dialog) ── */}
      {confirmKind && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', padding: 20 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            style={{ width: 'min(380px, calc(100vw - 2.5rem))', borderRadius: 18, background: '#fff', boxShadow: '0 20px 50px rgba(0,0,0,0.25)', overflow: 'hidden' }}
          >
            {/* Icon strip */}
            <div style={{ padding: '24px 24px 0', textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, borderRadius: '50%', background: confirmKind === 'submit' ? '#fff7ed' : '#fef2f2', marginBottom: 14 }}>
                {confirmKind === 'submit'
                  ? <Send style={{ width: 22, height: 22, color: '#F58220' }} />
                  : <X style={{ width: 22, height: 22, color: '#ef4444' }} />}
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
                {confirmKind === 'submit' ? 'Submit Test?' : 'Exit Test?'}
              </h3>
              <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, margin: '0 0 22px' }}>
                {confirmKind === 'submit'
                  ? 'You can still review every question with correct answers after submitting.'
                  : 'Your progress will be lost. Are you sure you want to exit?'}
              </p>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 10, padding: '0 24px 22px' }}>
              <button
                type="button"
                onClick={() => setConfirmKind(null)}
                style={{ flex: 1, padding: '11px 0', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmKind(null);
                  if (confirmKind === 'submit') submitFinal();
                  else onClose();
                }}
                style={{ flex: 1, padding: '11px 0', borderRadius: 12, border: 'none', background: confirmKind === 'submit' ? '#F58220' : '#ef4444', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
              >
                {confirmKind === 'submit' ? 'Yes, Submit' : 'Yes, Exit'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}