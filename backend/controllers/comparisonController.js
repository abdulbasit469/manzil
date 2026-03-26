const mongoose = require('mongoose');
const University = require('../models/University');
const Program = require('../models/Program');
const UniversityCriteria = require('../models/UniversityCriteria');
const {
  sanitizeUniversityFields,
  sanitizeProgramForResponse,
} = require('../utils/sanitizeUniversityStrings');

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

      return res.status(200).json({ success: true, type, items: ordered });
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
