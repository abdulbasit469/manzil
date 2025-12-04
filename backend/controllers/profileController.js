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

    // Get assessment data for graphs
    const AssessmentResponse = require('../models/Assessment');
    const latestAssessment = await AssessmentResponse.findOne({ user: req.user.id })
      .sort({ createdAt: -1 });

    // Calculate assessment scores for graphs
    let assessmentScores = [];
    if (latestAssessment) {
      if (latestAssessment.personalityResults?.normalizedScores) {
        const personalityAvg = Object.values(latestAssessment.personalityResults.normalizedScores)
          .reduce((sum, val) => sum + val, 0) / 6;
        assessmentScores.push({ category: 'Personality', score: Math.round(personalityAvg) });
      }
      if (latestAssessment.aptitudeResults?.normalizedSectionScores) {
        const aptitudeAvg = Object.values(latestAssessment.aptitudeResults.normalizedSectionScores)
          .reduce((sum, val) => sum + (val || 0), 0) / Object.keys(latestAssessment.aptitudeResults.normalizedSectionScores).length;
        assessmentScores.push({ category: 'Aptitude', score: Math.round(aptitudeAvg) });
      }
      if (latestAssessment.interestResults?.normalizedScores) {
        const interestAvg = Object.values(latestAssessment.interestResults.normalizedScores)
          .reduce((sum, val) => sum + val, 0) / Object.keys(latestAssessment.interestResults.normalizedScores).length;
        assessmentScores.push({ category: 'Interest', score: Math.round(interestAvg) });
      }
    }

    // Get weekly activity (last 7 days of assessment activity)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const weeklyAssessments = await AssessmentResponse.find({
      user: req.user.id,
      createdAt: { $gte: sevenDaysAgo }
    }).sort({ createdAt: 1 });

    // Group by day of week
    const activityData = [
      { day: 'Mon', value: 0 },
      { day: 'Tue', value: 0 },
      { day: 'Wed', value: 0 },
      { day: 'Thu', value: 0 },
      { day: 'Fri', value: 0 },
      { day: 'Sat', value: 0 },
      { day: 'Sun', value: 0 }
    ];

    weeklyAssessments.forEach(assessment => {
      const dayIndex = assessment.createdAt.getDay();
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayName = dayNames[dayIndex];
      const dayData = activityData.find(d => d.day === dayName);
      if (dayData) {
        dayData.value += 10; // Increment activity
      }
    });

    // Normalize activity values to 0-100 scale
    const maxActivity = Math.max(...activityData.map(d => d.value), 1);
    activityData.forEach(day => {
      day.value = Math.round((day.value / maxActivity) * 100);
    });

    // Get saved universities count
    const SavedUniversity = require('../models/SavedUniversity');
    const savedUniversitiesCount = await SavedUniversity.countDocuments({ user: req.user.id });

    // Get applications count
    const Application = require('../models/Application');
    const applicationsCount = await Application.countDocuments({ 
      user: req.user.id,
      status: { $in: ['pending', 'submitted', 'under_review'] }
    });

    const dashboardData = {
      user: {
        name: user.name,
        email: user.email,
        role: user.role
      },
      profileCompletion: completion,
      stats: {
        savedUniversities: savedUniversitiesCount,
        assessmentTaken: !!latestAssessment,
        applicationsInProgress: applicationsCount
      },
      graphs: {
        weeklyActivity: activityData,
        assessmentScores: assessmentScores.length > 0 ? assessmentScores : [
          { category: 'Personality', score: 0 },
          { category: 'Aptitude', score: 0 },
          { category: 'Interest', score: 0 }
        ]
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










