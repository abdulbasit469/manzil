/**
 * When Grok is unavailable or returns empty fields, build per-university
 * comparison copy from programme list and basic university facts (not identical static strings).
 */

const { buildProgramDisplayTitle } = require('./flagshipProgram');

function hashPick(seed, arr) {
  if (!arr.length) return '';
  let h = 0;
  const s = String(seed || 'x');
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return arr[h % arr.length];
}

function detectTracks(programs) {
  const blob = (programs || []).map((p) => `${p.name} ${p.degree} ${p.category}`).join(' ').toLowerCase();
  return {
    med: /\bmbbs\b|bds\b|medicine|nursing|doctor of/i.test(blob),
    tech: /computer|software|artificial intelligence|data science|cyber|engineering|electrical|mechanical|civil|aerospace|informatics/i.test(
      blob
    ),
    biz: /bba|business|commerce|account|mba/i.test(blob),
    law: /llb|law\b/i.test(blob),
  };
}

function sampleProgramTitles(programs, n) {
  const sorted = [...(programs || [])].sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
  return sorted
    .slice(0, 12)
    .map((p) => buildProgramDisplayTitle(p.degree, p.name))
    .filter(Boolean)
    .slice(0, n);
}

/**
 * @returns {string[]} five blurbs aligned with Library, Career Center, Health Center, Student Union, IT Services
 */
function buildHeuristicFacilityBlurbs(universityId, programs, flagship) {
  const tracks = detectTracks(programs);
  const seed = String(universityId || '0');
  const fp = flagship ? `${flagship.name} ${flagship.degree}`.toLowerCase() : '';

  const library = tracks.med
    ? hashPick(seed, ['Medical stacks heavy', 'Clinical quiet floors', 'Journal access broad'])
    : tracks.tech
    ? hashPick(seed, ['STEM lending shelves', 'Late study carrels', 'E-books on campus'])
    : hashPick(seed, ['Group study booths', 'Borrow renew easy', 'Quiet reading halls']);

  const career = tracks.biz
    ? hashPick(seed + 'c', ['Bank prep coaching', 'Corporate mock days', 'MBA pathway talks'])
    : tracks.tech
    ? hashPick(seed + 'c', ['Tech hiring meets', 'Internship desk busy', 'CV polish sessions'])
    : hashPick(seed + 'c', ['Employer info stalls', 'Walk-in CV checks', 'Career week booths']);

  const health = tracks.med
    ? hashPick(seed + 'h', ['Student sick bay', 'Campus clinic shifts', 'Basic on-site care'])
    : hashPick(seed + 'h', ['First aid kiosk', 'Wellness awareness talks', 'Basic campus clinic']);

  const union = hashPick(seed + 'u', ['Clubs host debates', 'Sports league hub', 'Society signup desks']);

  let it = hashPick(seed + 'i', ['Campus Wi-Fi help', 'Lab account fixes', 'Printing kiosks nearby']);
  if (/artificial|intelligence|computer|software|cyber|data science/i.test(fp)) {
    it = hashPick(seed + 'i', ['Computing lab hours', 'Coding lab monitors', 'Developer tool access']);
  } else if (tracks.tech) {
    it = hashPick(seed + 'i', ['Engineering PC labs', 'Simulation suites open', 'Campus network fixes']);
  }

  return [library, career, health, union, it];
}

/**
 * @returns {string[]} industry, financial, labs, student life
 */
function buildHeuristicStudentInsights(u, programs) {
  const tracks = detectTracks(programs);
  const city = String(u.city || '')
    .replace(/not specified/gi, '')
    .trim();
  const samples = sampleProgramTitles(programs, 2);
  const t1 = samples[0] || 'listed majors';
  const t2 = samples[1] || 'other listed tracks';

  let industry;
  if (tracks.med) {
    industry = `Clinical rotations matter; programmes such as ${t1} and ${t2} usually feed public hospitals, private clinics, and allied health employers.`;
  } else if (tracks.tech) {
    industry = `Tracks like ${t1} and ${t2} commonly feed software houses, telecom, defence contractors, and public-sector engineering cadres in Pakistan.`;
  } else if (tracks.biz) {
    industry = `With ${t1} and ${t2} on the catalogue, graduates often pursue banks, multinationals, and family-business upgrades; verify placement stats locally.`;
  } else {
    industry = `Sample offerings include ${t1} and ${t2}; employer mix shifts by faculty, so ask the placement office for the latest graduate survey.`;
  }

  const financial = /private/i.test(String(u.type || ''))
    ? 'Private campuses publish instalment plans and merit discounts less visibly; email admissions for HEC-linked aid windows and sibling concessions.'
    : 'Public-sector fees stay lower on regular seats; watch the official site for HEC need-based support, employee quotas, and regional scholarship calls.';

  let lab;
  if (tracks.tech) {
    lab = 'Computing and engineering routes expect weekly lab hours; confirm which workshops stay open evenings for your cohort.';
  } else if (tracks.med) {
    lab = 'Basic science labs dominate early years; clinical skills labs expand as you enter hospital rotations—check intake handbooks.';
  } else {
    lab = 'Laboratory access depends on department; read the PDF prospectus for your exact programme before paying any advance.';
  }

  const life = city
    ? `In ${city}, societies and inter-faculty fixtures stay busy; hostel beds for popular cycles fill fast, so apply the day lists open.`
    : 'Societies, fixtures, and hostel ballots refresh each cycle; attend orientation week to lock a society and sports trials early.';

  return [industry, financial, lab, life].map((s) => s.slice(0, 220));
}

module.exports = {
  buildHeuristicFacilityBlurbs,
  buildHeuristicStudentInsights,
  detectTracks,
};
