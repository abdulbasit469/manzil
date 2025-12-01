const UniversityCriteria = require('../models/UniversityCriteria');
const University = require('../models/University');
const Program = require('../models/Program');

/**
 * @desc    Calculate merit percentage for a student
 * @route   POST /api/merit/calculate
 * @access  Private
 */
exports.calculateMerit = async (req, res) => {
  try {
    const { universityId, programId, matricMarks, firstYearMarks, secondYearMarks, intermediateMarks, entryTestMarks } = req.body;

    // Validate required fields
    if (!universityId || !programId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide university and program'
      });
    }

    // Find criteria for this university and program
    const criteria = await UniversityCriteria.findOne({
      university: universityId,
      program: programId,
      isActive: true
    }).populate('university', 'name').populate('program', 'name');

    if (!criteria) {
      return res.status(404).json({
        success: false,
        message: 'Merit criteria not found for this university and program combination'
      });
    }

    // Validate minimum requirements
    const errors = [];
    if (matricMarks && matricMarks < criteria.minimumMatricMarks) {
      errors.push(`Matric marks must be at least ${criteria.minimumMatricMarks}`);
    }
    if (intermediateMarks && intermediateMarks < criteria.minimumIntermediateMarks) {
      errors.push(`Intermediate marks must be at least ${criteria.minimumIntermediateMarks}`);
    }
    if (entryTestMarks && entryTestMarks < criteria.minimumEntryTestMarks) {
      errors.push(`Entry test marks must be at least ${criteria.minimumEntryTestMarks}`);
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Minimum requirements not met',
        errors
      });
    }

    // Calculate merit percentage
    let meritPercentage = 0;

    // Matric marks contribution (out of 1100)
    if (matricMarks && criteria.matricWeight > 0) {
      const matricPercentage = (matricMarks / 1100) * 100;
      meritPercentage += (matricPercentage * criteria.matricWeight) / 100;
    }

    // First Year marks contribution (out of 550)
    if (firstYearMarks && criteria.firstYearWeight > 0) {
      const firstYearPercentage = (firstYearMarks / 550) * 100;
      meritPercentage += (firstYearPercentage * criteria.firstYearWeight) / 100;
    }

    // Second Year marks contribution (out of 550)
    if (secondYearMarks && criteria.secondYearWeight > 0) {
      const secondYearPercentage = (secondYearMarks / 550) * 100;
      meritPercentage += (secondYearPercentage * criteria.secondYearWeight) / 100;
    }

    // Intermediate marks contribution (out of 1100)
    // Only use if firstYear and secondYear are not provided separately
    if (intermediateMarks && criteria.intermediateWeight > 0 && 
        (!firstYearMarks || !secondYearMarks)) {
      const intermediatePercentage = (intermediateMarks / 1100) * 100;
      meritPercentage += (intermediatePercentage * criteria.intermediateWeight) / 100;
    }

    // Entry test marks contribution
    if (entryTestMarks && criteria.entryTestWeight > 0) {
      const entryTestPercentage = (entryTestMarks / criteria.entryTestTotalMarks) * 100;
      meritPercentage += (entryTestPercentage * criteria.entryTestWeight) / 100;
    }

    // Round to 2 decimal places
    meritPercentage = Math.round(meritPercentage * 100) / 100;

    // Calculate admission probability based on past merit trends
    let admissionProbability = null;
    let probabilityMessage = '';
    
    if (criteria.pastMeritTrends && criteria.pastMeritTrends.length > 0) {
      // Get average closing merit from past trends
      const closingMerits = criteria.pastMeritTrends
        .map(trend => trend.closingMerit)
        .filter(merit => merit > 0);
      
      if (closingMerits.length > 0) {
        const averageClosingMerit = closingMerits.reduce((a, b) => a + b, 0) / closingMerits.length;
        const minClosingMerit = Math.min(...closingMerits);
        const maxClosingMerit = Math.max(...closingMerits);

        if (meritPercentage >= maxClosingMerit) {
          admissionProbability = 'Very High';
          probabilityMessage = `Your merit (${meritPercentage}%) is above the highest closing merit (${maxClosingMerit}%) in recent years.`;
        } else if (meritPercentage >= averageClosingMerit) {
          admissionProbability = 'High';
          probabilityMessage = `Your merit (${meritPercentage}%) is above the average closing merit (${averageClosingMerit.toFixed(2)}%).`;
        } else if (meritPercentage >= minClosingMerit) {
          admissionProbability = 'Moderate';
          probabilityMessage = `Your merit (${meritPercentage}%) is between the minimum (${minClosingMerit}%) and average (${averageClosingMerit.toFixed(2)}%) closing merit.`;
        } else {
          admissionProbability = 'Low';
          probabilityMessage = `Your merit (${meritPercentage}%) is below the minimum closing merit (${minClosingMerit}%) in recent years.`;
        }
      }
    }

    res.status(200).json({
      success: true,
      data: {
        meritPercentage,
        admissionProbability,
        probabilityMessage,
        criteria: {
          university: criteria.university.name,
          program: criteria.program.name,
          entryTestName: criteria.entryTestName,
          entryTestRequired: criteria.entryTestRequired,
          weights: {
            matric: criteria.matricWeight,
            firstYear: criteria.firstYearWeight,
            secondYear: criteria.secondYearWeight,
            intermediate: criteria.intermediateWeight,
            entryTest: criteria.entryTestWeight
          },
          pastMeritTrends: criteria.pastMeritTrends
        }
      }
    });

  } catch (error) {
    console.error('❌ Merit calculation error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Merit calculation failed'
    });
  }
};

/**
 * @desc    Get merit criteria for a university and program
 * @route   GET /api/merit/criteria/:universityId/:programId
 * @access  Private
 */
exports.getCriteria = async (req, res) => {
  try {
    const { universityId, programId } = req.params;

    const criteria = await UniversityCriteria.findOne({
      university: universityId,
      program: programId,
      isActive: true
    })
    .populate('university', 'name city')
    .populate('program', 'name degree');

    if (!criteria) {
      return res.status(404).json({
        success: false,
        message: 'Merit criteria not found'
      });
    }

    res.status(200).json({
      success: true,
      criteria
    });

  } catch (error) {
    console.error('❌ Get criteria error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch criteria'
    });
  }
};

/**
 * @desc    Get all criteria for a university
 * @route   GET /api/merit/criteria/university/:universityId
 * @access  Private
 */
exports.getUniversityCriteria = async (req, res) => {
  try {
    const { universityId } = req.params;

    const criteriaList = await UniversityCriteria.find({
      university: universityId,
      isActive: true
    })
    .populate('program', 'name degree')
    .sort({ 'program.name': 1 });

    res.status(200).json({
      success: true,
      count: criteriaList.length,
      criteria: criteriaList
    });

  } catch (error) {
    console.error('❌ Get university criteria error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch criteria'
    });
  }
};



