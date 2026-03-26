/**
 * Removes placeholder "Unknown" from university fields (CSV/import/scrape leftovers).
 * - Leading "Unknown " on name/city is stripped.
 * - A value that is only "Unknown" becomes empty string (caller / migration should replace).
 */

function stripUnknownPlaceholder(str) {
  if (str == null || typeof str !== 'string') return str;
  const t = str.trim();
  if (/^unknown$/i.test(t)) return '';
  return t.replace(/^unknown\s+/i, '').trim();
}

function stripUnknownFromAddress(str) {
  if (str == null || typeof str !== 'string') return str;
  let t = str.trim();
  if (/^unknown$/i.test(t)) return '';
  t = t.replace(/^unknown\s+/i, '').trim();
  t = t.replace(/^unknown,\s*/i, '').trim();
  t = t.replace(/,\s*unknown$/i, '').trim();
  return t;
}

function sanitizeUniversityFields(uni) {
  if (!uni || typeof uni !== 'object') return uni;
  const out = { ...uni };
  if (typeof out.name === 'string') out.name = stripUnknownPlaceholder(out.name);
  if (typeof out.city === 'string') {
    out.city = stripUnknownPlaceholder(out.city);
    if (out.city === '') out.city = 'Not specified';
  }
  if (typeof out.address === 'string') out.address = stripUnknownFromAddress(out.address);
  return out;
}

/** Plain program object / lean doc with optional populated university */
function sanitizeProgramForResponse(program) {
  if (!program || typeof program !== 'object') return program;
  const plain = program.toObject ? program.toObject({ virtuals: true }) : { ...program };
  if (plain.university && typeof plain.university === 'object') {
    plain.university = sanitizeUniversityFields(plain.university);
  }
  return plain;
}

function sanitizeProgramsArray(programs) {
  if (!Array.isArray(programs)) return programs;
  return programs.map((p) => sanitizeProgramForResponse(p));
}

module.exports = {
  stripUnknownPlaceholder,
  stripUnknownFromAddress,
  sanitizeUniversityFields,
  sanitizeProgramForResponse,
  sanitizeProgramsArray,
};
