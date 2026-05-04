const mongoose = require('mongoose');
const University = require('../models/University');
const Program = require('../models/Program');
const UniversityCriteria = require('../models/UniversityCriteria');
const {
  sanitizeUniversityFields,
  sanitizeProgramForResponse,
} = require('../utils/sanitizeUniversityStrings');
const { generateUniversityComparisonInsights } = require('../services/universityComparisonAI');
const {
  generateProgramComparisonInsights,
  mergeProgramComparisonInsights,
} = require('../services/programComparisonAI');
const { sanitizeFacilityMicroBlurb, sanitizeInsightSnippet } = require('../utils/comparisonTextGuards');
const { pickFlagshipProgram } = require('../utils/flagshipProgram');
const {
  buildHeuristicFacilityBlurbs,
  buildHeuristicStudentInsights,
} = require('../utils/comparisonHeuristics');

const FACILITY_HEADINGS = ['Library', 'Career Center', 'Health Center', 'Student Union', 'IT Services'];
const DEFAULT_FACILITY_MICRO = [
  'Quiet study stacks',
  'CV help sessions',
  'On-site first aid',
  'Societies and sports',
  'Labs and Wi‑Fi',
];

const INSIGHT_LEN = 200;

/** Program comparison table: numeric PKR range only (no prose). */
function formatCompareSemesterFeePkr(min, max) {
  if (!Number.isFinite(min) || min <= 0) return '';
  const maxSafe = Number.isFinite(max) && max >= min ? max : min;
  const a = Math.round(min).toLocaleString('en-PK');
  const b = Math.round(maxSafe).toLocaleString('en-PK');
  return min === maxSafe ? `Rs. ${a}` : `Rs. ${a} - ${b}`;
}

function parseTwoPkrNumbersFromText(s) {
  if (!s || typeof s !== 'string') return null;
  const nums = String(s).replace(/,/g, '').match(/\d{3,9}/g);
  if (!nums || !nums.length) return null;
  const a = parseInt(nums[0], 10);
  const b = nums.length >= 2 ? parseInt(nums[1], 10) : a;
  if (!Number.isFinite(a) || a <= 0) return null;
  const min = Math.min(a, b);
  const max = Math.max(a, b);
  return { min, max };
}

/**
 * Min/max semester fee (PKR) from other active programmes at the same university.
 * Prefers same category when any programmes in that category have fees.
 */
async function listedSemesterFeeRangeAtUniversity(uniId, category) {
  const oid =
    uniId && typeof uniId === 'object' && uniId._id
      ? uniId._id
      : uniId;
  if (!oid) return null;
  const programs = await Program.find({
    university: oid,
    isActive: { $ne: false },
    $or: [{ feePerSemester: { $gt: 0 } }, { totalFee: { $gt: 0 } }],
  })
    .select('feePerSemester totalFee duration category')
    .lean();
  const cat = String(category || '').trim();
  let pool = programs;
  if (cat) {
    const sameCat = programs.filter((p) => String(p.category || '').trim() === cat);
    if (sameCat.length > 0) pool = sameCat;
  }
  const fees = pool
    .map((p) => {
      const sem = Number(p.feePerSemester);
      if (Number.isFinite(sem) && sem > 0) return sem;
      const total = Number(p.totalFee);
      if (Number.isFinite(total) && total > 0) {
        const nSem = parseSemesters(p.duration);
        const v = total / nSem;
        if (Number.isFinite(v) && v > 0) return v;
      }
      return 0;
    })
    .filter((n) => Number.isFinite(n) && n > 0);
  if (!fees.length) return null;
  return { min: Math.min(...fees), max: Math.max(...fees) };
}

function heuristicSemesterFeeRangePkr(univName, univCity, type, degree, category) {
  const name = String(univName || '');
  const n = `${name} ${univCity || ''}`.toLowerCase();
  const t = String(type || '').toLowerCase();
  const isPrivate = /private/i.test(t);
  const deg = String(degree || '').toLowerCase();
  const cat = String(category || '').toLowerCase();
  const text = `${deg} ${cat}`;
  const premium =
    /lums|\blahore university of management|iba\s|ghulam|iqbal|fast|nid|szabist|itu\b|institute of business administration/i.test(
      n
    );
  if (premium && isPrivate) {
    if (/bba|business|finance|economics|account|commerce|management/i.test(text)) {
      return { min: 350_000, max: 600_000 };
    }
    if (/be\b|engineering|computer|software|electrical|mechanical|civil/i.test(text)) {
      return { min: 400_000, max: 650_000 };
    }
    return { min: 200_000, max: 450_000 };
  }
  if (isPrivate) {
    if (/bba|mba|business/i.test(text)) return { min: 90_000, max: 220_000 };
    if (/be\b|bsc|engineering|computer|software|electrical|cs\b|it\b/i.test(text)) {
      return { min: 110_000, max: 260_000 };
    }
    if (/mbbs|bds|medicine|medical|pharm/i.test(text)) return { min: 900_000, max: 1_800_000 };
    return { min: 70_000, max: 180_000 };
  }
  if (/bba|mba|business/i.test(text)) return { min: 20_000, max: 100_000 };
  if (/be\b|engineering|computer|software/i.test(text)) return { min: 25_000, max: 120_000 };
  return { min: 8_000, max: 80_000 };
}

function computeProgramFeeSemesterDisplay(prog, listedRange, aiRow) {
  const fee = Number(prog.feePerSemester);
  if (Number.isFinite(fee) && fee > 0) {
    return formatCompareSemesterFeePkr(fee, fee);
  }
  if (listedRange && listedRange.min > 0 && listedRange.max > 0) {
    return formatCompareSemesterFeePkr(listedRange.min, listedRange.max);
  }
  const amin = Number(aiRow?.feeSemesterMinPkr);
  const amax = Number(aiRow?.feeSemesterMaxPkr);
  if (Number.isFinite(amin) && Number.isFinite(amax) && amin > 0 && amax >= amin) {
    return formatCompareSemesterFeePkr(amin, amax);
  }
  const parsed = parseTwoPkrNumbersFromText(aiRow?.feeGuidance);
  if (parsed) return formatCompareSemesterFeePkr(parsed.min, parsed.max);
  const u = prog.university && typeof prog.university === 'object' ? prog.university : {};
  const h = heuristicSemesterFeeRangePkr(u.name, u.city, u.type, prog.degree, prog.category);
  return formatCompareSemesterFeePkr(h.min, h.max);
}

function formatPkrRange(min, max) {
  if (!Number.isFinite(min) || min <= 0) return '';
  const minT = Math.round(min).toLocaleString('en-PK');
  const maxSafe = Number.isFinite(max) && max >= min ? max : min;
  const maxT = Math.round(maxSafe).toLocaleString('en-PK');
  return min === maxSafe ? `Rs. ${minT} per semester` : `Rs. ${minT} - ${maxT} per semester`;
}

function parseSemesters(duration) {
  const d = String(duration || '').toLowerCase();
  const years = d.match(/(\d+(?:\.\d+)?)\s*year/);
  if (years) {
    const y = parseFloat(years[1]);
    if (Number.isFinite(y) && y > 0) return Math.max(1, Math.round(y * 2));
  }
  const sem = d.match(/(\d+)\s*sem/);
  if (sem) {
    const s = parseInt(sem[1], 10);
    if (Number.isFinite(s) && s > 0) return s;
  }
  return 8;
}

function deriveRangeFromPrograms(programs, pattern) {
  const fees = (Array.isArray(programs) ? programs : [])
    .filter((p) => {
      const text = `${p.name || ''} ${p.degree || ''} ${p.category || ''} ${p.programGroup || ''}`.toLowerCase();
      return pattern.test(text);
    })
    .map((p) => {
      const sem = Number(p.feePerSemester);
      if (Number.isFinite(sem) && sem > 0) return sem;
      const total = Number(p.totalFee);
      if (Number.isFinite(total) && total > 0) {
        const semesters = parseSemesters(p.duration);
        const derived = total / semesters;
        if (Number.isFinite(derived) && derived > 0) return derived;
      }
      return 0;
    })
    .filter((f) => Number.isFinite(f) && f > 0);
  if (!fees.length) return '';
  return formatPkrRange(Math.min(...fees), Math.max(...fees));
}

function defaultFeesByType(type) {
  if (/private/i.test(String(type || ''))) {
    return {
      computerEngineering: 'Rs. 110,000 - 260,000 per semester',
      medical: 'Rs. 900,000 - 1,800,000 per year',
      businessFinance: 'Rs. 90,000 - 220,000 per semester',
    };
  }
  return {
    computerEngineering: 'Rs. 25,000 - 120,000 per semester',
    medical: 'Rs. 60,000 - 250,000 per year',
    businessFinance: 'Rs. 20,000 - 100,000 per semester',
  };
}

function buildFeesRange(u, programs) {
  const computingDerived = deriveRangeFromPrograms(
    programs,
    /(computer|software|engineering|electrical|mechanical|civil|aerospace|artificial intelligence|informatics|cs|it)/i
  );
  const medicalDerived = deriveRangeFromPrograms(programs, /(mbbs|bds|medicine|medical|pharm|dpt|nursing|allied health)/i);
  const businessDerived = deriveRangeFromPrograms(programs, /(bba|business|finance|account|commerce|management|mba|economics)/i);
  const defaults = defaultFeesByType(u.type);

  const feeFallback =
    'Typical ranges vary by programme and year; confirm amounts on the official fee schedule.';
  const computerEngineering = (
    u.feeComputingEngSemester ||
    computingDerived ||
    u.feeBsTypicalSemester ||
    defaults.computerEngineering ||
    ''
  ).trim();
  const medical = (u.feeMbbsPerYear || medicalDerived || defaults.medical || '').trim();
  const businessFinance = (u.feeBusinessSocialSemester || businessDerived || defaults.businessFinance || '').trim();
  return {
    computerEngineering: computerEngineering || feeFallback,
    medical: medical || feeFallback,
    businessFinance: businessFinance || feeFallback,
  };
}

function buildFacilitiesStructured(ai, universityId, programs, flagship) {
  const raw = ai && Array.isArray(ai.facilityMicroBlurbs) ? ai.facilityMicroBlurbs : [];
  const heur = buildHeuristicFacilityBlurbs(universityId, programs, flagship);
  return FACILITY_HEADINGS.map((label, i) => {
    let blurb = sanitizeFacilityMicroBlurb(raw[i] || '');
    if (!blurb) blurb = sanitizeFacilityMicroBlurb(heur[i] || '');
    if (!blurb) blurb = DEFAULT_FACILITY_MICRO[i];
    return { label, blurb };
  });
}

function buildStudentInsights(ai, u, programs) {
  const defs = [
    ['Industry linkages', 'Depends on programme; ask placement office'],
    ['Financial support', 'HEC and need-based schemes may apply'],
    ['Lab facilities', 'Varies by department; confirm on site'],
    ['Student life', 'Societies, sports, and hostels vary'],
  ];
  const keys = ['industryLinkages', 'financialSupport', 'labFacilitiesShort', 'studentLifeShort'];
  const heur = buildHeuristicStudentInsights(u, programs);
  return defs.map(([label, def], i) => {
    const fromAi = ai ? sanitizeInsightSnippet(String(ai[keys[i]] || ''), INSIGHT_LEN) : '';
    if (fromAi) return { label, value: fromAi };
    const fromHeur = sanitizeInsightSnippet(String(heur[i] || ''), INSIGHT_LEN);
    return { label, value: fromHeur || def };
  });
}

function stripUniversityForCompare(u) {
  const {
    scrapedSummary,
    scrapedHighlights,
    scrapedAt,
    scrapedSourceUrl,
    facilities,
    description,
    facilitiesList,
    ...rest
  } = u;
  return rest;
}

function meritCriteriaSummary(criteria) {
  if (!criteria) return null;
  const parts = [];
  if (criteria.matricWeight) parts.push(`Matric ${criteria.matricWeight}%`);
  if (criteria.firstYearWeight) parts.push(`1st year ${criteria.firstYearWeight}%`);
  if (criteria.secondYearWeight) parts.push(`2nd year ${criteria.secondYearWeight}%`);
  if (criteria.intermediateWeight) parts.push(`Intermediate ${criteria.intermediateWeight}%`);
  if (criteria.entryTestWeight) parts.push(`Entry test ${criteria.entryTestWeight}%`);
  let lastClosing = null;
  if (criteria.pastMeritTrends?.length) {
    const sorted = [...criteria.pastMeritTrends].sort((a, b) => (b.year || 0) - (a.year || 0));
    lastClosing = sorted[0];
  }
  return {
    weightsSummary: parts.join(' · ') || null,
    entryTestName: criteria.entryTestName || null,
    entryTestRequired: criteria.entryTestRequired,
    entryTestTotalMarks: criteria.entryTestTotalMarks || null,
    minimumMatricMarks: criteria.minimumMatricMarks,
    minimumIntermediateMarks: criteria.minimumIntermediateMarks,
    lastClosingMerit: lastClosing
      ? lastClosing.closingMerit == null && lastClosing.year == null
        ? null
        : {
            year: lastClosing.year,
            closingMerit: lastClosing.closingMerit,
            programName: lastClosing.programName,
          }
      : null,
  };
}

/**
 * Must match frontend Closing merit column: treat as "no DB merit" unless year or closingMerit is set.
 * Otherwise meritFromDatabase is a truthy {} and the model always returns empty closingMeritGuidance.
 */
function meritForAiInput(lastClosingMerit) {
  if (!lastClosingMerit || typeof lastClosingMerit !== 'object') return null;
  if (lastClosingMerit.closingMerit == null && lastClosingMerit.year == null) return null;
  return {
    year: lastClosingMerit.year ?? null,
    closingMerit: lastClosingMerit.closingMerit ?? null,
    ...(lastClosingMerit.programName != null && lastClosingMerit.programName !== ''
      ? { programName: lastClosingMerit.programName }
      : {}),
  };
}

/**
 * POST /api/comparison
 * Body: { type: 'universities' | 'programs', ids: string[] } — 2 to 3 unique Mongo IDs.
 */
exports.compare = async (req, res) => {
  try {
    const { type, ids } = req.body;

    if (!type || !['universities', 'programs'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid type. Use "universities" or "programs".',
      });
    }

    if (!Array.isArray(ids) || ids.length < 2 || ids.length > 3) {
      return res.status(400).json({
        success: false,
        message: 'Provide 2 to 3 items to compare.',
      });
    }

    const uniq = [...new Set(ids.map(String))];
    if (uniq.length !== ids.length) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate selections are not allowed.',
      });
    }

    for (const id of ids) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: `Invalid id: ${id}` });
      }
    }

    if (type === 'universities') {
      const docs = await University.find({ _id: { $in: ids } }).lean();
      const map = new Map(docs.map((d) => [String(d._id), d]));
      const ordered = [];

      const uniObjIds = ids.map((id) => new mongoose.Types.ObjectId(id));
      const allPrograms = await Program.find({
        university: { $in: uniObjIds },
        isActive: { $ne: false },
      })
        .select('name degree category programGroup feePerSemester totalFee duration university')
        .lean();

      const programsByUni = new Map();
      for (const p of allPrograms) {
        const k = String(p.university);
        if (!programsByUni.has(k)) programsByUni.set(k, []);
        programsByUni.get(k).push(p);
      }

      for (const id of ids) {
        const raw = map.get(String(id));
        if (!raw) {
          return res.status(404).json({
            success: false,
            message: 'One or more universities were not found.',
          });
        }
        const programCount = await Program.countDocuments({
          university: raw._id,
          isActive: { $ne: false },
        });
        const u = sanitizeUniversityFields({ ...raw });
        ordered.push({
          ...u,
          programCount,
          facilitiesList: Array.isArray(u.facilities) ? u.facilities : [],
        });
      }

      const aiInput = ordered.map((u) => {
        const myPrograms = programsByUni.get(String(u._id)) || [];
        const flagship = pickFlagshipProgram(myPrograms, u.name);
        return {
          id: String(u._id),
          name: u.name || '',
          city: u.city || '',
          type: u.type || '',
          hecRanking: u.hecRanking ?? null,
          programCount: u.programCount ?? null,
          address: u.address || '',
          facilities: Array.isArray(u.facilitiesList) ? u.facilitiesList : [],
          scrapedHighlights: Array.isArray(u.scrapedHighlights) ? u.scrapedHighlights.slice(0, 6) : [],
          scrapedSummary: typeof u.scrapedSummary === 'string' ? u.scrapedSummary.slice(0, 800) : '',
          description: u.description || '',
          feeComputingEngSemester: u.feeComputingEngSemester || '',
          feeBusinessSocialSemester: u.feeBusinessSocialSemester || '',
          feeBsTypicalSemester: u.feeBsTypicalSemester || '',
          feeMbbsPerYear: u.feeMbbsPerYear || '',
          programSample: myPrograms.slice(0, 28).map((p) => ({
            degree: p.degree,
            name: p.name,
            category: p.category,
          })),
          flagshipProgram: flagship
            ? { degree: flagship.degree, name: flagship.name, feePerSemester: flagship.feePerSemester }
            : null,
        };
      });
      const aiMap = await generateUniversityComparisonInsights(aiInput);

      const withAi = ordered.map((u) => {
        const ai = aiMap?.get(String(u._id));
        const myPrograms = programsByUni.get(String(u._id)) || [];
        const flagship = pickFlagshipProgram(myPrograms, u.name);

        const typeResolved =
          ai?.type ||
          (/public/i.test(String(u.type || '')) ? 'Public' : /private/i.test(String(u.type || '')) ? 'Private' : 'Not specified in directory');

        const feeComputingEngSemester = (ai?.feeComputingEngSemester || u.feeComputingEngSemester || '').trim();
        const feeBusinessSocialSemester = (ai?.feeBusinessSocialSemester || u.feeBusinessSocialSemester || '').trim();

        const feesRange = buildFeesRange(
          {
            feeMbbsPerYear: u.feeMbbsPerYear,
            feeBsTypicalSemester: u.feeBsTypicalSemester,
            feeComputingEngSemester,
            feeBusinessSocialSemester,
          },
          myPrograms
        );

        const addressLine = (ai?.addressShort || u.address || '').trim();
        const base = stripUniversityForCompare({
          ...u,
          type: typeResolved,
          hecRanking: ai?.hecRanking ?? u.hecRanking ?? null,
          programsOffer: ai?.programsOffer ?? u.programCount ?? null,
          address: addressLine || 'Not listed in directory; use the university website or a maps search.',
          feeComputingEngSemester,
          feeBusinessSocialSemester,
          facilitiesStructured: buildFacilitiesStructured(ai, String(u._id), myPrograms, flagship),
          studentInsights: buildStudentInsights(ai, u, myPrograms),
          feesRange,
        });

        return base;
      });

      if (!aiMap) {
        console.warn(`[comparison] universities — aiUsed=false (see Grok logs above if any)`);
      }
      return res.status(200).json({ success: true, type, items: withAi, aiUsed: !!aiMap });
    }

    const docs = await Program.find({ _id: { $in: ids } })
      .populate('university', 'name city type hecRanking website')
      .lean();
    const map = new Map(docs.map((d) => [String(d._id), d]));
    const ordered = [];

    for (const id of ids) {
      const raw = map.get(String(id));
      if (!raw) {
        return res.status(404).json({
          success: false,
          message: 'One or more programs were not found.',
        });
      }
      const prog = sanitizeProgramForResponse(raw);
      const uniId = prog.university && prog.university._id ? prog.university._id : prog.university;
      let meritCriteria = null;
      if (uniId && prog._id) {
        const c = await UniversityCriteria.findOne({
          university: uniId,
          program: prog._id,
          isActive: true,
        }).lean();
        meritCriteria = meritCriteriaSummary(c);
      }
      ordered.push({ ...prog, meritCriteria });
    }

    const listedFeeRangeByProgramId = new Map();
    for (const p of ordered) {
      const uniRef = p.university && typeof p.university === 'object' ? p.university._id : p.university;
      const range = await listedSemesterFeeRangeAtUniversity(uniRef, p.category);
      listedFeeRangeByProgramId.set(String(p._id), range);
    }

    // Build AI input for program comparison
    const aiInput = ordered.map((p) => ({
      id: String(p._id),
      name: p.name || '',
      degree: p.degree || '',
      category: p.category || '',
      programGroup: p.programGroup || '',
      duration: p.duration || '',
      feePerSemester: p.feePerSemester || 0,
      totalFee: p.totalFee || 0,
      eligibility: p.eligibility || '',
      description: (p.description || '').slice(0, 400),
      careerScope: (p.careerScope || '').slice(0, 400),
      university: p.university
        ? { name: p.university.name, city: p.university.city, type: p.university.type }
        : {},
      meritFromDatabase: meritForAiInput(p.meritCriteria?.lastClosingMerit),
      listedSemesterFeeRangePkr: listedFeeRangeByProgramId.get(String(p._id)) || null,
    }));

    const rawProgramAiMap = await generateProgramComparisonInsights(aiInput);
    const programAiMerged = mergeProgramComparisonInsights(aiInput, rawProgramAiMap);

    const withAi = ordered.map((p) => {
      const ai = programAiMerged.get(String(p._id));
      const listed = listedFeeRangeByProgramId.get(String(p._id));
      const feeSemesterDisplay = computeProgramFeeSemesterDisplay(p, listed, ai);
      return {
        ...p,
        feeSemesterDisplay,
        aiCareerOutlook: ai?.careerOutlook || '',
        aiSalaryRange: ai?.salaryRange || '',
        aiIndustryLinkages: ai?.industryLinkages || '',
        aiAdmissionDifficulty: ai?.admissionDifficulty || '',
        aiProgramStrengths: ai?.programStrengths || '',
        aiEligibilityHint: ai?.eligibilityHint || '',
        aiFeeGuidance: '',
        aiClosingMeritGuidance: ai?.closingMeritGuidance || '',
      };
    });

    if (!rawProgramAiMap) {
      console.warn('[comparison] programs — aiUsed=false (see Grok / ProgramComparisonAI logs above)');
    }
    return res.status(200).json({ success: true, type, items: withAi, aiUsed: !!rawProgramAiMap });
  } catch (error) {
    console.error('Comparison error:', error);
    res.status(500).json({ success: false, message: error.message || 'Comparison failed' });
  }
};
