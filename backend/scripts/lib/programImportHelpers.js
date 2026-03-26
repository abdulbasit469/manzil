/**
 * Helpers for bulk university program import (Pakistan HEC-style listings).
 */

function mapGroupToCategory(group) {
  const g = (group || '').toLowerCase();
  if (
    g.includes('engineering') ||
    g.includes('technology') ||
    g.includes('maritime') ||
    g.includes('aviation') ||
    g.includes('architecture') ||
    g.includes('textile engineering')
  ) {
    return 'Engineering';
  }
  if (
    g.includes('medical') ||
    g.includes('clinical') ||
    g.includes('health') ||
    g.includes('nursing') ||
    g.includes('dentistry') ||
    g.includes('pharm') ||
    g.includes('mbbs') ||
    g.includes('bds') ||
    g.includes('dpt') ||
    g.includes('dvm') ||
    g.includes('midwifery') ||
    g.includes('allied health') ||
    g.includes('therapy') ||
    g.includes('laboratory') ||
    g.includes('radiography') ||
    g.includes('nutrition') ||
    g.includes('veterinary')
  ) {
    return 'Medical';
  }
  if (
    g.includes('computing') ||
    g.includes('computer') ||
    g.includes('software') ||
    g.includes('it ') ||
    g === 'it' ||
    g.includes(' cyber') ||
    g.includes('data science') ||
    g.includes('information technology')
  ) {
    return 'Computer Science';
  }
  if (
    g.includes('business') ||
    g.includes('management') ||
    g.includes('commerce') ||
    g.includes('accounting') ||
    g.includes('finance') ||
    g.includes('tourism') ||
    g.includes('hospitality') ||
    g.includes('mba') ||
    g.includes('bba')
  ) {
    return 'Business';
  }
  if (g.includes('law') || g.includes('llb') || g.includes('shariah')) {
    return 'Law';
  }
  if (
    g.includes('social') ||
    g.includes('psychology') ||
    g.includes('economics') ||
    g.includes('media') ||
    g.includes('communication') ||
    g.includes('international relations') ||
    g.includes('political') ||
    g.includes('anthropology') ||
    g.includes('sociology') ||
    g.includes('education') && !g.includes('engineering')
  ) {
    return 'Social Sciences';
  }
  if (
    g.includes('art') ||
    g.includes('design') ||
    g.includes('humanities') ||
    g.includes('languages') ||
    g.includes('literature') ||
    g.includes('fine arts') ||
    g.includes('music') ||
    g.includes('theatre')
  ) {
    return 'Arts';
  }
  if (g.includes('science') || g.includes('physics') || g.includes('chemistry') || g.includes('mathematics') || g.includes('biology')) {
    return 'Other';
  }
  return 'Other';
}

function inferDegree(programName) {
  let s = (programName || '').trim();
  if (!s) return 'Other';
  if (s.includes('/') && /^(BS|MS|BE|BA|BBA|PhD)/i.test(s.split('/')[0])) {
    s = s.split('/')[0].trim();
  }
  const lower = s.toLowerCase();
  if (lower.startsWith('pharm-d') || lower.startsWith('pharm-d')) return 'Pharm-D';
  if (lower.startsWith('mbbs')) return 'MBBS';
  if (lower.startsWith('bds')) return 'BDS';
  if (lower.startsWith('dpt')) return 'DPT';
  if (lower.startsWith('dvm')) return 'DVM';
  if (lower.startsWith('bsn') || /^bs\s+nursing/i.test(s)) return 'BSN';
  if (lower.startsWith('b.arch') || lower.startsWith('b.arch')) return 'B.Arch';
  if (lower.startsWith('llb')) return 'LLB';
  if (lower.startsWith('ba-llb') || lower.startsWith('ba–llb')) return 'BA-LLB';
  if (lower.startsWith('mba')) return 'MBA';
  if (lower.startsWith('bba')) return 'BBA';
  if (lower.startsWith('m.phil') || lower.startsWith('mphil')) return 'M.Phil';
  if (lower.startsWith('phd') || lower.startsWith('ph.d')) return 'PhD';
  if (lower.startsWith('ms ')) return 'MS';
  if (lower.startsWith('ma ')) return 'MA';
  if (lower.startsWith('m.ed')) return 'M.Ed';
  if (lower.startsWith('b.ed')) return 'B.Ed';
  if (lower.startsWith('be ')) return 'BE';
  if (lower.startsWith('me ')) return 'ME';
  if (lower.startsWith('bs ') || lower.startsWith('bs/')) return 'BS';
  if (lower.startsWith('bsc ') || lower.startsWith('b.sc')) return 'BSc';
  if (lower.startsWith('msc ') || lower.startsWith('m.sc')) return 'MSc';
  if (lower.startsWith('associate')) return 'Associate';
  if (lower.startsWith('diploma')) return 'Diploma';
  if (lower.startsWith('certificate')) return 'Certificate';
  if (lower.startsWith('ba ')) return 'BA';
  if (lower.startsWith('bfa')) return 'BFA';
  return 'Other';
}

function splitProgramList(str) {
  if (!str || typeof str !== 'string') return [];
  return str
    .split(/,\s*/)
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => x.replace(/\s+/g, ' '));
}

/** Normalize for fuzzy university name matching */
function collapseLabel(s) {
  if (!s || typeof s !== 'string') return '';
  return s
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[''`]/g, '')
    .replace(/[.,&/-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const STOP_TOKENS = new Set([
  'university',
  'the',
  'of',
  'and',
  'for',
  'campus',
  'reference',
  'pakistan',
  'institute',
  'colleges',
  'college',
  'degree',
  'program',
  'campuses',
  'main',
  'public',
  'private',
]);

function significantTokens(label) {
  return collapseLabel(label)
    .split(' ')
    .filter((w) => w.length > 2 && !STOP_TOKENS.has(w));
}

/**
 * Score how well a DB university name matches a bulk-file alias (0–100+).
 */
function matchScoreUniversityToAlias(uniName, alias) {
  const u = collapseLabel(uniName);
  const a = collapseLabel(alias);
  if (!u || !a) return 0;
  if (u === a) return 100;
  if (u.includes(a) || a.includes(u)) return 92;

  const tu = new Set(significantTokens(uniName));
  const ta = new Set(significantTokens(alias));
  let overlap = 0;
  for (const t of ta) {
    if (tu.has(t)) overlap += 1;
  }

  if (overlap >= 4) return 75 + overlap;
  if (overlap >= 3) return 65 + overlap;
  if (overlap >= 2 && a.length <= 14) return 62;
  if (overlap >= 2) return 58;
  return overlap * 12;
}

/**
 * Pick the best universityProgramsBulk.js entry for a given university name.
 * @param {number} minScore default 58 — avoids weak false positives
 */
function findBestBulkEntryForUniversity(universityName, bulkEntries, minScore = 58) {
  let bestEntry = null;
  let bestScore = 0;
  for (const entry of bulkEntries) {
    const names = entry.matchNames || entry.m;
    if (!Array.isArray(names) || !names.length) continue;
    for (const alias of names) {
      const sc = matchScoreUniversityToAlias(universityName, alias);
      if (sc > bestScore) {
        bestScore = sc;
        bestEntry = entry;
      }
    }
  }
  if (bestEntry && bestScore >= minScore) {
    return { entry: bestEntry, score: bestScore };
  }
  return null;
}

module.exports = {
  mapGroupToCategory,
  inferDegree,
  splitProgramList,
  collapseLabel,
  findBestBulkEntryForUniversity,
};
