import { motion } from 'motion/react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { GitCompareArrows, Loader2, Info, ExternalLink, X } from 'lucide-react';
import { useState, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import api from '../../services/api';
import { toast } from 'sonner';
import { universityNameLabel, stripUnknownUniversityText } from '../../utils/universityDisplay';
import { getUniversityImage } from '../../utils/universityImage';

// ─── Types ───────────────────────────────────────────────────────────────────

interface UniOption {
  _id: string;
  name: string;
  city: string;
}

interface ProgramOption {
  _id: string;
  name: string;
  degree: string;
  category: string;
  university: { _id: string; name: string; city: string } | string;
}

interface FacilityBlurb { label: string; blurb: string; }
interface StudentInsightRow { label: string; value: string; }
interface FeesRange {
  computerEngineering?: string;
  medical?: string;
  businessFinance?: string;
}

interface ComparedUniversity {
  _id: string;
  name: string;
  city: string;
  image?: string;
  logo?: string;
  type?: string;
  hecRanking?: number;
  website?: string;
  address?: string;
  programsOffer?: number;
  facilitiesStructured?: FacilityBlurb[];
  studentInsights?: StudentInsightRow[];
  feesRange?: FeesRange;
}

interface MeritCriteria {
  weightsSummary?: string | null;
  entryTestName?: string | null;
  entryTestRequired?: boolean;
  entryTestTotalMarks?: number | null;
  minimumMatricMarks?: number;
  minimumIntermediateMarks?: number;
  lastClosingMerit?: { year?: number; closingMerit?: number; programName?: string } | null;
}

interface ComparedProgram {
  _id: string;
  name: string;
  degree: string;
  category?: string;
  programGroup?: string;
  duration?: string;
  feePerSemester?: number;
  totalFee?: number;
  eligibility?: string;
  careerScope?: string;
  availableSeats?: number;
  university?: { name: string; city: string; type?: string; hecRanking?: number; website?: string };
  meritCriteria?: MeritCriteria | null;
  aiCareerOutlook?: string;
  aiSalaryRange?: string;
  aiIndustryLinkages?: string;
  aiAdmissionDifficulty?: string;
  aiProgramStrengths?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function cleanAiText(s: string | undefined): string {
  return String(s || '').replace(/\*/g, '').trim();
}

function truncate(text: string | undefined, max = 180): string {
  const t = cleanAiText(text);
  if (!t) return '—';
  return t.length <= max ? t : `${t.slice(0, max)}…`;
}

function fmtFee(n?: number): string {
  if (!n || !Number.isFinite(n) || n <= 0) return '—';
  return `Rs. ${Math.round(n).toLocaleString('en-PK')}`;
}

function feesRangeCell(u: ComparedUniversity): ReactNode {
  const f = u.feesRange;
  const rows = [
    { label: 'Computer / Engineering', value: cleanAiText(f?.computerEngineering) },
    { label: 'Medical', value: cleanAiText(f?.medical) },
    { label: 'Business / Finance', value: cleanAiText(f?.businessFinance) },
  ];
  const hasAny = rows.some((r) => r.value);
  if (!hasAny) return <span className="text-slate-400">—</span>;
  return (
    <ul className="list-none space-y-1.5 text-xs text-slate-800">
      {rows.map((r) => (
        <li key={r.label}>
          <span className="text-slate-500 font-medium">{r.label}: </span>
          {r.value || '—'}
        </li>
      ))}
    </ul>
  );
}

function programUniName(p: ComparedProgram): string {
  if (!p.university) return '—';
  if (typeof p.university === 'string') return p.university;
  return universityNameLabel(p.university.name);
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ComparisonPage() {
  const [tab, setTab] = useState<'universities' | 'programs'>('universities');

  // ── Universities state ──
  const [uniOptions, setUniOptions] = useState<UniOption[]>([]);
  const [loadingUniOptions, setLoadingUniOptions] = useState(false);
  const [uniSlot1, setUniSlot1] = useState('');
  const [uniSlot2, setUniSlot2] = useState('');
  const [uniSlot3, setUniSlot3] = useState('');
  const [resultUnis, setResultUnis] = useState<ComparedUniversity[] | null>(null);
  const [loadingUniCompare, setLoadingUniCompare] = useState(false);
  const [uniAiUsed, setUniAiUsed] = useState<boolean | null>(null);

  // ── Programs state ──
  const [programOptions, setProgramOptions] = useState<ProgramOption[]>([]);
  const [loadingProgOptions, setLoadingProgOptions] = useState(false);
  const [programSearch, setProgramSearch] = useState('');
  const [progSlot1, setProgSlot1] = useState('');
  const [progSlot2, setProgSlot2] = useState('');
  const [progSlot3, setProgSlot3] = useState('');
  const [resultProgs, setResultProgs] = useState<ComparedProgram[] | null>(null);
  const [loadingProgCompare, setLoadingProgCompare] = useState(false);
  const [progAiUsed, setProgAiUsed] = useState<boolean | null>(null);

  // ── Load university options ──
  const loadUniversities = useCallback(async () => {
    try {
      setLoadingUniOptions(true);
      const res = await api.get('/universities', {
        params: { limit: 8000, page: 1, meritPicker: 'true', omitPlaceholderUniversities: 'true' },
      });
      if (res.data?.success) setUniOptions(res.data.universities || []);
    } catch {
      toast.error('Could not load universities list');
      setUniOptions([]);
    } finally {
      setLoadingUniOptions(false);
    }
  }, []);

  // ── Load program options ──
  const loadPrograms = useCallback(async (search: string) => {
    try {
      setLoadingProgOptions(true);
      const res = await api.get('/programs', {
        params: { limit: 200, page: 1, ...(search.trim() ? { search: search.trim() } : {}) },
      });
      if (res.data?.success) {
        setProgramOptions(res.data.programs || []);
      }
    } catch {
      toast.error('Could not load programs list');
      setProgramOptions([]);
    } finally {
      setLoadingProgOptions(false);
    }
  }, []);

  useEffect(() => { loadUniversities(); }, [loadUniversities]);
  useEffect(() => { loadPrograms(''); }, [loadPrograms]);

  // Debounce program search
  useEffect(() => {
    const t = setTimeout(() => loadPrograms(programSearch), 350);
    return () => clearTimeout(t);
  }, [programSearch, loadPrograms]);

  // ── Uni compare ──
  const usedUniIds = useMemo(() => new Set([uniSlot1, uniSlot2, uniSlot3].filter(Boolean)), [uniSlot1, uniSlot2, uniSlot3]);

  const runUniCompare = async () => {
    if (!uniSlot1 || !uniSlot2) { toast.error('Select at least two universities'); return; }
    const ids = [uniSlot1, uniSlot2, uniSlot3].filter(Boolean);
    try {
      setLoadingUniCompare(true);
      const res = await api.post('/comparison', { type: 'universities', ids });
      if (!res.data?.success) { toast.error(res.data?.message || 'Comparison failed'); return; }
      setResultUnis(res.data.items || []);
      setUniAiUsed(res.data.aiUsed === true);
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'response' in e
        ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Comparison failed';
      toast.error(msg || 'Comparison failed');
    } finally {
      setLoadingUniCompare(false);
    }
  };

  // ── Program compare ──
  const usedProgIds = useMemo(() => new Set([progSlot1, progSlot2, progSlot3].filter(Boolean)), [progSlot1, progSlot2, progSlot3]);

  const runProgCompare = async () => {
    if (!progSlot1 || !progSlot2) { toast.error('Select at least two programs'); return; }
    const ids = [progSlot1, progSlot2, progSlot3].filter(Boolean);
    try {
      setLoadingProgCompare(true);
      const res = await api.post('/comparison', { type: 'programs', ids });
      if (!res.data?.success) { toast.error(res.data?.message || 'Comparison failed'); return; }
      setResultProgs(res.data.items || []);
      setProgAiUsed(res.data.aiUsed === true);
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'response' in e
        ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Comparison failed';
      toast.error(msg || 'Comparison failed');
    } finally {
      setLoadingProgCompare(false);
    }
  };

  // ── Renderers ──
  const renderUniSelect = (value: string, onChange: (v: string) => void, label: string) => (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
        disabled={loadingUniOptions}
      >
        <option value="">— Select —</option>
        {uniOptions.map((u) => (
          <option key={u._id} value={u._id} disabled={usedUniIds.has(u._id) && value !== u._id}>
            {universityNameLabel(u.name)}
            {stripUnknownUniversityText(u.city) ? ` · ${stripUnknownUniversityText(u.city)}` : ''}
          </option>
        ))}
      </select>
    </div>
  );

  const renderProgSelect = (value: string, onChange: (v: string) => void, label: string) => (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
        disabled={loadingProgOptions}
      >
        <option value="">— Select —</option>
        {programOptions.map((p) => {
          const uniName = typeof p.university === 'object' && p.university
            ? universityNameLabel((p.university as { name: string }).name)
            : '';
          return (
            <option key={p._id} value={p._id} disabled={usedProgIds.has(p._id) && value !== p._id}>
              {p.degree} {p.name}{uniName ? ` — ${uniName}` : ''}
            </option>
          );
        })}
      </select>
    </div>
  );

  return (
    <div className="flex-1 overflow-auto bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0f1f3a] via-[#1e3a5f] to-amber-500 text-white p-4 md:p-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl md:text-4xl mb-2 flex items-center gap-2">
              <GitCompareArrows className="w-9 h-9 md:w-10 md:h-10" />
              Comparison Tool
            </h1>
            <p className="text-blue-100 max-w-3xl">
              Compare two or three universities or degree programs side by side — fees, merit criteria (when available),
              facilities, rankings, and scope — to make a clearer choice.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        <Card className="p-6 md:p-8">
          {/* Tab switcher */}
          <div className="flex gap-3 mb-6 border-b border-slate-200 pb-4">
            <button
              onClick={() => setTab('universities')}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold tracking-wide transition-all duration-200 ${
                tab === 'universities'
                  ? 'bg-[#1e3a5f] text-white shadow-md'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
              }`}
            >
              Universities
            </button>
            <button
              onClick={() => setTab('programs')}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold tracking-wide transition-all duration-200 ${
                tab === 'programs'
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
              }`}
            >
              Degree Programs
            </button>
          </div>

          {/* ── UNIVERSITIES TAB ── */}
          {tab === 'universities' && (
            <div className="flex flex-col gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-2">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-900">
                  Pick <strong>2 or 3</strong> universities to compare side by side. AI-powered insights are generated
                  via Gemini when available.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {renderUniSelect(uniSlot1, setUniSlot1, 'Option A')}
                {renderUniSelect(uniSlot2, setUniSlot2, 'Option B')}
                {renderUniSelect(uniSlot3, setUniSlot3, 'Option C (optional)')}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={runUniCompare}
                  disabled={loadingUniCompare || !uniSlot1 || !uniSlot2}
                  className="bg-gradient-to-r from-[#1e3a5f] to-amber-500 text-white"
                >
                  {loadingUniCompare ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Comparing…</>
                  ) : (
                    <><GitCompareArrows className="w-4 h-4 mr-2" />Compare</>
                  )}
                </Button>
                {resultUnis && (
                  <Button type="button" variant="outline" onClick={() => { setResultUnis(null); setUniAiUsed(null); }}>
                    <X className="w-4 h-4 mr-2" />Clear results
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* ── PROGRAMS TAB ── */}
          {tab === 'programs' && (
            <div className="flex flex-col gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-2">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-900">
                  Pick <strong>2 or 3</strong> different programs. Merit breakdown appears for programs only when your
                  admin has added criteria for that program. Always confirm fees and merit on the{' '}
                  <strong>official university website</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {renderProgSelect(progSlot1, setProgSlot1, 'Option A')}
                {renderProgSelect(progSlot2, setProgSlot2, 'Option B')}
                {renderProgSelect(progSlot3, setProgSlot3, 'Option C (optional)')}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={runProgCompare}
                  disabled={loadingProgCompare || !progSlot1 || !progSlot2}
                  className="bg-gradient-to-r from-[#1e3a5f] to-amber-500 text-white"
                >
                  {loadingProgCompare ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Comparing…</>
                  ) : (
                    <><GitCompareArrows className="w-4 h-4 mr-2" />Compare</>
                  )}
                </Button>
                {resultProgs && (
                  <Button type="button" variant="outline" onClick={() => { setResultProgs(null); setProgAiUsed(null); }}>
                    <X className="w-4 h-4 mr-2" />Clear results
                  </Button>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* ── AI banner ── */}
        {((tab === 'universities' && resultUnis && uniAiUsed === false) ||
          (tab === 'programs' && resultProgs && progAiUsed === false)) && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <Info className="h-4 w-4 mt-0.5 shrink-0 text-amber-500" />
            <span>
              <strong>AI insights unavailable</strong> — your Gemini API free-tier quota is currently exhausted.
              The data shown is from our database. Quota resets daily, or upgrade at{' '}
              <a href="https://ai.google.dev" target="_blank" rel="noreferrer" className="underline font-medium">
                ai.google.dev
              </a>.
            </span>
          </div>
        )}

        {/* ── UNIVERSITIES RESULTS ── */}
        {tab === 'universities' && resultUnis && resultUnis.length > 0 && (
          <Card className="p-0 overflow-hidden border-slate-200 shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse min-w-[720px]">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200">
                    <th className="text-left p-3 md:p-4 font-semibold text-slate-600 w-40 sticky left-0 bg-slate-100 z-10 border-r border-slate-200">
                      Attribute
                    </th>
                    {resultUnis.map((u) => (
                      <th key={u._id} className="p-3 md:p-4 text-left align-top min-w-[200px] max-w-[280px]">
                        <div className="flex items-start gap-2">
                          <img
                            src={getUniversityImage({ name: u.name, image: u.image, logo: u.logo })}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                          />
                          <div>
                            <div className="font-bold text-slate-900 leading-tight">{universityNameLabel(u.name)}</div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {stripUnknownUniversityText(u.city) || '—'}
                            </div>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {[
                    { label: 'Type', fn: (u: ComparedUniversity) => cleanAiText(u.type) || '—' },
                    { label: 'HEC ranking', fn: (u: ComparedUniversity) => u.hecRanking != null ? String(u.hecRanking) : '—' },
                    { label: 'Programs offer', fn: (u: ComparedUniversity) => u.programsOffer != null ? String(u.programsOffer) : '—' },
                    {
                      label: 'Website',
                      fn: (u: ComparedUniversity) =>
                        u.website ? (
                          <a
                            href={u.website.startsWith('http') ? u.website : `https://${u.website}`}
                            target="_blank" rel="noopener noreferrer"
                            className="text-amber-700 hover:underline inline-flex items-center gap-1"
                          >
                            Link <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : '—',
                    },
                    { label: 'Address', fn: (u: ComparedUniversity) => truncate(u.address, 60) },
                    ...(resultUnis[0]?.facilitiesStructured ?? []).map((f) => ({
                      label: f.label,
                      fn: (u: ComparedUniversity) => {
                        const row = u.facilitiesStructured?.find((x) => x.label === f.label);
                        return cleanAiText(row?.blurb) || '—';
                      },
                    })),
                    ...(resultUnis[0]?.studentInsights ?? []).map((f) => ({
                      label: f.label,
                      fn: (u: ComparedUniversity) => {
                        const row = u.studentInsights?.find((x) => x.label === f.label);
                        return truncate(row?.value, 200);
                      },
                    })),
                    { label: 'Fees range', fn: (u: ComparedUniversity) => feesRangeCell(u) },
                  ].map((row) => (
                    <tr key={row.label} className="hover:bg-slate-50/80">
                      <td className="p-3 md:p-4 font-medium text-slate-700 sticky left-0 bg-white z-10 border-r border-slate-100">
                        {row.label}
                      </td>
                      {resultUnis.map((u) => (
                        <td key={u._id} className="p-3 md:p-4 text-slate-800 align-top">
                          {row.fn(u) as ReactNode}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* ── PROGRAMS RESULTS ── */}
        {tab === 'programs' && resultProgs && resultProgs.length > 0 && (
          <Card className="p-0 overflow-hidden border-slate-200 shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse min-w-[720px]">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200">
                    <th className="text-left p-3 md:p-4 font-semibold text-slate-600 w-44 sticky left-0 bg-slate-100 z-10 border-r border-slate-200">
                      Attribute
                    </th>
                    {resultProgs.map((p) => (
                      <th key={p._id} className="p-3 md:p-4 text-left align-top min-w-[210px] max-w-[290px]">
                        <div>
                          <div className="font-bold text-slate-900 leading-tight">
                            {p.degree} {p.name}
                          </div>
                          <div className="text-xs text-amber-700 font-medium mt-0.5">{programUniName(p)}</div>
                          {p.university && typeof p.university === 'object' && p.university.city && (
                            <div className="text-xs text-slate-500">{p.university.city}</div>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {([
                    {
                      label: 'Duration',
                      fn: (p: ComparedProgram) => p.duration || '—',
                    },
                    {
                      label: 'Fee / semester',
                      fn: (p: ComparedProgram) => fmtFee(p.feePerSemester),
                    },
                    {
                      label: 'Eligibility',
                      fn: (p: ComparedProgram) => truncate(p.eligibility, 120),
                    },
                    {
                      label: 'University type',
                      fn: (p: ComparedProgram) =>
                        p.university && typeof p.university === 'object' ? (p.university.type || '—') : '—',
                    },
                    {
                      label: 'HEC ranking',
                      fn: (p: ComparedProgram) =>
                        p.university && typeof p.university === 'object' && p.university.hecRanking != null
                          ? String(p.university.hecRanking)
                          : '—',
                    },
                    {
                      label: 'University website',
                      fn: (p: ComparedProgram) => {
                        const site = typeof p.university === 'object' ? p.university?.website : undefined;
                        if (!site) return '—' as ReactNode;
                        return (
                          <a
                            href={site.startsWith('http') ? site : `https://${site}`}
                            target="_blank" rel="noopener noreferrer"
                            className="text-amber-700 hover:underline inline-flex items-center gap-1"
                          >
                            Link <ExternalLink className="w-3 h-3" />
                          </a>
                        );
                      },
                    },
                    {
                      label: 'Closing merit (last)',
                      fn: (p: ComparedProgram) => {
                        const lc = p.meritCriteria?.lastClosingMerit;
                        if (!lc) return '—';
                        return `${lc.closingMerit ?? '—'}%${lc.year ? ` (${lc.year})` : ''}`;
                      },
                    },
                    {
                      label: 'Salary range',
                      fn: (p: ComparedProgram) => p.aiSalaryRange || '—',
                    },
                    {
                      label: 'Industry linkages',
                      fn: (p: ComparedProgram) => truncate(p.aiIndustryLinkages, 150),
                    },
                    {
                      label: 'Program strengths',
                      fn: (p: ComparedProgram) => truncate(p.aiProgramStrengths, 200),
                    },
                    {
                      label: 'Career scope',
                      fn: (p: ComparedProgram) => truncate(p.careerScope, 200),
                    },
                  ] as { label: string; fn: (p: ComparedProgram) => ReactNode }[]).map((row) => (
                    <tr key={row.label} className="hover:bg-slate-50/80">
                      <td className="p-3 md:p-4 font-medium text-slate-700 sticky left-0 bg-white z-10 border-r border-slate-100 whitespace-nowrap">
                        {row.label}
                      </td>
                      {resultProgs.map((p) => (
                        <td key={p._id} className="p-3 md:p-4 text-slate-800 align-top">
                          {row.fn(p) as ReactNode}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
