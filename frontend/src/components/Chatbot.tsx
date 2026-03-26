import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import api from '../services/api';

const FLOAT_STYLE: React.CSSProperties = {
  position: 'fixed',
  bottom: '20px',
  right: '20px',
  zIndex: 2147483647,
  pointerEvents: 'auto',
};

type Message = { role: 'user' | 'bot'; text: string; source?: 'faq' | 'ai' | 'fallback' };

const WELCOME =
  "Hello! I'm your Manzil AI Career Counselor. Ask about admissions, entry tests (MDCAT, ECAT, NTS), scholarships, degree & career scope, career assessment, universities, or your profile — English or Roman Urdu. Pick a suggestion below or type your question.";

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [faqLoaded, setFaqLoaded] = useState(false);
  const [aiEnabled, setAiEnabled] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: 'bot', text: WELCOME }]);
    }
  }, [open, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!open) return;
    if (!faqLoaded) {
      api.get('/chatbot/faq')
        .then((res) => {
          const q = res.data?.questions || [];
          setSuggestedQuestions(q.slice(0, 8));
          if (typeof res.data?.aiCounselorEnabled === 'boolean') {
            setAiEnabled(res.data.aiCounselorEnabled);
          }
          setFaqLoaded(true);
        })
        .catch(() => setSuggestedQuestions([]));
    }
  }, [open, faqLoaded]);

  const sendMessage = async (text: string) => {
    const trimmed = text?.trim();
    if (!trimmed || loading) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: trimmed }]);
    setLoading(true);
    try {
      const res = await api.post('/chatbot/ask', { message: trimmed });
      const answer = res.data?.answer || "I couldn't get an answer. Please try rephrasing.";
      const suggested = res.data?.suggestedQuestions || [];
      const source = res.data?.source as Message['source'] | undefined;
      if (typeof res.data?.aiAvailable === 'boolean') setAiEnabled(res.data.aiAvailable);
      setMessages((prev) => [...prev, { role: 'bot', text: answer, source }]);
      if (suggested.length > 0) setSuggestedQuestions(suggested.slice(0, 6));
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: 'Sorry, something went wrong. Please check your connection and try again.' },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const content = (
    <>
      {/* Floating button: always at viewport bottom-right (portal to body) */}
      <div style={FLOAT_STYLE}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1e3a5f] text-white shadow-lg transition hover:bg-[#0f1f3a] focus:outline-none focus:ring-2 focus:ring-amber-400"
          aria-label={open ? 'Minimize AI career counselor' : 'Open AI career counselor'}
        >
          <MessageCircle className="h-5 w-5" />
        </button>
      </div>

      {open && (
        <div
          className="fixed flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
          style={{
            bottom: '5rem',
            right: '20px',
            width: '320px',
            maxWidth: 'calc(100vw - 40px)',
            height: 'min(420px, calc(100vh - 7rem))',
            maxHeight: 'calc(100vh - 7rem)',
            zIndex: 2147483646,
          }}
          aria-label="Chatbot panel"
        >
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-200 bg-[#1e3a5f] px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <span className="font-semibold">AI Career Counselor</span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded p-1 text-white/90 hover:bg-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Minimize panel"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* min-h-0: flex child must shrink so overflow-y-auto scrolls instead of clipping */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 pb-2 space-y-3 [scrollbar-gutter:stable]">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                    m.role === 'user'
                      ? 'bg-[#1e3a5f] text-white'
                      : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  {m.role === 'bot' && m.source === 'ai' && (
                    <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                      AI answer (Gemini)
                    </span>
                  )}
                  {m.role === 'bot' && m.source === 'faq' && (
                    <span className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-slate-500">
                      Knowledge base
                    </span>
                  )}
                  <span className="whitespace-pre-wrap">{m.text.replace(/\*\*(.*?)\*\*/g, '$1')}</span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-lg bg-slate-100 px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-slate-600" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {suggestedQuestions.length > 0 && (
            <div className="shrink-0 border-t border-slate-100 bg-white px-3 py-2">
              <p className="mb-1.5 text-xs font-medium text-slate-500">Suggested:</p>
              <div className="flex flex-wrap gap-1.5">
                {suggestedQuestions.slice(0, 4).map((q, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => sendMessage(q)}
                    disabled={loading}
                    className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-200 disabled:opacity-50"
                  >
                    {q.length > 35 ? q.slice(0, 34) + '…' : q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {aiEnabled === false && (
            <p className="shrink-0 border-t border-amber-100 bg-amber-50 px-3 py-1.5 text-[10px] text-amber-900">
              Tip: Set <code className="rounded bg-white px-0.5">GEMINI_API_KEY</code> in server{' '}
              <code className="rounded bg-white px-0.5">.env</code> for full NLP answers to open-ended questions.
            </p>
          )}

          <form onSubmit={handleSubmit} className="flex shrink-0 gap-2 border-t border-slate-200 bg-white p-3">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Career, admissions, tests…"
              className="flex-1"
              disabled={loading}
            />
            <Button type="submit" size="icon" disabled={loading || !input.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      )}
    </>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(content, document.body);
}
