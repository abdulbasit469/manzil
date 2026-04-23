/**
 * Filters website chrome / nav text mistaken for "facilities", and thin AI-ish lines.
 * Used by comparison AI + comparisonController fallbacks.
 */

const JUNK_FACILITY_PATTERNS = [
  /color\s*switcher/i,
  /screen\s*reader/i,
  /select\s*your\s*language/i,
  /skip\s+to\s+(main|content)/i,
  /\bcookie(s)?\b.*\b(accept|consent)\b/i,
  /\bhelp\s*desk\b/i,
  /\bfont\s*size\b|[\u2212\u2013\-]\s*A\s*\+\s*A\b|\bA\s*\+\s*A\b/i,
  /\bEnglish\b\s*[|/&،]?\s*[\u0600-\u06FF]/,
  /\bاردو\b.*\bEnglish\b|\bEnglish\b.*\bاردو\b/i,
  /\b(login|sign\s*in)\b.*\b(register|sign\s*up)\b/i,
];

/** Mission / marketing lines with no concrete facility */
const MARKETING_FLUFF = [
  /aspires?\s+to\s+be\s+recognized\s+globally/i,
  /\btransformative\s+education\b/i,
  /\binnovative\s+research\b.*\btransformative\b/i,
];

const FACILITY_KEYWORDS =
  /\b(lab|laboratories?|laboratory|library|libraries?|hostel|hostels|dorm|transport|shuttle|bus\s+service|sport|sports|gym|stadium|pool|swim|clinic|hospital|cafeteria|canteen|dining|wifi|wi-?fi|auditorium|mosque|prayer\s*room|parking|workshop|studios?|computer\s*cent|ICT|printing|medical\s+facilities|campus\s+clinic|auditoria|playground|court|field|studio|makerspace|incubator)\b/i;

function hasFacilityKeyword(s) {
  return FACILITY_KEYWORDS.test(String(s || ''));
}

function looksLikeJunkFacilityText(s) {
  const t = String(s || '').trim();
  if (!t) return true;
  for (const re of JUNK_FACILITY_PATTERNS) {
    if (re.test(t)) return true;
  }
  if (/help\s*desk/i.test(t) && /\d{3}[\s\-]?\d{3}/.test(t)) return true;
  for (const re of MARKETING_FLUFF) {
    if (re.test(t) && !hasFacilityKeyword(t)) return true;
  }
  // Long scraped header with no concrete amenity
  if (t.length > 100 && !hasFacilityKeyword(t)) return true;
  return false;
}

/**
 * True if this line is safe to show as a student-facing facility hint.
 */
function isAcceptableFacilityLine(line) {
  const t = String(line || '').trim();
  if (t.length < 4) return false;
  if (looksLikeJunkFacilityText(t)) return false;
  return true;
}

function filterFacilityLines(lines) {
  if (!Array.isArray(lines)) return [];
  const out = [];
  for (const line of lines) {
    const t = String(line || '').trim();
    if (!t) continue;
    if (!isAcceptableFacilityLine(t)) continue;
    out.push(t);
    if (out.length >= 4) break;
  }
  return out;
}

function joinFacilityBullets(lines, maxChars = 200) {
  const parts = filterFacilityLines(lines);
  if (!parts.length) return '';
  let s = parts.slice(0, 2).join(' · ');
  if (s.length > maxChars) s = `${s.slice(0, maxChars - 1)}…`;
  return s;
}

const JUNK_DESCRIPTION_PATTERNS = [
  /color\s*switcher/i,
  /screen\s*reader/i,
  /select\s*your\s*language/i,
  /help\s*desk/i,
];

function looksLikeJunkDescription(s) {
  const t = String(s || '').trim();
  if (!t) return true;
  for (const re of JUNK_DESCRIPTION_PATTERNS) {
    if (re.test(t)) return true;
  }
  return false;
}

/** Reject one-word or ultra-generic AI stubs */
function isTooThinDescription(s) {
  const t = String(s || '').trim();
  if (t.length < 28) return true;
  if (/^(this|the)\s+university\s+is\s+a\s+/i.test(t) && t.length < 55) return true;
  return false;
}

function isAcceptableDescriptionText(s) {
  const t = String(s || '').trim();
  if (!t) return false;
  if (looksLikeJunkDescription(t)) return false;
  if (isTooThinDescription(t)) return false;
  return true;
}

/**
 * First sentence from scraped summary that reads like prose, not UI chrome.
 */
function firstUsableSummarySentence(summary) {
  const raw = String(summary || '').trim();
  if (!raw) return '';
  const chunks = raw
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((x) => x.trim())
    .filter(Boolean);
  for (const chunk of chunks) {
    if (chunk.length < 35 || chunk.length > 420) continue;
    if (looksLikeJunkFacilityText(chunk) || looksLikeJunkDescription(chunk)) continue;
    if (/^[\d\s\-+()|]+$/.test(chunk)) continue;
    // Skip hero / mission copy scraped from headers (not a real description)
    if (
      /aspires?\s+to\s+be\s+recognized\s+globally|transformative\s+education|innovative\s+research.*transformative/i.test(
        chunk
      ) &&
      !hasFacilityKeyword(chunk)
    ) {
      continue;
    }
    return chunk;
  }
  return '';
}

function buildFactOnlyDescription(u) {
  const name = String(u.name || 'This university').trim() || 'This university';
  const cityRaw = String(u.city || '').trim();
  const city =
    cityRaw && !/^not specified$/i.test(cityRaw) && !/^unknown$/i.test(cityRaw) ? cityRaw : '';
  const typeStr = String(u.type || '').toLowerCase();
  const typeWord = typeStr.includes('private') ? 'private' : 'public';
  const n = u.programCount;
  let out = `${name} is a ${typeWord} university`;
  if (city) out += ` in ${city}`;
  out += '.';
  if (Number.isFinite(n) && n > 0) {
    out += ` This directory currently lists about ${n} programs under this institution.`;
  }
  out += ' For admissions, merit lists, and notices, rely on the official university website.';
  return out;
}

function sanitizeAiFacilitiesShort(s) {
  const t = String(s || '').replace(/\*/g, '').trim();
  if (!t || looksLikeJunkFacilityText(t)) return '';
  return t.length > 220 ? `${t.slice(0, 219)}…` : t;
}

function sanitizeAiDescriptionShort(s) {
  const t = String(s || '').replace(/\*/g, '').trim();
  if (!isAcceptableDescriptionText(t)) return '';
  return t.length > 320 ? `${t.slice(0, 319)}…` : t;
}

function pickFacilitiesFromSummary(summary) {
  const sentence = firstUsableSummarySentence(summary);
  if (!sentence) return '';
  if (!hasFacilityKeyword(sentence)) return '';
  if (looksLikeJunkFacilityText(sentence)) return '';
  return sentence.length > 180 ? `${sentence.slice(0, 179)}…` : sentence;
}

const DEFAULT_FACILITY_LINE =
  'Labs, libraries, hostels, and sports facilities differ by campus and program — check the official admissions page for what is offered to your intake.';

function truncateWords(s, maxWords) {
  const w = String(s || '')
    .replace(/\*/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!w.length) return '';
  return w.slice(0, maxWords).join(' ');
}

/** 2–4 words for facility row blurbs (comparison table). */
function sanitizeFacilityMicroBlurb(s) {
  let t = truncateWords(s, 4);
  if (!t) return '';
  if (looksLikeJunkFacilityText(t)) return '';
  if (t.length > 42) t = t.slice(0, 41).trim();
  return t;
}

/** Short paragraph for student insight rows (no UI chrome). */
function sanitizeInsightSnippet(s, maxLen = 130) {
  let t = String(s || '').replace(/\*/g, '').trim();
  if (!t) return '';
  if (looksLikeJunkFacilityText(t) || looksLikeJunkDescription(t)) return '';
  if (t.length > maxLen) t = `${t.slice(0, maxLen - 1)}…`;
  return t;
}

module.exports = {
  hasFacilityKeyword,
  looksLikeJunkFacilityText,
  isAcceptableFacilityLine,
  filterFacilityLines,
  joinFacilityBullets,
  isAcceptableDescriptionText,
  firstUsableSummarySentence,
  buildFactOnlyDescription,
  sanitizeAiFacilitiesShort,
  sanitizeAiDescriptionShort,
  pickFacilitiesFromSummary,
  DEFAULT_FACILITY_LINE,
  truncateWords,
  sanitizeFacilityMicroBlurb,
  sanitizeInsightSnippet,
};
