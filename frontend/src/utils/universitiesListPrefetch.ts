import api from '../services/api';
import {
  listCacheKey,
  type UniversitiesListCacheEntry,
  UNIVERSITIES_CACHE_TTL_MS,
} from './universitiesPageCache';

type UniversitiesApiPayload = {
  success: boolean;
  universities?: unknown[];
  totalPages?: number;
};

const memory = new Map<string, { entry: UniversitiesListCacheEntry; at: number }>();
const inflight = new Map<string, Promise<UniversitiesListCacheEntry | null>>();

function paramsFromKey(cacheKey: string): {
  page: number;
  search: string;
  city: string;
  type: string;
} {
  try {
    return JSON.parse(cacheKey) as { page: number; search: string; city: string; type: string };
  } catch {
    return { page: 1, search: '', city: 'All Cities', type: 'All Types' };
  }
}

function entryFromPayload(data: UniversitiesApiPayload): UniversitiesListCacheEntry | null {
  if (!data?.success) return null;
  const universities = (data.universities || []).map((uni: any) => ({
    ...uni,
    type: uni?.type || 'Public',
  }));
  return {
    universities,
    totalPages: data.totalPages || 1,
  };
}

/** Read warmed list (dashboard prefetch or prior fetch in this tab). */
export function getPrefetchedUniversitiesList(cacheKey: string): UniversitiesListCacheEntry | null {
  const hit = memory.get(cacheKey);
  if (!hit) return null;
  if (Date.now() - hit.at > UNIVERSITIES_CACHE_TTL_MS) {
    memory.delete(cacheKey);
    return null;
  }
  return hit.entry;
}

export function primeUniversitiesListCache(cacheKey: string, entry: UniversitiesListCacheEntry): void {
  memory.set(cacheKey, { entry, at: Date.now() });
}

/** Prefetch on dashboard load; Universities page reuses the same promise/data. */
export function prefetchUniversitiesList(
  page = 1,
  search = '',
  city = 'All Cities',
  type = 'All Types'
): Promise<UniversitiesListCacheEntry | null> {
  const cacheKey = listCacheKey(page, search, city, type);
  const existing = getPrefetchedUniversitiesList(cacheKey);
  if (existing) return Promise.resolve(existing);

  const running = inflight.get(cacheKey);
  if (running) return running;

  const { page: p, search: s, city: c, type: t } = paramsFromKey(cacheKey);
  const params: Record<string, string | number> = { page: p, limit: 12 };
  if (s) params.search = s;
  if (c && c !== 'All Cities') params.city = c;
  if (t && t !== 'All Types') params.type = t;

  const promise = api
    .get('/universities', { params })
    .then((res) => {
      const entry = entryFromPayload(res.data as UniversitiesApiPayload);
      if (entry) primeUniversitiesListCache(cacheKey, entry);
      return entry;
    })
    .catch(() => null)
    .finally(() => {
      inflight.delete(cacheKey);
    });

  inflight.set(cacheKey, promise);
  return promise;
}

export const DEFAULT_UNIVERSITIES_LIST_KEY = listCacheKey(1, '', 'All Cities', 'All Types');
