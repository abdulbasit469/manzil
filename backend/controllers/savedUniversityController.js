const SavedUniversity = require('../models/SavedUniversity');
const University = require('../models/University');

/**
 * @desc    Save/Bookmark a university
 * @route   POST /api/saved-universities
 * @access  Private
 */
exports.saveUniversity = async (req, res) => {
  try {
    const { universityId } = req.body;

    if (!universityId) {
      return res.status(400).json({
        success: false,
        message: 'University ID is required'
      });
    }

    // Check if university exists
    const university = await University.findById(universityId);
    if (!university) {
      return res.status(404).json({
        success: false,
        message: 'University not found'
      });
    }

    // Check if already saved
    const existing = await SavedUniversity.findOne({
      user: req.user.id,
      university: universityId
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'University already saved'
      });
    }

    // Save university
    const savedUniversity = await SavedUniversity.create({
      user: req.user.id,
      university: universityId
    });

    res.status(201).json({
      success: true,
      message: 'University saved successfully',
      savedUniversity
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Unsave/Remove a saved university
 * @route   DELETE /api/saved-universities/:universityId
 * @access  Private
 */
exports.unsaveUniversity = async (req, res) => {
  try {
    const { universityId } = req.params;

    const savedUniversity = await SavedUniversity.findOneAndDelete({
      user: req.user.id,
      university: universityId
    });

    if (!savedUniversity) {
      return res.status(404).json({
        success: false,
        message: 'Saved university not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'University removed from saved list'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get all saved universities for current user
 * @route   GET /api/saved-universities
 * @access  Private
 */
exports.getSavedUniversities = async (req, res) => {
  try {
    const savedUniversities = await SavedUniversity.find({ user: req.user.id })
      .populate('university')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: savedUniversities.length,
      savedUniversities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Check if a university is saved by current user
 * @route   GET /api/saved-universities/check/:universityId
 * @access  Private
 */
exports.checkSaved = async (req, res) => {
  try {
    const { universityId } = req.params;

    const saved = await SavedUniversity.findOne({
      user: req.user.id,
      university: universityId
    });

    res.status(200).json({
      success: true,
      isSaved: !!saved
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



