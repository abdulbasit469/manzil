import { motion } from 'motion/react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { GitCompareArrows, Loader2, Info, ExternalLink, X } from 'lucide-react';
import { useState, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import api from '../../services/api';
import { toast } from 'sonner';
import { universityNameLabel, stripUnknownUniversityText } from '../../utils/universityDisplay';
import { getUniversityImage } from '../../utils/universityImage';

type CompareMode = 'universities' | 'programs';

interface UniOption {
  _id: string;
  name: string;
  city: string;
  type?: string;
}

interface ProgramOption {
  _id: string;
  name: string;
  degree: string;
  university?: { _id: string; name: string; city?: string };
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
  email?: string;
  phone?: string;
  address?: string;
  description?: string;
  establishedYear?: number;
  programCount?: number;
  facilitiesList?: string[];
  feeComputingEngSemester?: string;
  feeBusinessSocialSemester?: string;
  feeBsTypicalSemester?: string;
  feeMbbsPerYear?: string;
  feePublicRegularSemester?: string;
  feePublicSelfFinanceSemester?: string;
}

interface MeritCriteriaBlock {
  weightsSummary: string | null;
  entryTestName: string | null;
  entryTestRequired?: boolean;
  entryTestTotalMarks: number | null;
  minimumMatricMarks?: number;
  minimumIntermediateMarks?: number;
  lastClosingMerit?: { year?: number; closingMerit?: number; programName?: string } | null;
}

interface ComparedProgram {
  _id: string;
  name: string;
  degree: string;
  duration?: string;
  feePerSemester?: number;
  totalFee?: number;
  eligibility?: string;
  description?: string;
  careerScope?: string;
  category?: string;
  university?: { name: string; city?: string; type?: string; hecRanking?: number; website?: string };
  meritCriteria?: MeritCriteriaBlock | null;
}

function truncate(text: string | undefined, max = 220): string {
  if (!text) return '—';
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

function formatPkr(n: number | undefined): string {
  if (n == null || Number.isNaN(n)) return '—';
  return `PKR ${n.toLocaleString('en-PK')}`;
}

function generalFeesRangeCell(u: ComparedUniversity): ReactNode {
  const rows = [
    { k: 'Computing / Eng (sem.)', v: u.feeComputingEngSemester },
    { k: 'Business / Social (sem.)', v: u.feeBusinessSocialSemester },
    { k: 'Typical BS (sem.)', v: u.feeBsTypicalSemester },
    { k: 'MBBS (per year)', v: u.feeMbbsPerYear },
    { k: 'Public regular (sem.)', v: u.feePublicRegularSemester },
    { k: 'Public self-finance (sem.)', v: u.feePublicSelfFinanceSemester },
  ].filter((r) => r.v?.trim());
  if (!rows.length) {
    return <span className="text-slate-400">—</span>;
  }
  return (
    <ul className="list-none space-y-1.5 text-xs text-slate-800">
      {rows.map((r) => (
        <li key={r.k}>
          <span className="text-slate-500 font-medium">{r.k}: </span>
          {r.v!.trim()}
        </li>
      ))}
    </ul>
  );
}

export function ComparisonPage() {
  const [mode, setMode] = useState<CompareMode>('universities');
  const [uniOptions, setUniOptions] = useState<UniOption[]>([]);
  const [programOptions, setProgramOptions] = useState<ProgramOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [search, setSearch] = useState('');
  const [slot1, setSlot1] = useState('');
  const [slot2, setSlot2] = useState('');
  const [slot3, setSlot3] = useState('');
  const [resultUnis, setResultUnis] = useState<ComparedUniversity[] | null>(null);
  const [resultProgs, setResultProgs] = useState<ComparedProgram[] | null>(null);
  const [loadingCompare, setLoadingCompare] = useState(false);

  const loadUniversities = useCallback(async () => {
    try {
      setLoadingOptions(true);
      const res = await api.get('/universities', { params: { limit: 800, page: 1 } });
      if (res.data?.success) {
        setUniOptions(res.data.universities || []);
      }
    } catch {
      toast.error('Could not load universities list');
      setUniOptions([]);
    } finally {
      setLoadingOptions(false);
    }
  }, []);

  const loadPrograms = useCallback(async () => {
    try {
      setLoadingOptions(true);
      const res = await api.get('/programs', { params: { limit: 500, page: 1 } });
      if (res.data?.success) {
        setProgramOptions(res.data.programs || []);
      }
    } catch {
      toast.error('Could not load programs list');
      setProgramOptions([]);
    } finally {
      setLoadingOptions(false);
    }
  }, []);

  useEffect(() => {
    if (mode === 'universities') {
      loadUniversities();
    } else {
      loadPrograms();
    }
    setResultUnis(null);
    setResultProgs(null);
    setSlot1('');
    setSlot2('');
    setSlot3('');
    setSearch('');
  }, [mode, loadUniversities, loadPrograms]);

  const filteredUnis = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return uniOptions;
    return uniOptions.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        (u.city && u.city.toLowerCase().includes(q))
    );
  }, [uniOptions, search]);

  const filteredProgs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return programOptions;
    return programOptions.filter((p) => {
      const uniName = p.university?.name || '';
      return (
        p.name.toLowerCase().includes(q) ||
        p.degree.toLowerCase().includes(q) ||
        uniName.toLowerCase().includes(q)
      );
    });
  }, [programOptions, search]);

  const usedIds = useMemo(() => new Set([slot1, slot2, slot3].filter(Boolean)), [slot1, slot2, slot3]);

  const runCompare = async () => {
    if (!slot1 || !slot2) {
      toast.error('Select at least two items to compare');
      return;
    }
    const ids = [slot1, slot2, slot3].filter(Boolean);
    if (ids.length < 2) {
      toast.error('Select at least two items');
      return;
    }
    try {
      setLoadingCompare(true);
      const res = await api.post('/comparison', { type: mode, ids });
      if (!res.data?.success) {
        toast.error(res.data?.message || 'Comparison failed');
        return;
      }
      if (mode === 'universities') {
        setResultUnis(res.data.items);
        setResultProgs(null);
      } else {
        setResultProgs(res.data.items);
        setResultUnis(null);
      }
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Comparison failed';
      toast.error(msg || 'Comparison failed');
    } finally {
      setLoadingCompare(false);
    }
  };

  const clearResults = () => {
    setResultUnis(null);
    setResultProgs(null);
  };

  const renderSelectOptions = (value: string, onChange: (v: string) => void, label: string) => {
    if (mode === 'universities') {
      return (
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
            disabled={loadingOptions}
          >
            <option value="">— Select —</option>
            {filteredUnis.map((u) => (
              <option key={u._id} value={u._id} disabled={usedIds.has(u._id) && value !== u._id}>
                {universityNameLabel(u.name)}
                {stripUnknownUniversityText(u.city) ? ` · ${stripUnknownUniversityText(u.city)}` : ''}
              </option>
            ))}
          </select>
        </div>
      );
    }
    return (
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
          disabled={loadingOptions}
        >
          <option value="">— Select —</option>
          {filteredProgs.map((p) => (
            <option key={p._id} value={p._id} disabled={usedIds.has(p._id) && value !== p._id}>
              {p.name} ({p.degree})
              {p.university?.name ? ` — ${p.university.name}` : ''}
            </option>
          ))}
        </select>
      </div>
    );
  };

  const columns = resultUnis || resultProgs || [];

  return (
    <div className="flex-1 overflow-auto bg-slate-50">
      <div className="bg-gradient-to-r from-[#0f1f3a] via-[#1e3a5f] to-amber-500 text-white p-4 md:p-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl md:text-4xl mb-2 flex items-center gap-2">
              <GitCompareArrows className="w-9 h-9 md:w-10 md:h-10" />
              Comparison Tool
            </h1>
            <p className="text-blue-100 max-w-3xl">
              Compare two or three universities or degree programs side by side — fees, merit criteria (when
              available), facilities, rankings, and scope — to make a clearer choice.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        <Card className="p-6 md:p-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-slate-700 w-full mb-1">What to compare</span>
              {(['universities', 'programs'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    mode === m
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {m === 'universities' ? 'Universities' : 'Degree programs'}
                </button>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-2">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-900">
                Pick <strong>2 or 3</strong> different {mode === 'universities' ? 'universities' : 'programs'}. Merit
                breakdown appears for programs only when your admin has added criteria for that program. Always
                confirm fees and merit on the <strong>official university website</strong>.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Search {mode === 'universities' ? 'universities' : 'programs'}
              </label>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={mode === 'universities' ? 'Filter by name or city…' : 'Filter by program, degree, or university…'}
                className="w-full max-w-md px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderSelectOptions(slot1, setSlot1, 'Option A')}
              {renderSelectOptions(slot2, setSlot2, 'Option B')}
              {renderSelectOptions(slot3, setSlot3, 'Option C (optional)')}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={runCompare}
                disabled={loadingCompare || !slot1 || !slot2}
                className="bg-gradient-to-r from-[#1e3a5f] to-amber-500 text-white"
              >
                {loadingCompare ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Comparing…
                  </>
                ) : (
                  <>
                    <GitCompareArrows className="w-4 h-4 mr-2" />
                    Compare
                  </>
                )}
              </Button>
              {(resultUnis || resultProgs) && (
                <Button type="button" variant="outline" onClick={clearResults}>
                  <X className="w-4 h-4 mr-2" />
                  Clear results
                </Button>
              )}
            </div>
          </div>
        </Card>

        {columns.length > 0 && resultUnis && (
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
                            <div className="font-bold text-slate-900 leading-tight">
                              {universityNameLabel(u.name)}
                            </div>
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
                    { label: 'Type', fn: (u: ComparedUniversity) => u.type || '—' },
                    { label: 'HEC ranking', fn: (u: ComparedUniversity) => (u.hecRanking != null ? `#${u.hecRanking}` : '—') },
                    { label: 'Established', fn: (u: ComparedUniversity) => (u.establishedYear ? String(u.establishedYear) : '—') },
                    { label: 'Programs listed', fn: (u: ComparedUniversity) => (u.programCount != null ? String(u.programCount) : '—') },
                    {
                      label: 'Website',
                      fn: (u: ComparedUniversity) =>
                        u.website ? (
                          <a
                            href={u.website.startsWith('http') ? u.website : `https://${u.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-amber-700 hover:underline inline-flex items-center gap-1"
                          >
                            Link <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          '—'
                        ),
                    },
                    { label: 'Address', fn: (u: ComparedUniversity) => truncate(u.address, 120) },
                    {
                      label: 'Facilities',
                      fn: (u: ComparedUniversity) =>
                        u.facilitiesList?.length ? u.facilitiesList.slice(0, 8).join(' · ') : '—',
                    },
                    { label: 'Description', fn: (u: ComparedUniversity) => truncate(u.description, 200) },
                    { label: 'General fees range', fn: (u: ComparedUniversity) => generalFeesRangeCell(u) },
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

        {columns.length > 0 && resultProgs && (
          <Card className="p-0 overflow-hidden border-slate-200 shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200">
                    <th className="text-left p-3 md:p-4 font-semibold text-slate-600 w-44 sticky left-0 bg-slate-100 z-10 border-r border-slate-200">
                      Attribute
                    </th>
                    {resultProgs.map((p) => (
                      <th key={p._id} className="p-3 md:p-4 text-left align-top min-w-[220px] max-w-[300px]">
                        <div className="font-bold text-slate-900 leading-tight">{p.name}</div>
                        <div className="text-xs text-amber-700 font-medium mt-1">{p.degree}</div>
                        <div className="text-xs text-slate-500 mt-1">
                          {p.university?.name ? universityNameLabel(p.university.name) : '—'}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {[
                    {
                      label: 'University city',
                      fn: (p: ComparedProgram) => stripUnknownUniversityText(p.university?.city) || '—',
                    },
                    {
                      label: 'University type',
                      fn: (p: ComparedProgram) => p.university?.type || '—',
                    },
                    {
                      label: 'Uni HEC rank',
                      fn: (p: ComparedProgram) =>
                        p.university?.hecRanking != null ? `#${p.university.hecRanking}` : '—',
                    },
                    {
                      label: 'Category',
                      fn: (p: ComparedProgram) => p.category || '—',
                    },
                    {
                      label: 'Duration',
                      fn: (p: ComparedProgram) => p.duration || '—',
                    },
                    {
                      label: 'Fee / semester',
                      fn: (p: ComparedProgram) => formatPkr(p.feePerSemester),
                    },
                    {
                      label: 'Total fee (if set)',
                      fn: (p: ComparedProgram) => formatPkr(p.totalFee),
                    },
                    {
                      label: 'Eligibility',
                      fn: (p: ComparedProgram) => truncate(p.eligibility, 180),
                    },
                    {
                      label: 'Career scope',
                      fn: (p: ComparedProgram) => truncate(p.careerScope, 220),
                    },
                    {
                      label: 'Description',
                      fn: (p: ComparedProgram) => truncate(p.description, 180),
                    },
                    {
                      label: 'Merit formula (DB)',
                      fn: (p: ComparedProgram) =>
                        p.meritCriteria?.weightsSummary || (
                          <span className="text-slate-400">Not in database — use Merit Calculator</span>
                        ),
                    },
                    {
                      label: 'Entry test',
                      fn: (p: ComparedProgram) =>
                        p.meritCriteria?.entryTestName
                          ? `${p.meritCriteria.entryTestName}${p.meritCriteria.entryTestTotalMarks ? ` (out of ${p.meritCriteria.entryTestTotalMarks})` : ''}`
                          : '—',
                    },
                    {
                      label: 'Min matric / inter (criteria)',
                      fn: (p: ComparedProgram) => {
                        const m = p.meritCriteria;
                        if (!m) return '—';
                        const a = m.minimumMatricMarks ? `${m.minimumMatricMarks} matric` : '';
                        const b = m.minimumIntermediateMarks ? `${m.minimumIntermediateMarks} inter` : '';
                        return [a, b].filter(Boolean).join(' · ') || '—';
                      },
                    },
                    {
                      label: 'Last closing merit (trend)',
                      fn: (p: ComparedProgram) => {
                        const t = p.meritCriteria?.lastClosingMerit;
                        if (!t?.closingMerit) return '—';
                        return `${t.closingMerit}%${t.year ? ` (${t.year})` : ''}`;
                      },
                    },
                    {
                      label: 'University site',
                      fn: (p: ComparedProgram) => {
                        const w = p.university?.website;
                        if (!w) return '—';
                        const href = w.startsWith('http') ? w : `https://${w}`;
                        return (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-amber-700 hover:underline inline-flex items-center gap-1"
                          >
                            Link <ExternalLink className="w-3 h-3" />
                          </a>
                        );
                      },
                    },
                  ].map((row) => (
                    <tr key={row.label} className="hover:bg-slate-50/80">
                      <td className="p-3 md:p-4 font-medium text-slate-700 sticky left-0 bg-white z-10 border-r border-slate-100">
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
