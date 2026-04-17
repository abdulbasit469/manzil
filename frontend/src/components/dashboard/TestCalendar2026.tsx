import { Card } from '../ui/card';
import { Calendar, GraduationCap, Scale, BookOpen, FileText } from 'lucide-react';

/* eslint-disable @typescript-eslint/no-explicit-any -- API-driven nested calendar JSON */

type Props = { calendar: any };

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
            2026 test & admission calendar
          </h2>
          <p className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-md p-2 mt-2">
            {calendar.sourceNote}
          </p>
        </div>
        <p className="text-[10px] text-slate-500 max-w-md">
          ECAT: UET portal · NAT: NTS · LAT/LAW-GAT/USAT/HAT: verify HEC / law authority sites · MDCAT: PMC
        </p>
      </div>

      <div className="space-y-4">
        {/* MDCAT + NUST NET */}
        <details className="group border border-slate-200 rounded-lg open:shadow-sm" open>
          <summary className="cursor-pointer px-4 py-3 font-medium text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-lg list-none flex items-center gap-2 [&::-webkit-details-marker]:hidden">
            <GraduationCap className="w-4 h-4 text-rose-600" />
            MDCAT & NUST NET (2026)
          </summary>
          <div className="p-4 border-t border-slate-100 grid md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-rose-100 bg-rose-50/50 p-3">
              <p className="font-semibold text-rose-900">MDCAT 2026</p>
              <p className="text-sm text-slate-800 mt-1">
                Expected test: <strong>{calendar.mdcat?.expectedTestDate}</strong>
              </p>
              <p className="text-xs text-slate-600 mt-2">{calendar.mdcat?.note}</p>
            </div>
            <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-3">
              <p className="font-semibold text-indigo-900">NUST NET</p>
              <ul className="mt-2 space-y-2 text-sm">
                {(calendar.nustNet || []).map((n: any) => (
                  <li key={n.series}>
                    <span className="font-medium">{n.series}:</span> {n.window}
                    <span className="block text-xs text-slate-600">{n.note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </details>

        {/* ECAT UET */}
        <details className="group border border-slate-200 rounded-lg" open>
          <summary className="cursor-pointer px-4 py-3 font-medium text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-lg list-none flex items-center gap-2 [&::-webkit-details-marker]:hidden">
            <FileText className="w-4 h-4 text-blue-600" />
            ECAT — {calendar.ecatUet.title}
          </summary>
          <div className="p-4 border-t border-slate-100">
            <p className="text-sm font-medium text-slate-900 rounded-lg border border-blue-100 bg-blue-50/80 px-4 py-3">
              ECAT exam window (2026 session): <span className="text-blue-800">March 30 – April 3</span>
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Confirm exact dates, venues, and steps on the official UET admissions portal.
            </p>
          </div>
        </details>

        {/* NAT */}
        {nat?.rows?.length > 0 && (
          <details className="group border border-slate-200 rounded-lg">
            <summary className="cursor-pointer px-4 py-3 font-medium text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-lg list-none flex items-center gap-2 [&::-webkit-details-marker]:hidden">
              <BookOpen className="w-4 h-4 text-teal-600" />
              {nat.title} (NAT-I — NAT-XII)
            </summary>
            <div className="p-2 border-t border-slate-100 overflow-x-auto">
              <table className="min-w-[900px] w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-teal-700 text-white text-left">
                    <th className="p-2 rounded-tl-lg">Test</th>
                    {nat.columnKeys?.map((k: string) => (
                      <th key={k} className="p-2 whitespace-nowrap">
                        {nat.columnLabels?.[k] || k}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {nat.rows.map((row: any, i: number) => (
                    <tr key={row.name} className={i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                      <td className="p-2 font-medium border-b border-slate-100">{row.name}</td>
                      {nat.columnKeys?.map((k: string) => (
                        <td key={k} className="p-2 border-b border-slate-100 whitespace-nowrap">
                          {row[k] || '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        )}

        {/* LAT + LAW-GAT */}
        <details className="group border border-slate-200 rounded-lg">
          <summary className="cursor-pointer px-4 py-3 font-medium text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-lg list-none flex items-center gap-2 [&::-webkit-details-marker]:hidden">
            <Scale className="w-4 h-4 text-violet-600" />
            LAT & LAW-GAT (2026)
          </summary>
          <div className="p-4 border-t border-slate-100 space-y-6">
            <div>
              <p className="font-semibold text-slate-800 mb-2">{lat.title}</p>
              <div className="overflow-x-auto">
                <table className="min-w-[640px] w-full text-xs">
                  <thead>
                    <tr className="bg-violet-700 text-white">
                      <th className="p-2 text-left">#</th>
                      <th className="p-2 text-left">Announcement</th>
                      <th className="p-2 text-left">Reg. last</th>
                      <th className="p-2 text-left">Roll slip</th>
                      <th className="p-2 text-left">Test</th>
                      <th className="p-2 text-left">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lat.rows?.map((r: any) => (
                      <tr key={r.cycle} className="border-b border-slate-100">
                        <td className="p-2 font-medium">{r.cycle}</td>
                        <td className="p-2">{r.announcement}</td>
                        <td className="p-2">{r.registrationLast}</td>
                        <td className="p-2">{r.rollSlip}</td>
                        <td className="p-2">{r.testDate}</td>
                        <td className="p-2">{r.resultDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <p className="font-semibold text-slate-800 mb-2">{lawGat.title}</p>
              <div className="overflow-x-auto">
                <table className="min-w-[640px] w-full text-xs">
                  <thead>
                    <tr className="bg-slate-700 text-white">
                      <th className="p-2 text-left">#</th>
                      <th className="p-2 text-left">Announcement</th>
                      <th className="p-2 text-left">Reg. last</th>
                      <th className="p-2 text-left">Roll slip</th>
                      <th className="p-2 text-left">Test</th>
                      <th className="p-2 text-left">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lawGat.rows?.map((r: any) => (
                      <tr key={r.cycle} className="border-b border-slate-100">
                        <td className="p-2 font-medium">{r.cycle}</td>
                        <td className="p-2">{r.announcement}</td>
                        <td className="p-2">{r.registrationLast}</td>
                        <td className="p-2">{r.rollSlip}</td>
                        <td className="p-2">{r.testDate}</td>
                        <td className="p-2">{r.resultDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </details>

        {/* USAT + HAT */}
        <details className="group border border-slate-200 rounded-lg">
          <summary className="cursor-pointer px-4 py-3 font-medium text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-lg list-none flex items-center gap-2 [&::-webkit-details-marker]:hidden">
            <BookOpen className="w-4 h-4 text-amber-700" />
            USAT & HAT — HEC 2026 cycles
          </summary>
          <div className="p-4 border-t border-slate-100 space-y-6">
            <div>
              <p className="font-semibold text-slate-800">{usat.title}</p>
              <p className="text-xs text-slate-600 mb-2">{usat.note}</p>
              <div className="overflow-x-auto">
                <table className="min-w-[560px] w-full text-xs">
                  <thead>
                    <tr className="bg-amber-700 text-white">
                      <th className="p-2">Cycle</th>
                      <th className="p-2">Date 1</th>
                      <th className="p-2">Date 2</th>
                      <th className="p-2">Date 3</th>
                      <th className="p-2">Date 4 (test)</th>
                      <th className="p-2">Date 5 (result)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usat.rows?.map((r: any) => (
                      <tr key={r.cycle} className="border-b border-slate-100">
                        <td className="p-2 font-medium">{r.cycle}</td>
                        <td className="p-2">{r.announcement}</td>
                        <td className="p-2">{r.col2}</td>
                        <td className="p-2">{r.col3}</td>
                        <td className="p-2">{r.testDate}</td>
                        <td className="p-2">{r.resultDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <p className="font-semibold text-slate-800">{hat.title}</p>
              <p className="text-xs text-slate-600 mb-2">{hat.note}</p>
              <div className="overflow-x-auto">
                <table className="min-w-[560px] w-full text-xs">
                  <thead>
                    <tr className="bg-amber-900 text-white">
                      <th className="p-2">Cycle</th>
                      <th className="p-2">Date 1</th>
                      <th className="p-2">Date 2</th>
                      <th className="p-2">Date 3</th>
                      <th className="p-2">Date 4 (test)</th>
                      <th className="p-2">Date 5 (result)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hat.rows?.map((r: any) => (
                      <tr key={r.cycle} className="border-b border-slate-100">
                        <td className="p-2 font-medium">{r.cycle}</td>
                        <td className="p-2">{r.announcement}</td>
                        <td className="p-2">{r.col2}</td>
                        <td className="p-2">{r.col3}</td>
                        <td className="p-2">{r.testDate}</td>
                        <td className="p-2">{r.resultDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </details>
      </div>
    </Card>
  );
}
