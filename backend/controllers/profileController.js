const User = require('../models/User');
const { sanitizeUniversityFields } = require('../utils/sanitizeUniversityStrings');
const { getCached, setCached, invalidatePrefix } = require('../utils/simpleCache');
const {
  DISCLAIMER: TIMELINE_DISCLAIMER,
  UPCOMING_ADMISSION_WINDOWS,
  UPCOMING_ENTRY_TESTS,
} = require('../data/dashboardCurated');
const { TEST_CALENDAR_2026 } = require('../data/testCalendar2026');
const { ensureTestCalendarNotifications } = require('../services/testCalendarNotifications');

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

const PROFILE_FIELD_LABELS = {
  name: 'Full name',
  email: 'Email',
  phone: 'Phone (11 digits)',
  city: 'City',
  fatherName: "Father's name",
  gender: 'Gender',
  dateOfBirth: 'Date of birth',
  matricMarks: 'Matric obtained marks',
  matricMajors: 'Matric stream',
  intermediateType: 'Intermediate type',
  firstYearMarks: 'First year / Part-I marks',
  intermediateMarks: 'Intermediate total obtained marks',
};

function getProfileGaps(user) {
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
    'intermediateMarks',
  ];
  return requiredFields
    .filter((field) => {
      const value = user[field];
      if (value === null || value === undefined || value === '') return true;
      if (Array.isArray(value)) return value.length === 0;
      return false;
    })
    .map((field) => ({
      field,
      label: PROFILE_FIELD_LABELS[field] || field,
    }));
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
    const profileGaps = getProfileGaps(user.toObject());

    res.status(200).json({
      success: true,
      profile: user,
      profileCompletion: completion,
      profileGaps,
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
      intermediateType, firstYearMarks, secondYearMarks, intermediateMarks, intermediateTotalMarks,
      matricMarks, matricTotalMarks, matricMajors, profilePicture, secondYearResultAvailable, interests 
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
    if (intermediateTotalMarks !== undefined && intermediateTotalMarks !== '') fieldsToUpdate.intermediateTotalMarks = intermediateTotalMarks;
    if (matricMarks !== undefined && matricMarks !== '') fieldsToUpdate.matricMarks = matricMarks;
    if (matricTotalMarks !== undefined && matricTotalMarks !== '') fieldsToUpdate.matricTotalMarks = matricTotalMarks;
    if (matricMajors) fieldsToUpdate.matricMajors = matricMajors;
    if (profilePicture !== undefined) fieldsToUpdate.profilePicture = profilePicture;
    if (secondYearResultAvailable !== undefined) fieldsToUpdate.secondYearResultAvailable = secondYearResultAvailable;
    if (Array.isArray(interests)) fieldsToUpdate.interests = interests;

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    const completion = user.calculateProfileCompletion();
    user.profileCompleted = completion === 100;
    await user.save();

    console.log(`✅ Profile updated for user: ${user.email}`);
    // Bust the dashboard cache so the next visit reflects the new profile data
    invalidatePrefix(`dashboard:${req.user.id}`);

    const profileGaps = getProfileGaps(user.toObject());

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile: user,
      profileCompletion: completion,
      profileGaps,
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
    // Per-user cache — 30 s TTL matches the frontend polling interval
    const cacheKey = `dashboard:${req.user.id}`;
    const cached = getCached(cacheKey);
    if (cached) return res.status(200).json(cached);

    const AssessmentResponse = require('../models/Assessment');
    const SavedUniversity = require('../models/SavedUniversity');
    const Application = require('../models/Application');
    const Post = require('../models/Post');
    const Comment = require('../models/Comment');
    const UserActivity = require('../models/UserActivity');
    const mongoose = require('mongoose');

    // Pre-compute date variables (sync — no round-trips)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const userId = mongoose.Types.ObjectId.isValid(req.user.id)
      ? new mongoose.Types.ObjectId(req.user.id)
      : req.user.id;

    // ONE round-trip to Atlas — all 16 independent queries run concurrently
    const [
      user,
      latestAssessment,
      savedUniversitiesCount,
      applicationsCount,
      weeklyAssessments,
      weeklyPosts,
      weeklyComments,
      activityTimeData,
      totalPosts,
      totalComments,
      meritCalculatorAggregation,
      totalAssessments,
      allSavedUniversities,
      recentSavedUniversities,
      recentAssessments,
      recentApplications,
    ] = await Promise.all([
      User.findById(req.user.id)
        .select('name email role createdAt updatedAt phone city fatherName gender dateOfBirth intermediateType firstYearMarks secondYearMarks intermediateMarks intermediateTotalMarks matricMarks matricTotalMarks matricMajors secondYearResultAvailable interests profilePicture')
        .lean(),
      AssessmentResponse.findOne({ user: req.user.id })
        .select('personalityResults aptitudeResults interestResults aggregatedResults testsCompleted brainResults')
        .sort({ createdAt: -1 })
        .lean(),
      SavedUniversity.countDocuments({ user: req.user.id }),
      Application.countDocuments({ user: req.user.id, status: { $in: ['pending', 'submitted', 'under_review'] } }),
      AssessmentResponse.find({ user: req.user.id, createdAt: { $gte: sevenDaysAgo } })
        .select('createdAt').sort({ createdAt: 1 }).lean(),
      Post.find({ author: req.user.id, createdAt: { $gte: sevenDaysAgo } })
        .select('createdAt').lean(),
      Comment.find({ author: req.user.id, createdAt: { $gte: sevenDaysAgo } })
        .select('createdAt').lean(),
      UserActivity.aggregate([
        { $match: { user: userId, createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: '$section', totalMinutes: { $sum: '$duration' } } },
      ]).catch(() => []),
      Post.countDocuments({ author: req.user.id }).catch(() => 0),
      Comment.countDocuments({ author: req.user.id }).catch(() => 0),
      UserActivity.aggregate([
        { $match: { user: userId, section: 'Merit Calculator', activityType: 'calculation' } },
        { $group: { _id: null, totalMinutes: { $sum: '$duration' }, totalCalculations: { $sum: 1 } } },
      ]).catch(() => []),
      AssessmentResponse.countDocuments({ user: req.user.id }).catch(() => 0),
      SavedUniversity.find({ user: req.user.id }).select('createdAt').sort({ createdAt: 1 }).lean(),
      SavedUniversity.find({ user: req.user.id })
        .populate('university', 'name').select('university createdAt').sort({ createdAt: -1 }).limit(5).lean(),
      AssessmentResponse.find({ user: req.user.id })
        .select('interestResults createdAt').sort({ createdAt: -1 }).limit(5).lean(),
      Application.find({ user: req.user.id })
        .populate('university', 'name').select('university createdAt').sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    // Calculate profile completion manually (since we're using lean())
    const completion = calculateProfileCompletion(user);

    // ── Build activity map for the last 7 days ───────────────────────────────
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const activityData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      activityData.push({
        day: `${dayNames[date.getDay()]} ${date.getDate()}`,
        dateKey: date.toISOString().split('T')[0],
        dayIndex: i,
        assessments: 0,
        community: 0,
        hours: 0,
      });
    }
    const activityMap = {};
    activityData.forEach((d) => { activityMap[d.dateKey] = d; });

    weeklyAssessments.forEach((a) => {
      const d = activityMap[a.createdAt.toISOString().split('T')[0]];
      if (d) { d.assessments += 1; d.hours += 2; }
    });
    [...weeklyPosts, ...weeklyComments].forEach((item) => {
      const d = activityMap[item.createdAt.toISOString().split('T')[0]];
      if (d) { d.community += 1; d.hours += 0.5; }
    });
    const finalActivityData = activityData.map(({ dateKey, dayIndex, ...rest }) => ({
      ...rest,
      hours: Math.round(rest.hours),
    }));

    // ── Time spent ────────────────────────────────────────────────────────────
    const sectionMinutes = {};
    activityTimeData.forEach((item) => { sectionMinutes[item._id] = item.totalMinutes; });

    const communityMinutes = (totalPosts * 15) + (totalComments * 5);
    const communityHours = Math.max(0, Math.round((sectionMinutes['Community'] || 0) / 60 + communityMinutes / 60));
    const universityExplorerHours = Math.max(0, Math.round((sectionMinutes['University Explorer'] || 0) / 60 + (savedUniversitiesCount * 10) / 60));
    const meritCalculatorMinutes = meritCalculatorAggregation.length > 0 ? meritCalculatorAggregation[0].totalMinutes : 0;
    const meritCalculatorHours = Math.max(0, Math.round(meritCalculatorMinutes / 60));
    const assessmentMinutes = totalAssessments * 30;
    const careerAssessmentHours = Math.max(0, Math.round((sectionMinutes['Career Assessment'] || 0) / 60 + assessmentMinutes / 60));

    const timeSpentData = [
      { name: 'Community', hours: communityHours, color: '#1e3a5f' },
      { name: 'University Explorer', hours: universityExplorerHours, color: '#2563eb' },
      { name: 'Merit Calculator', hours: meritCalculatorHours, color: '#3b82f6' },
      { name: 'Career Assessment', hours: careerAssessmentHours, color: '#f59e0b' },
    ];

    // ── Universities progress (last 8 weeks) ─────────────────────────────────
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    oneWeekAgo.setHours(0, 0, 0, 0);
    const universitiesProgress = [];
    let savedIndex = 0;
    let thisWeekCount = 0;
    for (let week = 7; week >= 0; week--) {
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() - week * 7);
      weekEnd.setHours(23, 59, 59, 999);
      while (savedIndex < allSavedUniversities.length && allSavedUniversities[savedIndex].createdAt <= weekEnd) {
        if (week === 0 && allSavedUniversities[savedIndex].createdAt >= oneWeekAgo) thisWeekCount++;
        savedIndex++;
      }
      universitiesProgress.push({ week: `Week ${8 - week}`, universities: savedIndex });
    }

    // ── Recent activities ─────────────────────────────────────────────────────
    const recentActivities = [];
    recentSavedUniversities.forEach((saved) => {
      if (saved.university) {
        const nm = sanitizeUniversityFields({ name: saved.university.name }).name || saved.university.name;
        recentActivities.push({ type: 'saved_university', action: 'Saved university', detail: nm, timestamp: saved.createdAt, icon: 'bookmark' });
      }
    });
    recentAssessments.forEach((assessment) => {
      let pathway = 'Career Assessment';
      if (assessment.interestResults?.topPathways?.length > 0) pathway = assessment.interestResults.topPathways[0];
      recentActivities.push({ type: 'assessment', action: 'Completed career assessment', detail: pathway, timestamp: assessment.createdAt, icon: 'check' });
    });
    if (user.updatedAt && user.updatedAt.getTime() !== user.createdAt.getTime()) {
      const daysSinceUpdate = Math.floor((Date.now() - user.updatedAt.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceUpdate <= 30) {
        recentActivities.push({ type: 'profile_update', action: 'Updated profile', detail: 'Profile information updated', timestamp: user.updatedAt, icon: 'user' });
      }
    }
    recentApplications.forEach((application) => {
      if (application.university) {
        const nm = sanitizeUniversityFields({ name: application.university.name }).name || application.university.name;
        recentActivities.push({ type: 'application', action: 'Submitted application', detail: nm, timestamp: application.createdAt, icon: 'file' });
      }
    });
    recentActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    const topRecentActivities = recentActivities.slice(0, 10).map(({ type, action, detail, timestamp, icon }) => ({ type, action, detail, timestamp, icon }));

    // ── Assessment scores ─────────────────────────────────────────────────────
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

    // --- Proposal: personalized hub — career suggestions from assessments ---
    const tc = latestAssessment?.aggregatedResults?.topCareers || [];
    const testsDone = latestAssessment?.testsCompleted || {};
    const threeForManzil =
      testsDone.personality === true &&
      testsDone.interest === true &&
      (testsDone.brain === true || testsDone.aptitude === true);
    let careerHubMessage =
      'Complete all three career assessments (Personality, Brain Hemisphere, and Career Path Profiler) to unlock personalized career field suggestions on your dashboard.';
    if (latestAssessment && !threeForManzil) {
      const missing = [];
      if (!testsDone.personality) missing.push('Personality');
      if (!testsDone.brain && !testsDone.aptitude) missing.push('Brain Hemisphere');
      if (!testsDone.interest) missing.push('Career Path Profiler');
      careerHubMessage = `Finish your assessments to see tailored suggestions. Still pending: ${missing.join(', ') || 'one or more tests'}.`;
    } else if (threeForManzil && tc.length === 0) {
      careerHubMessage =
        'Your tests are complete. Open Career Assessment and use Refresh recommendations if suggestions do not appear yet.';
    }

    const profileGaps = getProfileGaps(user);

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
      careerSuggestions: {
        topCareers: (tc || []).slice(0, 3).map((c) => ({
          career: c.career || c.category || 'Career field',
          score: Math.round(c.score || 0),
          description: c.description || '',
        })),
        testsCompleted: testsDone,
        allMainTestsDone: threeForManzil,
        message: careerHubMessage,
      },
      timelines: {
        disclaimer: TIMELINE_DISCLAIMER,
        admissionWindows: UPCOMING_ADMISSION_WINDOWS,
        entryTests: UPCOMING_ENTRY_TESTS,
        testCalendar2026: TEST_CALENDAR_2026,
      },
      profileGaps,
      graphs: {
        weeklyActivity: finalActivityData,
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

    // Fire-and-forget: sync upcoming test/admission milestones into in-app notifications.
    // Not awaited so it never blocks the response.
    ensureTestCalendarNotifications(req.user.id).catch((err) => {
      console.warn('[dashboard] test calendar notifications:', err?.message || err);
    });

    const payload = { success: true, dashboard: dashboardData };
    // Cache per user for 30 s — matches the frontend polling interval
    setCached(cacheKey, payload, 30_000);
    res.status(200).json(payload);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};










