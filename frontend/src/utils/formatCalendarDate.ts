/** Normalize calendar cell dates to "Month D YYYY" (e.g. June 14 2026). */
export function formatCalendarDate(value: string | null | undefined): string {
  if (value == null || value === '' || value === '—' || value === '-') return '-';
  const s = String(value).trim();

  const dmyDot = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (dmyDot) {
    const d = new Date(Number(dmyDot[3]), Number(dmyDot[2]) - 1, Number(dmyDot[1]));
    if (!Number.isNaN(d.getTime())) return toMonthDayYear(d);
  }

  const dmyDash = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmyDash) {
    const d = new Date(Number(dmyDash[3]), Number(dmyDash[2]) - 1, Number(dmyDash[1]));
    if (!Number.isNaN(d.getTime())) return toMonthDayYear(d);
  }

  const rangeParts = s.split(/\s*[–—-]\s*/).filter(Boolean);
  if (rangeParts.length === 2) {
    const a = formatCalendarDate(rangeParts[0]);
    const b = formatCalendarDate(rangeParts[1]);
    if (a !== '-' && b !== '-') return `${a} to ${b}`;
  }

  const withoutWeekday = s.replace(
    /^(?:Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sun|Mon|Tue|Wed|Thu|Fri|Sat)[,\s]+/i,
    ''
  );

  const parsed = new Date(withoutWeekday);
  if (!Number.isNaN(parsed.getTime())) return toMonthDayYear(parsed);

  return s.replace(/,/g, '').replace(/\s+/g, ' ').trim();
}

function toMonthDayYear(d: Date): string {
  const month = d.toLocaleDateString('en-US', { month: 'long' });
  return `${month} ${d.getDate()} ${d.getFullYear()}`;
}
