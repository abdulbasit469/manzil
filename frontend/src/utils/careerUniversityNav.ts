import { prefetchUniversitiesList } from './universitiesListPrefetch';

/** Session hint when navigating from career assessment → universities explorer. */
export const UNIVERSITIES_CAREER_HINT_KEY = 'manzil_universitiesCareerHint';

export type CareerUniversityHint = {
  field: string;
  program?: string;
  label: string;
};

/** Field-level “Explore universities for …” uses the career name in search (same as the button label). */
const CAREER_FIELD_SEARCH: Record<string, string> = {
  Engineering: 'Engineering',
  Medical: 'Medical',
  Business: 'Business',
  'Computer Science': 'Computer Science',
  Arts: 'Arts',
  Finance: 'Finance',
  Teaching: 'Teaching',
};

/** Build API search text from career field and optional degree program name. */
export function searchQueryForCareer(field: string, program?: string): string {
  if (program?.trim()) {
    const p = program.trim();
    const stripped = p.replace(/^(BS|BE|BBA|MBA|MBBS|Pharm-D|M\.?Ed|B\.?Ed)\s+/i, '').trim();
    return stripped || p;
  }
  return CAREER_FIELD_SEARCH[field] || field;
}

export function setUniversitiesCareerHint(hint: CareerUniversityHint): void {
  try {
    sessionStorage.setItem(UNIVERSITIES_CAREER_HINT_KEY, JSON.stringify(hint));
  } catch {
    /* ignore */
  }
}

export function consumeUniversitiesCareerHint(): CareerUniversityHint | null {
  try {
    const raw = sessionStorage.getItem(UNIVERSITIES_CAREER_HINT_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(UNIVERSITIES_CAREER_HINT_KEY);
    const parsed = JSON.parse(raw) as CareerUniversityHint;
    if (parsed?.field && parsed?.label) return parsed;
    return null;
  } catch {
    return null;
  }
}

export function navigateToUniversitiesFromCareer(
  onPageChange: ((page: string) => void) | undefined,
  field: string,
  program?: string
): void {
  const searchTerm = searchQueryForCareer(field, program);
  const label = program?.trim()
    ? `${field} — ${program.trim()}`
    : `${field} programs`;
  setUniversitiesCareerHint({ field, program, label });
  void prefetchUniversitiesList(1, searchTerm, 'All Cities', 'All Types');
  onPageChange?.('universities');
}
