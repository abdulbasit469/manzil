const User = require('../models/User');

/**
 * @desc    Get current user profile
 * @route   GET /api/profile
 * @access  Private
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const completion = user.calculateProfileCompletion();

    res.status(200).json({
      success: true,
      profile: user,
      profileCompletion: completion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/profile
 * @access  Private
 */
exports.updateProfile = async (req, res) => {
  try {
    const { 
      name, phone, city, fatherName, gender, dateOfBirth,
      intermediateType, firstYearMarks, secondYearMarks, intermediateMarks, 
      matricMarks, matricMajors, profilePicture, secondYearResultAvailable, interests 
    } = req.body;

    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (phone) fieldsToUpdate.phone = phone;
    if (city) fieldsToUpdate.city = city;
    if (fatherName !== undefined) fieldsToUpdate.fatherName = fatherName;
    if (gender) fieldsToUpdate.gender = gender;
    if (dateOfBirth) fieldsToUpdate.dateOfBirth = dateOfBirth;
    if (intermediateType) fieldsToUpdate.intermediateType = intermediateType;
    if (firstYearMarks !== undefined && firstYearMarks !== '') fieldsToUpdate.firstYearMarks = firstYearMarks;
    if (secondYearMarks !== undefined && secondYearMarks !== '') fieldsToUpdate.secondYearMarks = secondYearMarks;
    if (intermediateMarks !== undefined && intermediateMarks !== '') fieldsToUpdate.intermediateMarks = intermediateMarks;
    if (matricMarks !== undefined && matricMarks !== '') fieldsToUpdate.matricMarks = matricMarks;
    if (matricMajors) fieldsToUpdate.matricMajors = matricMajors;
    if (profilePicture !== undefined) fieldsToUpdate.profilePicture = profilePicture;
    if (secondYearResultAvailable !== undefined) fieldsToUpdate.secondYearResultAvailable = secondYearResultAvailable;
    if (interests) fieldsToUpdate.interests = interests;

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    const completion = user.calculateProfileCompletion();
    user.profileCompleted = completion === 100;
    await user.save();

    console.log(`✅ Profile updated for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile: user,
      profileCompletion: completion
    });
  } catch (error) {
    console.error('❌ Profile update error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get profile completion percentage
 * @route   GET /api/profile/completion
 * @access  Private
 */
exports.getProfileCompletion = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const completion = user.calculateProfileCompletion();

    res.status(200).json({
      success: true,
      completion,
      isComplete: completion === 100
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get student dashboard data
 * @route   GET /api/dashboard
 * @access  Private (Student)
 */
exports.getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const completion = user.calculateProfileCompletion();

    // TODO: Add more dashboard stats (saved universities, assessment status, etc.)
    const dashboardData = {
      user: {
        name: user.name,
        email: user.email,
        role: user.role
      },
      profileCompletion: completion,
      stats: {
        savedUniversities: 0, // TODO: Implement later
        assessmentTaken: false, // TODO: Implement later
        applicationsInProgress: 0 // TODO: Implement later
      },
      recentActivity: [] // TODO: Implement later
    };

    res.status(200).json({
      success: true,
      dashboard: dashboardData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};










