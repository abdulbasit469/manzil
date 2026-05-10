/**
 * Ensures side-by-side comparison cells never share identical prose (universities + programs).
 */

function normKey(s) {
  return String(s || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function hash32(s) {
  let h = 0;
  const str = String(s || '');
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return h >>> 0;
}

function pickFromPool(seed, pool) {
  if (!pool || !pool.length) return '';
  const idx = hash32(seed) % pool.length;
  return pool[idx];
}

const FACILITY_ALT_POOLS = {
  Library: [
    'Inter-library loan desk',
    'Digital course reserves',
    'Reference desk staffed',
    'Archive reading room',
    '24-hour reading zone',
    'Faculty reserve shelves',
    'Thesis binding corner',
    'Online database training',
    'Peer tutoring corner',
    'Subject liaison hours',
    'Silent floor policy',
    'Group project rooms',
    'Research skills workshops',
    'Citation help drop-in',
    'Microfilm and records',
  ],
  'Career Center': [
    'Alumni mentor pairing',
    'LinkedIn profile clinics',
    'Startup pitch practice',
    'Industry speaker series',
    'Government jobs briefing',
    'Research assistant postings',
    'Portfolio review slots',
    'Grad school prep talks',
    'Freelance tax basics',
    'Interview room booking',
    'Cover letter templates',
    'Employer campus days',
    'Skill micro-credential hub',
    'Part-time job board',
    'Remote internship desk',
  ],
  'Health Center': [
    'Vaccination camp support',
    'Mental health triage',
    'Physio referral pathway',
    'Nutrition counselling slot',
    'Vision screening days',
    'Dental hygiene awareness',
    'First responder training',
    'Health insurance guidance',
    'Stress management workshop',
    'Sleep hygiene sessions',
    'Allergy clinic referrals',
    'Women’s health desk',
    'Sports injury first aid',
    'Pharmacy locator help',
    'Telehealth sign-up help',
  ],
  'Student Union': [
    'Election oversight board',
    'Volunteer fair each term',
    'Cultural society funding',
    'Music society practice rooms',
    'Debate league fixtures',
    'Charity drive coordination',
    'Freshers week planning',
    'Guest lecture series',
    'Film club screenings',
    'Photography society walks',
    'Robotics club meetups',
    'Literary magazine staff',
    'Environmental action group',
    'International student desk',
    'Graduation gown rental',
  ],
  'IT Services': [
    'VPN setup assistance',
    'LMS login troubleshooting',
    'Two-factor enrolment help',
    'Software licence portal',
    'Poster printing queue',
    'Classroom AV hotline',
    'Email quota upgrades',
    'Lab machine booking',
    'Anti-virus campus policy',
    'Eduroam roaming help',
    'Projector loan service',
    'Secure exam browser help',
    'Cloud storage quota info',
    'Password reset kiosk',
    'Student device clinic',
  ],
};

const STUDENT_INSIGHT_ALT_POOLS = {
  'Industry linkages': [
    'Graduates split across telecom, banks, and SMEs; ask faculty for recent employer lists.',
    'Public-sector and NGO routes stay common; verify bonding rules before you commit.',
    'Hospital and clinic networks dominate placements; confirm house-job pathways early.',
    'Software vendors and defence contractors recruit selectively; polish GitHub and projects.',
    'Family businesses and mid-tier firms hire steadily; internships matter more than brand.',
    'Teaching and research assistantships can bridge you to higher study; ask HoD timelines.',
    'Regional industry clusters differ; compare Lahore vs Karachi hiring for your field.',
    'Regulatory bodies and testing labs absorb some cohorts; check accreditation needs.',
    'Start-up incubators exist on some campuses; apply before final year projects.',
    'Export-oriented manufacturers visit a few departments; attend every careers fair.',
    'Consulting and audit firms recruit from selected programmes; check eligibility lists.',
    'Media and design houses hire portfolio-first; keep a tight online reel.',
    'Agriculture extension and public schemes hire agronomy graduates in waves.',
    'Logistics and supply-chain roles grow; learn Excel and basic analytics.',
    'Real-estate and construction firms recruit civil grads in project cycles.',
  ],
  'Financial support': [
    'Sibling and alumni discounts appear quietly; email the accounts office for rules.',
    'Hostel bursaries sometimes stack with tuition waivers; read the fine print.',
    'HEC overseas scholarships favour strong CGPA; plan reference letters early.',
    'Zakat and endowment seats exist on some campuses; ask student affairs quietly.',
    'Installment plans differ by faculty; compare semester vs annual billing.',
    'Merit-cum-need forms open briefly; keep income documents scanned in advance.',
    'Sports and talent quotas can reduce fees; bring certificates to admissions.',
    'Disabled student support funds may cover assistive tech; ask the inclusion office.',
    'Female hostel subsidies vary by city; confirm before you pay a security deposit.',
    'Evening programme fees differ from morning; check the separate schedule.',
    'Research grants sometimes waive lab fees; MSc routes differ from BS.',
    'Bank education loans partner with a few universities; compare APR on campus stalls.',
    'Employee children quotas need HR letters; deadlines precede general merit.',
    'Provincial schemes change annually; follow the official notification PDF only.',
    'Late-fee waivers are rare; pay challan before the bank cutoff time.',
  ],
  'Lab facilities': [
    'Workshop safety induction is mandatory; book before your first practical.',
    'Some labs stay open Saturdays; confirm with the lab superintendent.',
    'Shared instrumentation queues peak before exams; reserve slots early.',
    'Field stations matter for geology and agriculture; ask about transport costs.',
    'Simulation labs rotate batches; read the timetable on the notice board.',
    'Maker spaces may need faculty approval; submit a short project brief.',
    'Chemistry labs enforce dress code strictly; buy goggles from approved vendors.',
    'Physics optics benches are limited; partner up for interference experiments.',
    'Biotech cold rooms restrict access; sign the biosafety undertaking first.',
    'Architecture studios need locker space; claim a desk in week one.',
    'Language labs use headsets; bring your own adapter if you use USB-C.',
    'Psychology labs run human-subject protocols; ethics clearance takes weeks.',
    'Education micro-teaching rooms book fast; coordinate with your cohort rep.',
    'Pharmacy dispensing labs mirror community practice; attendance is graded.',
    'Environmental science field kits are loaned; return checklist signed.',
  ],
  'Student life': [
    'City transport links differ; test the commute at rush hour before you rent.',
    'Inter-varsity sports trials start in the first month; carry medical clearance.',
    'Hostel curfew rules vary; read the warden’s circular on the notice board.',
    'Cafeteria meal plans save money if you stay on campus full week.',
    'Friday prayer arrangements differ; ask the student society for campus maps.',
    'Library stays open later during exams; follow the revised timetable online.',
    'Music and drama societies audition early; prepare a one-minute sample.',
    'Volunteering hours can count for certificates; log them on the portal.',
    'Mental health peer support runs weekly; anonymity is protected.',
    'International student mixers help with culture shock; RSVP on Instagram.',
    'Coding hackathons appear each semester; form teams before the theme drops.',
    'Blood donation drives need ID; slots fill on a first-come basis.',
    'Book bank schemes recycle textbooks; donate after finals to juniors.',
    'Photography walks need signed indemnity; collect forms from the union desk.',
    'Graduation rehearsal dates clash with some papers; plan travel early.',
  ],
};

/** @param {string[]} cells */
function uniquifyRow(cells, label, idSeeds) {
  const n = cells.length;
  if (n < 2) return cells;
  const used = new Set();
  const out = cells.map((c) => String(c || '').trim());
  const pool = FACILITY_ALT_POOLS[label] || STUDENT_INSIGHT_ALT_POOLS[label] || FACILITY_ALT_POOLS.Library;
  for (let i = 0; i < n; i++) {
    let v = out[i];
    let key = normKey(v);
    let salt = 0;
    while (used.has(key)) {
      const seed = `${idSeeds[i] || i}|${label}|${salt}|${key}`;
      v = pickFromPool(seed, pool);
      if (!v) v = `${label} details vary (${salt + 1})`;
      key = normKey(v);
      salt++;
      if (salt > 80) break;
    }
    used.add(key);
    out[i] = v;
  }
  return out;
}

/**
 * @param {Array<{ _id: any, facilitiesStructured?: {label:string, blurb:string}[], studentInsights?: {label:string, value:string}[], feesRange?: object }>} items
 */
function uniquifyUniversityComparisonItems(items) {
  if (!Array.isArray(items) || items.length < 2) return items;
  const idSeeds = items.map((u) => String(u._id || u.id || ''));

  const fs0 = items[0]?.facilitiesStructured;
  if (Array.isArray(fs0) && fs0.length) {
    fs0.forEach((row, rowIdx) => {
      const label = row.label;
      const blurbs = uniquifyRow(
        items.map((u) => u.facilitiesStructured?.[rowIdx]?.blurb || ''),
        label,
        idSeeds
      );
      items.forEach((u, col) => {
        if (!u.facilitiesStructured || !u.facilitiesStructured[rowIdx]) return;
        u.facilitiesStructured[rowIdx].blurb = blurbs[col];
      });
    });
  }

  const si0 = items[0]?.studentInsights;
  if (Array.isArray(si0) && si0.length) {
    si0.forEach((row, rowIdx) => {
      const label = row.label;
      const vals = uniquifyRow(
        items.map((u) => u.studentInsights?.[rowIdx]?.value || ''),
        label,
        idSeeds
      );
      items.forEach((u, col) => {
        if (!u.studentInsights || !u.studentInsights[rowIdx]) return;
        u.studentInsights[rowIdx].value = vals[col];
      });
    });
  }

  const feeKeys = ['computerEngineering', 'medical', 'businessFinance'];
  for (const fk of feeKeys) {
    const originals = items.map((u) => String(u.feesRange?.[fk] || '').trim());
    const used = new Set();
    items.forEach((u, i) => {
      if (!u.feesRange) return;
      let v = originals[i];
      if (!v) return;
      let k = normKey(v);
      let salt = 0;
      while (used.has(k)) {
        const hint = [u.city, universityNameLabel(u)].filter(Boolean).join(' · ').slice(0, 56) || `option ${i + 1}`;
        v = `${originals[i]} (confirm for ${hint})`;
        k = normKey(v);
        salt++;
        if (salt > 12) break;
      }
      used.add(k);
      u.feesRange[fk] = v;
    });
  }

  uniquifyScholarshipOfferLists(items);

  return items;
}

/**
 * Side-by-side compare: no two columns may show the same exact scholarship line (AI often repeats).
 * Only adjusts the first three list entries so long admin lists are not truncated.
 * @param {Array<{ _id: any, scholarshipsOffer?: string[], city?: string, name?: string }>} items
 */
function uniquifyScholarshipOfferLists(items) {
  if (!Array.isArray(items) || items.length < 2) return;

  const slotCount = 3;
  for (let slot = 0; slot < slotCount; slot++) {
    const originals = items.map((u) => {
      const arr = Array.isArray(u.scholarshipsOffer) ? u.scholarshipsOffer : [];
      return String(arr[slot] || '').trim();
    });
    const used = new Set();
    items.forEach((u, i) => {
      const arr = Array.isArray(u.scholarshipsOffer) ? u.scholarshipsOffer : [];
      if (slot >= arr.length) return;
      let v = originals[i];
      if (!v) return;
      let k = normKey(v);
      let salt = 0;
      while (used.has(k)) {
        const hint =
          [universityNameLabel(u), u.city].filter(Boolean).join(' · ').slice(0, 56) || `campus ${i + 1}`;
        v = `${originals[i]} — ${hint}`.slice(0, 200);
        k = normKey(v);
        salt++;
        if (salt > 14) {
          v = `${originals[i]} [${String(u._id || '').slice(-6)}]`.slice(0, 200);
          k = normKey(v);
          break;
        }
      }
      used.add(k);
      const next = [...arr];
      next[slot] = v;
      u.scholarshipsOffer = next;
    });
  }
}

function universityNameLabel(u) {
  const n = u && (u.name || u.shortName);
  return n ? String(n).trim() : '';
}

function programDisambigTag(p) {
  const uni = p.university && typeof p.university === 'object' ? p.university.name : '';
  const parts = [uni, p.degree, p.name].filter((x) => x && String(x).trim());
  return parts.join(' · ').slice(0, 90);
}

const PROGRAM_AI_FIELDS = [
  'aiCareerOutlook',
  'aiSalaryRange',
  'aiIndustryLinkages',
  'aiAdmissionDifficulty',
  'aiProgramStrengths',
  'aiEligibilityHint',
  'aiClosingMeritGuidance',
];

/**
 * @param {Array<object>} programs - response rows with ai* fields
 */
function uniquifyProgramComparisonItems(programs) {
  if (!Array.isArray(programs) || programs.length < 2) return programs;

  for (const field of PROGRAM_AI_FIELDS) {
    const originals = programs.map((p) => String(p[field] || '').trim());
    const used = new Set();
    programs.forEach((p, i) => {
      let v = originals[i];
      if (!v) return;
      let k = normKey(v);
      let salt = 0;
      while (used.has(k)) {
        const tag = programDisambigTag(p) || `program ${i + 1}`;
        v = `${originals[i]} (${tag})`.slice(0, 280);
        k = normKey(v);
        salt++;
        if (salt > 8) {
          v = `${originals[i]} [id:${String(p._id).slice(-8)}]`.slice(0, 280);
          k = normKey(v);
          break;
        }
      }
      used.add(k);
      p[field] = v;
    });
  }

  return programs;
}

module.exports = {
  uniquifyUniversityComparisonItems,
  uniquifyProgramComparisonItems,
};
