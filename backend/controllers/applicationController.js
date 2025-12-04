const Application = require('../models/Application');
const Program = require('../models/Program');
const University = require('../models/University');

/**
 * @desc    Submit an application for a program
 * @route   POST /api/applications
 * @access  Private
 */
exports.submitApplication = async (req, res) => {
  try {
    const { universityId, programId, notes } = req.body;

    if (!universityId || !programId) {
      return res.status(400).json({
        success: false,
        message: 'University ID and Program ID are required'
      });
    }

    // Check if program exists
    const program = await Program.findById(programId).populate('university');
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }

    // Check if already applied
    const existing = await Application.findOne({
      user: req.user.id,
      program: programId
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this program'
      });
    }

    // Create application
    const application = await Application.create({
      user: req.user.id,
      university: universityId,
      program: programId,
      status: 'pending',
      notes: notes || ''
    });

    await application.populate('university program');

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this program'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get all applications for current user
 * @route   GET /api/applications
 * @access  Private
 */
exports.getApplications = async (req, res) => {
  try {
    const applications = await Application.find({ user: req.user.id })
      .populate('university program')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get single application
 * @route   GET /api/applications/:applicationId
 * @access  Private
 */
exports.getApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.applicationId)
      .populate('university program');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if application belongs to user
    if (application.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this application'
      });
    }

    res.status(200).json({
      success: true,
      application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Update application status
 * @route   PUT /api/applications/:applicationId
 * @access  Private
 */
exports.updateApplication = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const application = await Application.findById(req.params.applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if application belongs to user
    if (application.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application'
      });
    }

    if (status) application.status = status;
    if (notes !== undefined) application.notes = notes;

    await application.save();
    await application.populate('university program');

    res.status(200).json({
      success: true,
      message: 'Application updated successfully',
      application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Delete/Cancel an application
 * @route   DELETE /api/applications/:applicationId
 * @access  Private
 */
exports.deleteApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if application belongs to user
    if (application.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this application'
      });
    }

    await application.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Application deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



