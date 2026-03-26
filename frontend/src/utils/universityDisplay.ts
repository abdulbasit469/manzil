/**
 * Strip leading "Unknown " or a lone "Unknown" from university name/city (import leftovers).
 * Matches backend `sanitizeUniversityStrings.js` behavior.
 */
export function stripUnknownUniversityText(value: string | undefined | null): string {
  if (value == null || typeof value !== 'string') return '';
  const t = value.trim();
  if (/^unknown$/i.test(t)) return '';
  return t.replace(/^unknown\s+/i, '').trim();
}

export function universityNameLabel(name: string | undefined | null): string {
  const s = stripUnknownUniversityText(name ?? '');
  return s || '—';
}

export function universityCityLabel(city: string | undefined | null): string {
  const s = stripUnknownUniversityText(city ?? '');
  return s || 'N/A';
}
