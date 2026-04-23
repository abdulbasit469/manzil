/**
 * Lightweight in-memory cache with TTL.
 * Keeps frequently-requested, rarely-changing data (university list, cities)
 * out of repeated MongoDB round-trips to Atlas.
 */
const _store = new Map();

/**
 * Return cached value for key, or null if missing / expired.
 */
function getCached(key) {
  const item = _store.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    _store.delete(key);
    return null;
  }
  return item.data;
}

/**
 * Store value under key with a TTL in milliseconds (default 2 minutes).
 */
function setCached(key, data, ttlMs = 120_000) {
  _store.set(key, { data, expiresAt: Date.now() + ttlMs });
}

/**
 * Delete all cache entries whose key starts with the given prefix.
 * Call this after admin create/update/delete operations.
 */
function invalidatePrefix(prefix) {
  for (const key of _store.keys()) {
    if (key.startsWith(prefix)) _store.delete(key);
  }
}

module.exports = { getCached, setCached, invalidatePrefix };
