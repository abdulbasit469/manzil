const DegreeScope = require('../models/DegreeScope');
const Program = require('../models/Program');
const degreeScopeSeed = require('../data/degreeScopeSeed');
const { sanitizeProgramsArray } = require('../utils/sanitizeUniversityStrings');

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Program.category values in DB for a DegreeScope.field */
function programCategoriesForField(field) {
  const f = (field || '').trim();
  if (f === 'Computer Science') return ['Computer Science'];
  if (f === 'Engineering') return ['Engineering'];
  if (f === 'Medical') return ['Medical'];
  return [f];
}

/**
 * Derive a substring to match Program.name (same idea as before, but supports
 * "BE/BS …", parentheticals like "(CS)", and medical codes).
 */
function programNameKeywordFromScope(scope) {
  const dn = (scope.degreeName || '').trim();
  if (/^MBBS\b/i.test(dn)) return 'MBBS';
  if (/^BDS\b/i.test(dn)) return 'BDS';
  if (/^DPT\b/i.test(dn)) return 'DPT';
  if (/Pharm-?D/i.test(dn)) return 'Pharm';
  let s = dn;
  s = s.replace(/^BE\/BS\s+|^BS\/BE\s+/i, '');
  s = s.replace(/^(BS|BE|BBA|MBA|B\.Ed|BA|M\.Phil|MS|PhD)\s+/i, '');
  s = s.replace(/\s*\([^)]*\)\s*$/g, '').trim();
  if (!s) {
    s = dn.replace(/^BE\/BS\s+|^BS\/BE\s+/i, '');
    s = s.replace(/\s*\([^)]*\)\s*$/g, '').trim();
  }
  return s || dn;
}

/** Old card titles removed when re-seeding expanded degree names */
const DEPRECATED_DEGREE_SCOPE_NAMES = [
  'MBBS',
  'BDS',
  'DPT',
  'Pharm-D',
  'BS Computer Science',
  'BS Software Engineering',
  'BS Data Science',
  'BS Electrical Engineering',
  'BS Mechanical Engineering',
  'BS Civil Engineering',
  'BS Chemical Engineering',
  'BS Mechatronics Engineering',
  'BS Aerospace Engineering',
  'BS Industrial Engineering',
  'BS Petroleum Engineering',
  'BS Biomedical Engineering',
  'BS Environmental Engineering',
  'BS Computer Engineering',
  'BS Information Technology (IT)',
  'BS Artificial Intelligence (AI)',
  'MBA',
];

/**
 * GET /api/degree-scope
 * List all degree scopes, optionally filter by field.
 */
exports.getList = async (req, res) => {
  try {
    const { field } = req.query;
    const query = {};
    if (field && field.trim()) query.field = field.trim();
    const list = await DegreeScope.find(query).sort({ order: 1, degreeName: 1 });
    res.status(200).json({ success: true, count: list.length, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/degree-scope/:id
 * Get single degree scope by ID.
 */
exports.getById = async (req, res) => {
  try {
    const doc = await DegreeScope.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Degree scope not found' });
    }
    res.status(200).json({ success: true, data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/degree-scope/:id/programs
 * Get programs that offer this degree (match by category and name).
 */
exports.getProgramsForDegree = async (req, res) => {
  try {
    const scope = await DegreeScope.findById(req.params.id);
    if (!scope) {
      return res.status(404).json({ success: false, message: 'Degree scope not found' });
    }
    const { page = 1, limit = 20 } = req.query;
    const query = { isActive: { $ne: false } };
    query.category = { $in: programCategoriesForField(scope.field) };
    const namePart = programNameKeywordFromScope(scope);
    if (namePart) {
      query.name = { $regex: escapeRegex(namePart), $options: 'i' };
    }
    const programs = await Program.find(query)
      .populate('university', 'name city type')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ name: 1 });
    const total = await Program.countDocuments(query);
    res.status(200).json({
      success: true,
      count: programs.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      programs: sanitizeProgramsArray(programs)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/degree-scope/seed
 * Seed DegreeScope collection using the server's existing DB connection.
 * Use this when the standalone seed script fails (e.g. DNS/Atlas from CLI).
 */
exports.runSeed = async (req, res) => {
  try {
    const existing = await DegreeScope.countDocuments();
    if (existing > 0) {
      for (const item of degreeScopeSeed) {
        await DegreeScope.updateOne(
          { degreeName: item.degreeName },
          { $set: item },
          { upsert: true }
        );
      }
    } else {
      await DegreeScope.insertMany(degreeScopeSeed);
    }
    await DegreeScope.deleteMany({ degreeName: { $in: DEPRECATED_DEGREE_SCOPE_NAMES } });
    const count = await DegreeScope.countDocuments();
    res.status(200).json({ success: true, message: 'DegreeScope seed done', count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
