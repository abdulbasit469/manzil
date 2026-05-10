const { buildProgramDisplayTitle } = require('./flagshipProgram');

/** Collapse "BA BA", "B.Arch B.Arch", "Associate Associate" in the degree string. */
function collapseAdjacentDuplicateTokens(str) {
  const parts = String(str || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const out = [];
  for (const p of parts) {
    if (out.length && out[out.length - 1].toLowerCase() === p.toLowerCase()) continue;
    out.push(p);
  }
  return out.join(' ').trim();
}

/**
 * Remove only when the degree token sequence is repeated back-to-back at the start of the name
 * (e.g. "BA BA English" + degree "BA" → "BA English"). A single leading "BA" before "English" is kept.
 */
function stripRedundantDegreePrefixFromName(degreeClean, nameRaw) {
  const nameClean = String(nameRaw || '').trim();
  if (!degreeClean || !nameClean) return nameClean;
  const dt = degreeClean.split(/\s+/).filter(Boolean);
  if (!dt.length) return nameClean;
  let tokens = nameClean.split(/\s+/).filter(Boolean);
  while (tokens.length >= dt.length * 2) {
    const chunk1 = tokens.slice(0, dt.length);
    const chunk2 = tokens.slice(dt.length, dt.length * 2);
    let double = true;
    for (let j = 0; j < dt.length; j++) {
      if (chunk1[j]?.toLowerCase() !== dt[j]?.toLowerCase()) {
        double = false;
        break;
      }
      if (chunk2[j]?.toLowerCase() !== dt[j]?.toLowerCase()) {
        double = false;
        break;
      }
    }
    if (!double) break;
    tokens = tokens.slice(dt.length);
  }
  const rest = tokens.join(' ').trim();
  return rest || nameClean;
}

/**
 * Normalizes degree/name for API responses and listings (fixes duplicate degree tokens and repeated degree in name).
 * @returns {{ degree: string, name: string, displayTitle: string }}
 */
function normalizeProgramFieldsForApi(degree, name) {
  const degreeClean = collapseAdjacentDuplicateTokens(degree);
  let nameClean = String(name || '').trim();
  nameClean = stripRedundantDegreePrefixFromName(degreeClean, nameClean);
  const displayTitle = buildProgramDisplayTitle(degreeClean, nameClean);
  return {
    degree: degreeClean,
    name: nameClean,
    displayTitle: displayTitle || degreeClean || nameClean,
  };
}

module.exports = {
  collapseAdjacentDuplicateTokens,
  stripRedundantDegreePrefixFromName,
  normalizeProgramFieldsForApi,
};
