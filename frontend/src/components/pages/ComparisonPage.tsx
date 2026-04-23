import { motion } from 'motion/react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { GitCompareArrows, Loader2, Info, ExternalLink, X } from 'lucide-react';
import { useState, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import api from '../../services/api';
import { toast } from 'sonner';
import { universityNameLabel, stripUnknownUniversityText } from '../../utils/universityDisplay';
import { getUniversityImage } from '../../utils/universityImage';

interface UniOption {
  _id: string;
  name: string;
  city: string;
}

interface FacilityBlurb {
  label: string;
  blurb: string;
}

interface StudentInsightRow {
  label: string;
  value: string;
}

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

function cleanAiText(s: string | undefined): string {
  return String(s || '').replace(/\*/g, '').trim();
}

function truncate(text: string | undefined, max = 180): string {
  const t = cleanAiText(text);
  if (!t) return '—';
  return t.length <= max ? t : `${t.slice(0, max)}…`;
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

export function ComparisonPage() {
  const [uniOptions, setUniOptions] = useState<UniOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [slot1, setSlot1] = useState('');
  const [slot2, setSlot2] = useState('');
  const [slot3, setSlot3] = useState('');
  const [resultUnis, setResultUnis] = useState<ComparedUniversity[] | null>(null);
  const [loadingCompare, setLoadingCompare] = useState(false);
  const [aiUsed, setAiUsed] = useState<boolean | null>(null);

  const loadUniversities = useCallback(async () => {
    try {
      setLoadingOptions(true);
      // meritPicker: backend returns only _id/name/city (no per-row image resolution) — fast for dropdowns
      const res = await api.get('/universities', {
        params: { limit: 8000, page: 1, meritPicker: 'true', omitPlaceholderUniversities: 'true' },
      });
      if (res.data?.success) setUniOptions(res.data.universities || []);
    } catch {
      toast.error('Could not load universities list');
      setUniOptions([]);
    } finally {
      setLoadingOptions(false);
    }
  }, []);

  useEffect(() => {
    loadUniversities();
  }, [loadUniversities]);

  const usedIds = useMemo(() => new Set([slot1, slot2, slot3].filter(Boolean)), [slot1, slot2, slot3]);

  const runCompare = async () => {
    if (!slot1 || !slot2) {
      toast.error('Select at least two universities');
      return;
    }
    const ids = [slot1, slot2, slot3].filter(Boolean);
    try {
      setLoadingCompare(true);
      const res = await api.post('/comparison', { type: 'universities', ids });
      if (!res.data?.success) {
        toast.error(res.data?.message || 'Comparison failed');
        return;
      }
      setResultUnis(res.data.items || []);
      setAiUsed(res.data.aiUsed === true);
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

  const clearResults = () => { setResultUnis(null); setAiUsed(null); };

  const renderSelect = (value: string, onChange: (v: string) => void, label: string) => (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
        disabled={loadingOptions}
      >
        <option value="">— Select —</option>
        {uniOptions.map((u) => (
          <option key={u._id} value={u._id} disabled={usedIds.has(u._id) && value !== u._id}>
            {universityNameLabel(u.name)}
            {stripUnknownUniversityText(u.city) ? ` · ${stripUnknownUniversityText(u.city)}` : ''}
          </option>
        ))}
      </select>
    </div>
  );

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
              Compare two or three universities with structured facilities, student-focused signals, and category-wise
              fee ranges.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        <Card className="p-6 md:p-8">
          <div className="flex flex-col gap-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-2">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-900">
                Select Option A, Option B, and optionally Option C, then compare.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderSelect(slot1, setSlot1, 'Option A')}
              {renderSelect(slot2, setSlot2, 'Option B')}
              {renderSelect(slot3, setSlot3, 'Option C (optional)')}
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
              {resultUnis && (
                <Button type="button" variant="outline" onClick={clearResults}>
                  <X className="w-4 h-4 mr-2" />
                  Clear results
                </Button>
              )}
            </div>
          </div>
        </Card>

        {resultUnis && aiUsed === false && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <Info className="h-4 w-4 mt-0.5 shrink-0 text-amber-500" />
            <span>
              <strong>AI insights unavailable</strong> — your Gemini API free-tier quota is currently exhausted.
              The data shown below is estimated from our database. Quota resets daily, or you can upgrade at{' '}
              <a href="https://ai.google.dev" target="_blank" rel="noreferrer" className="underline font-medium">ai.google.dev</a>.
            </span>
          </div>
        )}

        {resultUnis && resultUnis.length > 0 && (
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
                    {
                      label: 'HEC ranking',
                      fn: (u: ComparedUniversity) => (u.hecRanking != null ? String(u.hecRanking) : '—'),
                    },
                    {
                      label: 'Programs offer',
                      fn: (u: ComparedUniversity) =>
                        u.programsOffer != null ? String(u.programsOffer) : '—',
                    },
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
                    {
                      label: 'Fees range',
                      fn: (u: ComparedUniversity) => feesRangeCell(u),
                    },
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
      </div>
    </div>
  );
}

