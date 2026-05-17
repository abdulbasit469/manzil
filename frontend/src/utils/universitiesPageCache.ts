import {
  consumeUniversitiesCareerHint,
  searchQueryForCareer,
  type CareerUniversityHint,
} from './careerUniversityNav';
import { getPrefetchedUniversitiesList } from './universitiesListPrefetch';

export const UNIVERSITIES_CACHE_TTL_MS = 120_000;
export const UNIVERSITIES_CACHE_STORAGE_KEY = 'universities-page-cache-v1';

export type UniversitiesListCacheEntry = {
  universities: unknown[];
  totalPages: number;
};

export function loadUniversitiesCacheMap(): Map<string, UniversitiesListCacheEntry> {
  try {
    const raw = sessionStorage.getItem(UNIVERSITIES_CACHE_STORAGE_KEY);
    if (!raw) return new Map();
    const parsed = JSON.parse(raw) as {
      at?: number;
      entries?: [string, UniversitiesListCacheEntry][];
    };
    const isFresh =
      typeof parsed?.at === 'number' && Date.now() - parsed.at < UNIVERSITIES_CACHE_TTL_MS;
    if (!isFresh || !Array.isArray(parsed?.entries)) return new Map();
    return new Map(parsed.entries);
  } catch {
    return new Map();
  }
}

export function persistUniversitiesCacheMap(map: Map<string, UniversitiesListCacheEntry>): void {
  try {
    const entries = Array.from(map.entries()).slice(-24);
    sessionStorage.setItem(
      UNIVERSITIES_CACHE_STORAGE_KEY,
      JSON.stringify({ at: Date.now(), entries })
    );
  } catch {
    /* ignore quota */
  }
}

export function listCacheKey(
  page: number,
  search: string,
  city: string,
  type: string
): string {
  return JSON.stringify({ page, search, city, type });
}

export type UniversitiesPageInit = {
  universities: unknown[];
  totalPages: number;
  loading: boolean;
  searchQuery: string;
  debouncedSearch: string;
  careerFilterBanner: CareerUniversityHint | null;
  cacheMap: Map<string, UniversitiesListCacheEntry>;
};

/** One-time read on mount: career hint + session list cache for instant paint. */
export function computeUniversitiesPageInit(): UniversitiesPageInit {
  const cacheMap = loadUniversitiesCacheMap();
  const hint = consumeUniversitiesCareerHint();
  const debouncedSearch = hint ? searchQueryForCareer(hint.field, hint.program) : '';
  const key = listCacheKey(1, debouncedSearch, 'All Cities', 'All Types');
  const cached = cacheMap.get(key) ?? getPrefetchedUniversitiesList(key);

  return {
    universities: cached?.universities ?? [],
    totalPages: cached?.totalPages ?? 1,
    loading: !cached,
    searchQuery: debouncedSearch,
    debouncedSearch,
    careerFilterBanner: hint,
    cacheMap,
  };
}
