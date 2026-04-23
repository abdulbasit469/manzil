/**
 * Pick a "flagship-style" program for fee display (heuristic from name/degree/category).
 */

/**
 * Avoid "BS BS Artificial Intelligence" when `name` already starts with the degree token.
 */
function buildProgramDisplayTitle(degree, name) {
  const d = String(degree || '').trim();
  const n = String(name || '').trim();
  if (!n) return d.slice(0, 96);
  if (!d) return n.slice(0, 96);
  const nLow = n.toLowerCase();
  const dLow = d.toLowerCase();
  if (nLow === dLow) return n.slice(0, 96);
  if (nLow.startsWith(`${dLow} `)) return n.slice(0, 96);
  const firstTok = n.split(/\s+/)[0]?.toLowerCase() || '';
  if (firstTok === dLow) return n.slice(0, 96);
  return `${d} ${n}`.trim().slice(0, 96);
}

function flagshipScore(program, universityName) {
  const text = `${program.name || ''} ${program.degree || ''} ${program.category || ''} ${program.programGroup || ''}`.toLowerCase();
  const uni = String(universityName || '').toLowerCase();
  let score = 0;

  if (/\bmbbs\b|bds\b|doctor\s+of\s+medicine/i.test(text)) score += 125;
  else if (/pharm|pharmacy|dpt|doctor\s+of\s+physio/i.test(text)) score += 90;
  else if (/computer|software|\bcs\b|\bit\b|data science|cyber|artificial intelligence|ai\b/i.test(text)) score += 98;
  else if (/electrical|electronics|mechanical|civil|aerospace|engineering|b\.?arch|architecture/i.test(text)) score += 90;
  else if (/bba|business administration|mba|commerce|account/i.test(text)) score += 84;
  else if (/llb|law\b/i.test(text)) score += 80;

  if (/medical|dow|aku|cmh|king edward|kemu|allama iqbal medical/i.test(uni) && /mbbs|bds|medicine/i.test(text)) score += 35;
  if (/engineering|nst|fast|ned|giki|air university|uet|nust/i.test(uni) && /engineering|computer|aerospace|electrical/i.test(text))
    score += 28;

  const fee = Number(program.feePerSemester) || 0;
  score += Math.min(fee / 45000, 10);

  return score;
}

/**
 * @param {Array<object>} programs - lean Program docs for one university
 * @param {string} universityName
 * @returns {object|null}
 */
function pickFlagshipProgram(programs, universityName) {
  if (!Array.isArray(programs) || programs.length === 0) return null;

  let best = programs[0];
  let bestScore = flagshipScore(best, universityName);

  for (let i = 1; i < programs.length; i++) {
    const p = programs[i];
    const s = flagshipScore(p, universityName);
    if (s > bestScore) {
      best = p;
      bestScore = s;
      continue;
    }
    if (s === bestScore) {
      const f1 = Number(p.feePerSemester) || 0;
      const f2 = Number(best.feePerSemester) || 0;
      if (f1 > f2) {
        best = p;
        bestScore = s;
      } else if (f1 === f2 && String(p.name || '').localeCompare(String(best.name || '')) < 0) {
        best = p;
      }
    }
  }

  if (bestScore <= 0) {
    let maxFee = -1;
    for (const p of programs) {
      const f = Number(p.feePerSemester) || 0;
      if (f > maxFee) {
        maxFee = f;
        best = p;
      }
    }
    if (maxFee <= 0) {
      best = programs.slice().sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')))[0];
    }
  }

  return best;
}

function collectProgramFeeStats(programs) {
  const fees = (Array.isArray(programs) ? programs : [])
    .map((p) => Number(p?.feePerSemester))
    .filter((f) => Number.isFinite(f) && f > 0);
  if (!fees.length) return null;
  const min = Math.min(...fees);
  const max = Math.max(...fees);
  return { min, max, count: fees.length };
}

function formatFlagshipFeeLine(flagship, university, programs = []) {
  const u = university || {};
  const title = flagship ? buildProgramDisplayTitle(flagship.degree, flagship.name) : '';
  const feeStats = collectProgramFeeStats(programs);

  const fee = flagship ? Number(flagship.feePerSemester) : 0;
  if (flagship && Number.isFinite(fee) && fee > 0) {
    return {
      programTitle: title || 'Representative programme',
      rangeText: `About Rs. ${Math.round(fee).toLocaleString('en-PK')} per semester`,
      note: 'from your program list',
    };
  }

  const t = title.toLowerCase();
  if (/mbbs|bds/.test(t) && u.feeMbbsPerYear) {
    return {
      programTitle: title || 'MBBS',
      rangeText: String(u.feeMbbsPerYear).trim(),
      note: 'typical range for medical (confirm year)',
    };
  }
  if (
    /computer|software|engineering|electrical|mechanical|civil|aerospace|artificial intelligence|informatics|bscs|bsit|architecture/.test(
      t
    ) &&
    u.feeComputingEngSemester
  ) {
    return {
      programTitle: title || 'Engineering-style intake',
      rangeText: String(u.feeComputingEngSemester).trim(),
      note: 'indicative for similar programmes',
    };
  }
  if (/bba|business|mba|commerce/.test(t) && u.feeBusinessSocialSemester) {
    return {
      programTitle: title || 'Business-style intake',
      rangeText: String(u.feeBusinessSocialSemester).trim(),
      note: 'indicative for similar programmes',
    };
  }
  const fallback =
    u.feeBsTypicalSemester || u.feeComputingEngSemester || u.feeBusinessSocialSemester || '';
  if (fallback) {
    return {
      programTitle: title || 'Popular undergraduate track',
      rangeText: String(fallback).trim(),
      note: 'university indicative range',
    };
  }

  if (feeStats) {
    const min = Math.round(feeStats.min).toLocaleString('en-PK');
    const max = Math.round(feeStats.max).toLocaleString('en-PK');
    return {
      programTitle: title || 'Popular undergraduate track',
      rangeText: feeStats.min === feeStats.max ? `About Rs. ${min} per semester` : `Rs. ${min} - ${max} per semester`,
      note: `derived from ${feeStats.count} listed program fee${feeStats.count > 1 ? 's' : ''}`,
    };
  }

  return {
    programTitle: title || 'Check prospectus',
    rangeText: 'Fee not listed in this directory yet',
    note: 'use official fee notice',
  };
}

module.exports = {
  pickFlagshipProgram,
  formatFlagshipFeeLine,
  flagshipScore,
  buildProgramDisplayTitle,
  collectProgramFeeStats,
};
