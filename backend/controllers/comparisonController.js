const mongoose = require('mongoose');
const University = require('../models/University');
const Program = require('../models/Program');
const UniversityCriteria = require('../models/UniversityCriteria');
const {
  sanitizeUniversityFields,
  sanitizeProgramForResponse,
} = require('../utils/sanitizeUniversityStrings');
const { generateUniversityComparisonInsights } = require('../services/universityComparisonAI');
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

  return {
    computerEngineering: (
      u.feeComputingEngSemester ||
      computingDerived ||
      u.feeBsTypicalSemester ||
      defaults.computerEngineering ||
      ''
    ).trim(),
    medical: (u.feeMbbsPerYear || medicalDerived || defaults.medical || '').trim(),
    businessFinance: (u.feeBusinessSocialSemester || businessDerived || defaults.businessFinance || '').trim(),
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
      ? { year: lastClosing.year, closingMerit: lastClosing.closingMerit, programName: lastClosing.programName }
      : null,
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
          (/public/i.test(String(u.type || '')) ? 'Public' : /private/i.test(String(u.type || '')) ? 'Private' : '—');

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

        const base = stripUniversityForCompare({
          ...u,
          type: typeResolved,
          hecRanking: ai?.hecRanking ?? u.hecRanking ?? null,
          programsOffer: ai?.programsOffer ?? u.programCount ?? null,
          address: (ai?.addressShort || u.address || '').trim(),
          feeComputingEngSemester,
          feeBusinessSocialSemester,
          facilitiesStructured: buildFacilitiesStructured(ai, String(u._id), myPrograms, flagship),
          studentInsights: buildStudentInsights(ai, u, myPrograms),
          feesRange,
        });

        return base;
      });

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

    return res.status(200).json({ success: true, type, items: ordered });
  } catch (error) {
    console.error('Comparison error:', error);
    res.status(500).json({ success: false, message: error.message || 'Comparison failed' });
  }
};
