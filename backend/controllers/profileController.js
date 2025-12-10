const User = require('../models/User');

// Helper function to calculate profile completion (for use with lean() queries)
function calculateProfileCompletion(user) {
  const requiredFields = [
    'name', 
    'email', 
    'phone', 
    'city', 
    'fatherName',
    'gender',
    'dateOfBirth',
    'matricMarks',
    'matricMajors',
    'intermediateType',
    'firstYearMarks',
    'intermediateMarks'
  ];
  
  const completed = requiredFields.filter(field => {
    const value = user[field];
    // Check if field has a value (not null, undefined, or empty string)
    if (value === null || value === undefined || value === '') {
      return false;
    }
    // For arrays, check if not empty
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return true;
  }).length;
  
  const percentage = Math.round((completed / requiredFields.length) * 100);
  return percentage;
}

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
    // Only select needed fields for better performance
    const user = await User.findById(req.user.id)
      .select('name email role createdAt updatedAt phone city fatherName gender dateOfBirth intermediateType firstYearMarks secondYearMarks intermediateMarks matricMarks matricMajors interests')
      .lean();
    
    // Calculate profile completion manually (since we're using lean())
    const completion = calculateProfileCompletion(user);

    // Get assessment data for graphs - OPTIMIZED (parallel queries)
    const AssessmentResponse = require('../models/Assessment');
    const SavedUniversity = require('../models/SavedUniversity');
    const Application = require('../models/Application');
    
    // Run independent queries in parallel for better performance
    const [latestAssessment, savedUniversitiesCount, applicationsCount] = await Promise.all([
      AssessmentResponse.findOne({ user: req.user.id })
        .select('personalityResults aptitudeResults interestResults')
        .sort({ createdAt: -1 })
        .lean(),
      SavedUniversity.countDocuments({ user: req.user.id }),
      Application.countDocuments({ 
        user: req.user.id,
        status: { $in: ['pending', 'submitted', 'under_review'] }
      })
    ]);

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

    // Get weekly activity (last 7 calendar days) - OPTIMIZED
    // Get the last 7 days including today
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    // Create array for last 7 days (oldest to newest)
    const activityData = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = dayNames[date.getDay()];
      const dayNumber = date.getDate();
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      // Format: "Mon 15" or "Mon 15 Jan"
      activityData.push({
        day: `${dayName} ${dayNumber}`,
        dateKey: date.toISOString().split('T')[0], // For grouping: YYYY-MM-DD
        dayIndex: i,
        assessments: 0,
        community: 0,
        hours: 0
      });
    }
    
    // Create a map for quick lookup
    const activityMap = {};
    activityData.forEach(day => {
      activityMap[day.dateKey] = day;
    });
    
    // Get date range for last 7 days (including today)
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // Last 7 days including today
    sevenDaysAgo.setHours(0, 0, 0, 0); // Start of the oldest day
    
    // Use lean() and only select needed fields for better performance
    const weeklyAssessments = await AssessmentResponse.find({
      user: req.user.id,
      createdAt: { $gte: sevenDaysAgo }
    })
    .select('createdAt')
    .sort({ createdAt: 1 })
    .lean();

    // Count assessments by actual date
    weeklyAssessments.forEach(assessment => {
      const dateKey = assessment.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD
      const dayData = activityMap[dateKey];
      if (dayData) {
        dayData.assessments += 1;
        dayData.hours += 2; // Estimate 2 hours per assessment
      }
    });

    // Get community posts/comments activity - OPTIMIZED
    const Post = require('../models/Post');
    const Comment = require('../models/Comment');
    
    // Use Promise.all for parallel queries and lean() for performance
    const [weeklyPosts, weeklyComments] = await Promise.all([
      Post.find({
        author: req.user.id,
        createdAt: { $gte: sevenDaysAgo }
      })
      .select('createdAt')
      .lean(),
      Comment.find({
        author: req.user.id,
        createdAt: { $gte: sevenDaysAgo }
      })
      .select('createdAt')
      .lean()
    ]);

    [...weeklyPosts, ...weeklyComments].forEach(item => {
      const dateKey = item.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD
      const dayData = activityMap[dateKey];
      if (dayData) {
        dayData.community += 1;
        dayData.hours += 0.5; // Estimate 0.5 hours per community interaction
      }
    });

    // Round hours to whole numbers and remove dateKey from response
    const finalActivityData = activityData.map(({ dateKey, dayIndex, ...rest }) => ({
      ...rest,
      hours: Math.round(rest.hours)
    }));

    // Calculate time spent in each section - REAL DATA from actual activities
    const UserActivity = require('../models/UserActivity');
    const mongoose = require('mongoose');
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Get time spent data from UserActivity model (if exists) or calculate from activities
    const timeSpentData = [];
    
    // Try to get from UserActivity model first (convert string ID to ObjectId)
    const userId = mongoose.Types.ObjectId.isValid(req.user.id) 
      ? new mongoose.Types.ObjectId(req.user.id) 
      : req.user.id;
    
    const activityTimeData = await UserActivity.aggregate([
      {
        $match: {
          user: userId,
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: '$section',
          totalMinutes: { $sum: '$duration' }
        }
      }
    ]).catch(() => []); // If UserActivity doesn't exist yet, return empty array
    
    // Create a map of section to minutes
    const sectionMinutes = {};
    activityTimeData.forEach(item => {
      sectionMinutes[item._id] = item.totalMinutes;
    });
    
    // Calculate time spent for each section based on REAL activities from database
    // Get ALL posts and comments (not just weekly) for accurate time calculation
    const [totalPosts, totalComments] = await Promise.all([
      Post.countDocuments({ author: req.user.id }).catch(() => 0),
      Comment.countDocuments({ author: req.user.id }).catch(() => 0)
    ]);
    
    // 1. Community: Based on ALL posts/comments (estimate 15 min per post, 5 min per comment)
    // Also add UserActivity data if exists
    const communityMinutes = (totalPosts * 15) + (totalComments * 5);
    const communityHours = Math.max(0, Math.round((sectionMinutes['Community'] || 0) / 60 + communityMinutes / 60));
    
    // 2. University Explorer: Based on saved universities (estimate 10 min per save)
    // Also add UserActivity data if exists
    const universityExplorerMinutes = savedUniversitiesCount * 10;
    const universityExplorerHours = Math.max(0, Math.round((sectionMinutes['University Explorer'] || 0) / 60 + universityExplorerMinutes / 60));
    
    // 3. Merit Calculator: Get ALL calculations from UserActivity (real data from database)
    // Get total minutes from ALL merit calculations (not just last 30 days)
    const meritCalculatorAggregation = await UserActivity.aggregate([
      {
        $match: {
          user: userId,
          section: 'Merit Calculator',
          activityType: 'calculation'
        }
      },
      {
        $group: {
          _id: null,
          totalMinutes: { $sum: '$duration' },
          totalCalculations: { $sum: 1 }
        }
      }
    ]).catch(() => []);
    
    // Get total minutes from all-time calculations
    const meritCalculatorMinutes = meritCalculatorAggregation.length > 0 
      ? meritCalculatorAggregation[0].totalMinutes 
      : 0;
    
    // Also add any activity from last 30 days if not already included in all-time sum
    // (This handles edge cases where aggregation might miss some data)
    const meritCalculatorHours = Math.max(0, Math.round(meritCalculatorMinutes / 60));
    
    // 4. Career Assessment: Based on ALL assessment completions (estimate 30 min per test)
    // Also add UserActivity data if exists
    const totalAssessments = await AssessmentResponse.countDocuments({ user: req.user.id }).catch(() => 0);
    const assessmentMinutes = totalAssessments * 30; // 30 minutes per assessment
    const careerAssessmentHours = Math.max(0, Math.round((sectionMinutes['Career Assessment'] || 0) / 60 + assessmentMinutes / 60));
    
    // Build time spent data array - ensure all 4 categories are included
    timeSpentData.push(
      { name: 'Community', hours: communityHours, color: '#1e3a5f' },
      { name: 'University Explorer', hours: universityExplorerHours, color: '#2563eb' },
      { name: 'Merit Calculator', hours: meritCalculatorHours, color: '#3b82f6' },
      { name: 'Career Assessment', hours: careerAssessmentHours, color: '#f59e0b' }
    );

    // savedUniversitiesCount already fetched above in parallel

    // Calculate universities explored progress (last 8 weeks) - OPTIMIZED
    const universitiesProgress = [];
    const now = new Date();
    now.setHours(23, 59, 59, 999); // End of today
    
    // Get all saved universities with timestamps - only select createdAt field for efficiency
    const allSavedUniversities = await SavedUniversity.find({ user: req.user.id })
      .select('createdAt')
      .sort({ createdAt: 1 })
      .lean(); // Use lean() for faster queries
    
    // Calculate this week's increase (universities saved in the last 7 days)
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    oneWeekAgo.setHours(0, 0, 0, 0);
    
    let thisWeekCount = 0;
    let savedIndex = 0; // Track position in sorted array
    
    // Calculate progress for each of the last 8 weeks in one pass
    for (let week = 7; week >= 0; week--) {
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() - (week * 7));
      weekEnd.setHours(23, 59, 59, 999);
      
      // Count universities saved up to the end of this week
      // Since array is sorted, we can continue from where we left off
      while (savedIndex < allSavedUniversities.length && 
             allSavedUniversities[savedIndex].createdAt <= weekEnd) {
        // Count this week's additions
        if (week === 0 && allSavedUniversities[savedIndex].createdAt >= oneWeekAgo) {
          thisWeekCount++;
        }
        savedIndex++;
      }
      
      universitiesProgress.push({
        week: `Week ${8 - week}`,
        universities: savedIndex
      });
    }

    // applicationsCount already fetched above in parallel

    // Get recent activities (last 10 activities)
    const recentActivities = [];
    
    // Get recently saved universities (last 5) - OPTIMIZED
    const recentSavedUniversities = await SavedUniversity.find({ user: req.user.id })
      .populate('university', 'name')
      .select('university createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    
    recentSavedUniversities.forEach(saved => {
      if (saved.university) {
        recentActivities.push({
          type: 'saved_university',
          action: 'Saved university',
          detail: saved.university.name,
          timestamp: saved.createdAt,
          icon: 'bookmark'
        });
      }
    });

    // Get recent assessments (last 5) - OPTIMIZED
    const recentAssessments = await AssessmentResponse.find({ user: req.user.id })
      .select('interestResults createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    
    recentAssessments.forEach(assessment => {
      let pathway = 'Career Assessment';
      if (assessment.interestResults?.topPathways && assessment.interestResults.topPathways.length > 0) {
        pathway = assessment.interestResults.topPathways[0];
      }
      recentActivities.push({
        type: 'assessment',
        action: 'Completed career assessment',
        detail: pathway,
        timestamp: assessment.createdAt,
        icon: 'check'
      });
    });

    // Get recent profile updates (check user updatedAt vs createdAt)
    if (user.updatedAt && user.updatedAt.getTime() !== user.createdAt.getTime()) {
      const daysSinceUpdate = Math.floor((Date.now() - user.updatedAt.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceUpdate <= 30) {
        recentActivities.push({
          type: 'profile_update',
          action: 'Updated profile',
          detail: 'Profile information updated',
          timestamp: user.updatedAt,
          icon: 'user'
        });
      }
    }

    // Get recent applications (last 5) - OPTIMIZED
    const recentApplications = await Application.find({ user: req.user.id })
      .populate('university', 'name')
      .select('university createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    
    recentApplications.forEach(application => {
      if (application.university) {
        recentActivities.push({
          type: 'application',
          action: 'Submitted application',
          detail: application.university.name,
          timestamp: application.createdAt,
          icon: 'file'
        });
      }
    });

    // Sort all activities by timestamp (most recent first) and take top 10
    recentActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    const topRecentActivities = recentActivities.slice(0, 10).map(activity => ({
      type: activity.type,
      action: activity.action,
      detail: activity.detail,
      timestamp: activity.timestamp,
      icon: activity.icon
    }));

    const dashboardData = {
      user: {
        name: user.name,
        email: user.email,
        role: user.role
      },
      profileCompletion: completion,
      stats: {
        savedUniversities: savedUniversitiesCount,
        universitiesThisWeek: thisWeekCount,
        assessmentTaken: !!latestAssessment,
        applicationsInProgress: applicationsCount
      },
      graphs: {
        weeklyActivity: activityData,
        assessmentScores: assessmentScores.length > 0 ? assessmentScores : [
          { category: 'Personality', score: 0 },
          { category: 'Aptitude', score: 0 },
          { category: 'Interest', score: 0 }
        ],
        timeSpent: timeSpentData
      },
      recentActivity: topRecentActivities,
      universitiesProgress: universitiesProgress
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










