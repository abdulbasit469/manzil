import { Card } from '../ui/card';
import { Calendar, GraduationCap, Scale, BookOpen, FileText } from 'lucide-react';
import { formatCalendarDate } from '../../utils/formatCalendarDate';

/* eslint-disable @typescript-eslint/no-explicit-any -- API-driven nested calendar JSON */

type Props = { calendar: any };

const TABLE_CLASS = 'w-full table-fixed border-collapse text-xs';
const TH_CLASS =
  'p-2 text-left text-black font-bold bg-slate-100 border border-slate-200 whitespace-nowrap';
const TD_CLASS = 'p-2 border border-slate-200 align-top text-slate-800';
const EMPTY_CELL = '-';

/** Remove em/en dashes from visible copy (reads more natural, less template-like). */
function cleanDisplayText(value: string | null | undefined): string {
  if (value == null) return '';
  return String(value)
    .replace(/\s*[—–]\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const MILESTONE_COLGROUP = (
  <colgroup>
    <col style={{ width: '4%' }} />
    <col style={{ width: '19%' }} />
    <col style={{ width: '19%' }} />
    <col style={{ width: '19%' }} />
    <col style={{ width: '19%' }} />
    <col style={{ width: '20%' }} />
  </colgroup>
);

const MILESTONE_HEADERS = [
  { label: '#', keys: ['cycle'] as const },
  { label: 'Announcement', keys: ['announcement'] as const },
  { label: 'Registration last', keys: ['registrationLast', 'col2'] as const },
  { label: 'Roll slip', keys: ['rollSlip', 'col3'] as const },
  { label: 'Test date', keys: ['testDate'] as const },
  { label: 'Result', keys: ['resultDate'] as const },
];

function cellValue(row: Record<string, string>, keys: readonly string[]): string {
  for (const k of keys) {
    if (k === 'cycle') continue;
    const v = row[k];
    if (v != null && String(v).trim() !== '') return formatCalendarDate(String(v));
  }
  return EMPTY_CELL;
}

function MilestoneTable({ rows, rowKey }: { rows: any[]; rowKey: 'cycle' }) {
  if (!rows?.length) return null;
  return (
    <table className={TABLE_CLASS}>
      {MILESTONE_COLGROUP}
      <thead>
        <tr>
          {MILESTONE_HEADERS.map((h) => (
            <th key={h.label} className={TH_CLASS}>
              {h.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r: any, i: number) => (
          <tr key={r[rowKey]} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
            <td className={`${TD_CLASS} font-semibold`}>{r[rowKey]}</td>
            {MILESTONE_HEADERS.slice(1).map((h) => (
              <td key={h.label} className={TD_CLASS}>
                {cellValue(r, h.keys)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function TestCalendar2026({ calendar }: Props) {
  if (!calendar?.ecatUet) return null;

  const nat = calendar.nat;
  const lat = calendar.lat;
  const lawGat = calendar.lawGat;
  const usat = calendar.usat;
  const hat = calendar.hat;

  return (
    <Card className="p-4 md:p-6 border-t-4 border-emerald-600 shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-slate-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-emerald-600" />
            Test and admission calendar ( 2026 Session )
          </h2>
        </div>
      </div>

      <div className="space-y-4">
        <details className="group border border-slate-200 rounded-lg open:shadow-sm" open>
          <summary className="cursor-pointer px-4 py-3 font-medium text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-lg list-none flex items-center gap-2 [&::-webkit-details-marker]:hidden">
            <GraduationCap className="w-4 h-4 text-rose-600" />
            MDCAT and NUST NET ( 2026 Session )
          </summary>
          <div className="p-4 border-t border-slate-100 grid md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-rose-100 bg-rose-50/50 p-3">
              <p className="font-semibold text-rose-900">MDCAT ( 2026 Session )</p>
              <p className="text-sm text-slate-800 mt-1">
                Expected test:{' '}
                <strong>{formatCalendarDate(calendar.mdcat?.expectedTestDate)}</strong>
              </p>
            </div>
            <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-3">
              <p className="font-semibold text-indigo-900">NUST NET ( 2026 Session )</p>
              <ul className="mt-2 space-y-2 text-sm">
                {(calendar.nustNet || []).map((n: any) => (
                  <li key={n.series}>
                    <span className="font-medium">{cleanDisplayText(n.series)}:</span>{' '}
                    {cleanDisplayText(n.window)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </details>

        <details className="group border border-slate-200 rounded-lg" open>
          <summary className="cursor-pointer px-4 py-3 font-medium text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-lg list-none flex items-center gap-2 [&::-webkit-details-marker]:hidden">
            <FileText className="w-4 h-4 text-blue-600" />
            ECAT ( 2026 Session )
          </summary>
          <div className="p-4 border-t border-slate-100">
            <p className="text-sm font-medium text-slate-900">
              Test date is <span className="font-semibold text-blue-800">April 3 2026</span>.
            </p>
          </div>
        </details>

        {nat?.rows?.length > 0 && (
          <details className="group border border-slate-200 rounded-lg">
            <summary className="cursor-pointer px-4 py-3 font-medium text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-lg list-none flex items-center gap-2 [&::-webkit-details-marker]:hidden">
              <BookOpen className="w-4 h-4 text-teal-600" />
              NTS NAT ( 2026 Session )
            </summary>
            <div className="p-2 border-t border-slate-100 overflow-x-auto">
              <table className={`${TABLE_CLASS} min-w-[900px]`}>
                <thead>
                  <tr>
                    <th className={`${TH_CLASS} rounded-tl-lg`}>Test</th>
                    {nat.columnKeys?.map((k: string) => (
                      <th key={k} className={TH_CLASS}>
                        {cleanDisplayText(nat.columnLabels?.[k] || k)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {nat.rows.map((row: any, i: number) => (
                    <tr key={row.name} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className={`${TD_CLASS} font-semibold`}>{row.name}</td>
                      {nat.columnKeys?.map((k: string) => (
                        <td key={k} className={TD_CLASS}>
                          {formatCalendarDate(row[k] || EMPTY_CELL)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        )}

        <details className="group border border-slate-200 rounded-lg">
          <summary className="cursor-pointer px-4 py-3 font-medium text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-lg list-none flex items-center gap-2 [&::-webkit-details-marker]:hidden">
            <Scale className="w-4 h-4 text-violet-600" />
            LAT and law graduate admissions ( 2026 Session )
          </summary>
          <div className="p-4 border-t border-slate-100 space-y-6">
            <div>
              <p className="font-semibold text-slate-800 mb-2">LAT ( 2026 Session )</p>
              <div className="overflow-x-auto">
                <MilestoneTable rows={lat.rows} rowKey="cycle" />
              </div>
            </div>
            <div>
              <p className="font-semibold text-slate-800 mb-2">Law graduate admission test ( 2026 Session )</p>
              <div className="overflow-x-auto">
                <MilestoneTable rows={lawGat.rows} rowKey="cycle" />
              </div>
            </div>
          </div>
        </details>

        <details className="group border border-slate-200 rounded-lg">
          <summary className="cursor-pointer px-4 py-3 font-medium text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-lg list-none flex items-center gap-2 [&::-webkit-details-marker]:hidden">
            <BookOpen className="w-4 h-4 text-amber-700" />
            USAT and HAT ( 2026 Session )
          </summary>
          <div className="p-4 border-t border-slate-100 space-y-6">
            <div>
              <p className="font-semibold text-slate-800 mb-2">USAT ( 2026 Session )</p>
              <div className="overflow-x-auto">
                <MilestoneTable rows={usat.rows} rowKey="cycle" />
              </div>
            </div>
            <div>
              <p className="font-semibold text-slate-800 mb-2">HAT ( 2026 Session )</p>
              <div className="overflow-x-auto">
                <MilestoneTable rows={hat.rows} rowKey="cycle" />
              </div>
            </div>
          </div>
        </details>
      </div>
    </Card>
  );
}
