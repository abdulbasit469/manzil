import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MessageCircle, X, Send, Loader2, GraduationCap, Bot } from 'lucide-react';
import api from '../services/api';

const FLOAT_STYLE: React.CSSProperties = {
  position: 'fixed',
  bottom: '24px',
  right: '24px',
  zIndex: 2147483647,
  pointerEvents: 'auto',
};

type Message = { role: 'user' | 'bot'; text: string; source?: 'faq' | 'ai' | 'fallback' };

const WELCOME =
  "Hello! I'm your Manzil AI Career Counselor. Ask me anything about admissions, entry tests (MDCAT, ECAT, NTS), universities, or career paths — in English or Roman Urdu.";

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

  useEffect(() => { scrollToBottom(); }, [messages]);

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
    } catch {
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
      {/* ── Floating trigger button ── */}
      <div style={FLOAT_STYLE}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close chat' : 'Open AI career counselor'}
          className="chat-float-btn"
          style={{
            width: 52, height: 52, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #F58220 0%, #e05f00 100%)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {open
            ? <X style={{ width: 22, height: 22 }} />
            : <MessageCircle style={{ width: 22, height: 22 }} />}
        </button>
      </div>

      {/* ── Chat panel ── */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: '88px',
            right: '24px',
            width: '360px',
            maxWidth: 'calc(100vw - 32px)',
            height: 'min(520px, calc(100vh - 7rem))',
            maxHeight: 'calc(100vh - 7rem)',
            zIndex: 2147483646,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.1)',
            background: '#fff',
          }}
          aria-label="Chatbot panel"
        >
          {/* Header */}
          <div style={{
            flexShrink: 0,
            padding: '14px 16px',
            background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5490 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <GraduationCap style={{ width: 18, height: 18, color: '#fbbf24' }} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>
                  AI Career Counselor
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              style={{
                width: 30, height: 30, borderRadius: '50%', border: 'none',
                background: 'rgba(255,255,255,0.12)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X style={{ width: 15, height: 15 }} />
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, minHeight: 0, overflowY: 'auto', padding: '14px 12px 8px',
            display: 'flex', flexDirection: 'column', gap: 10,
            background: '#f8fafc',
          }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 7 }}>
                {m.role === 'bot' && (
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, #1e3a5f, #2d5490)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 2,
                  }}>
                    <Bot style={{ width: 14, height: 14, color: '#fff' }} />
                  </div>
                )}
                <div style={{
                  maxWidth: '78%',
                  padding: '9px 13px',
                  borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  fontSize: 13,
                  lineHeight: 1.55,
                  background: m.role === 'user'
                    ? 'linear-gradient(135deg, #F58220, #e05f00)'
                    : '#fff',
                  color: m.role === 'user' ? '#fff' : '#1e293b',
                  boxShadow: m.role === 'user'
                    ? '0 2px 8px rgba(245,130,32,0.3)'
                    : '0 1px 4px rgba(0,0,0,0.08)',
                }}>
                  {m.role === 'bot' && m.source === 'ai' && (
                    <span style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#F58220', marginBottom: 4, letterSpacing: '0.04em' }}>
                      ✦ Gemini AI
                    </span>
                  )}
                  <span style={{ whiteSpace: 'pre-wrap' }}>{m.text.replace(/\*\*(.*?)\*\*/g, '$1')}</span>
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-end', gap: 7 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, #1e3a5f, #2d5490)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Bot style={{ width: 14, height: 14, color: '#fff' }} />
                </div>
                <div style={{
                  padding: '10px 14px', borderRadius: '18px 18px 18px 4px',
                  background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                  display: 'flex', gap: 5, alignItems: 'center',
                }}>
                  {[0, 1, 2].map(d => (
                    <span key={d} style={{
                      width: 7, height: 7, borderRadius: '50%',
                      background: '#94a3b8',
                      animation: 'chatDot 1.2s ease-in-out infinite',
                      animationDelay: `${d * 0.2}s`,
                      display: 'inline-block',
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested questions */}
          {suggestedQuestions.length > 0 && (
            <div style={{ flexShrink: 0, padding: '5px 12px 7px', borderTop: '1px solid #f1f5f9', background: '#fff' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {suggestedQuestions.slice(0, 3).map((q, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => sendMessage(q)}
                    disabled={loading}
                    style={{
                      padding: '3px 10px', borderRadius: 20, border: '1.5px solid #e2e8f0',
                      background: '#f8fafc', color: '#475569', fontSize: 11, fontWeight: 500,
                      cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#F58220'; e.currentTarget.style.color = '#F58220'; e.currentTarget.style.background = '#fff7ed'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; e.currentTarget.style.background = '#f8fafc'; }}
                  >
                    {q.length > 32 ? q.slice(0, 31) + '…' : q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            style={{
              flexShrink: 0, display: 'flex', gap: 8, padding: '10px 12px',
              borderTop: '1px solid #f1f5f9', background: '#fff', alignItems: 'center',
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question…"
              disabled={loading}
              style={{
                flex: 1, height: 38, borderRadius: 20, border: '1.5px solid #e2e8f0',
                padding: '0 14px', fontSize: 13, color: '#1e293b', background: '#f8fafc',
                outline: 'none', transition: 'border-color 0.15s',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#F58220')}
              onBlur={e => (e.currentTarget.style.borderColor = '#e2e8f0')}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                width: 38, height: 38, borderRadius: '50%', border: 'none',
                background: input.trim() && !loading ? 'linear-gradient(135deg, #F58220, #e05f00)' : '#e2e8f0',
                color: input.trim() && !loading ? '#fff' : '#94a3b8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s', flexShrink: 0,
              }}
            >
              {loading
                ? <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />
                : <Send style={{ width: 15, height: 15 }} />}
            </button>
          </form>
        </div>
      )}

      <style>{`
        @keyframes chatDot {
          0%, 60%, 100% { opacity: 0.3; transform: scale(0.85); }
          30% { opacity: 1; transform: scale(1.15); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes chatFloat {
          0%, 100% { transform: translateY(0px); box-shadow: 0 4px 20px rgba(245,130,32,0.45); }
          50% { transform: translateY(-7px); box-shadow: 0 10px 28px rgba(245,130,32,0.35); }
        }
        .chat-float-btn {
          animation: chatFloat 2.4s ease-in-out infinite;
        }
        .chat-float-btn:hover {
          animation: none;
          transform: scale(1.08);
        }
      `}</style>
    </>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(content, document.body);
}
