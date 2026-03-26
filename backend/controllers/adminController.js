const User = require('../models/User');
const University = require('../models/University');
const Program = require('../models/Program');
const AssessmentResponse = require('../models/Assessment');
const UniversityCriteria = require('../models/UniversityCriteria');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const SavedUniversity = require('../models/SavedUniversity');
const Application = require('../models/Application');

// Helper function to format time ago
function formatTimeAgo(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) {
    const mins = Math.floor(diffInSeconds / 60);
    return `${mins} minute${mins > 1 ? 's' : ''} ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  }
  const months = Math.floor(diffInSeconds / 2592000);
  return `${months} month${months > 1 ? 's' : ''} ago`;
}

/**
 * Get all users
 */
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      users
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get single user
 */
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update user role
 */
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log(`✅ User role updated: ${user.email} -> ${role}`);
    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      user
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Delete user
 */
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent deleting admin users (optional safety check)
    if (user.role === 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Cannot delete admin users' 
      });
    }

    // Import required models
    const Post = require('../models/Post');
    const Comment = require('../models/Comment');
    const SavedUniversity = require('../models/SavedUniversity');
    const AssessmentResponse = require('../models/Assessment');
    const UserActivity = require('../models/UserActivity');
    const Application = require('../models/Application');

    // Delete all related data in parallel for better performance
    await Promise.all([
      // Delete all posts by this user and their comments
      (async () => {
        const userPosts = await Post.find({ author: userId });
        const postIds = userPosts.map(post => post._id);
        // Delete comments on user's posts
        await Comment.deleteMany({ post: { $in: postIds } });
        // Delete user's posts
        await Post.deleteMany({ author: userId });
        // Delete user's comments on other posts
        await Comment.deleteMany({ author: userId });
      })(),
      // Delete saved universities
      SavedUniversity.deleteMany({ user: userId }),
      // Delete assessment responses
      AssessmentResponse.deleteMany({ user: userId }),
      // Delete user activity records
      UserActivity.deleteMany({ user: userId }),
      // Delete applications
      Application.deleteMany({ user: userId })
    ]);

    // Finally, delete the user
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: 'User and all related data deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Get platform statistics
 */
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalUniversities = await University.countDocuments();
    const universitiesPublic = await University.countDocuments({ type: 'Public' });
    const universitiesPrivate = await University.countDocuments({ type: 'Private' });
    const totalPrograms = await Program.countDocuments();
    const totalAssessments = await AssessmentResponse.countDocuments();
    const totalPosts = await Post.countDocuments();
    const totalComments = await Comment.countDocuments();
    
    // Calculate today's posts
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayPosts = await Post.countDocuments({
      createdAt: { $gte: startOfToday }
    });
    
    // Calculate pending posts
    const pendingPosts = await Post.countDocuments({
      status: 'pending'
    });
    
    // Calculate new students this month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newStudentsThisMonth = await User.countDocuments({
      role: 'student',
      createdAt: { $gte: startOfMonth }
    });
    
    // Calculate month-over-month changes (last 30 days vs previous 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    
    const studentsLastMonth = await User.countDocuments({ 
      role: 'student',
      createdAt: { $gte: thirtyDaysAgo }
    });
    const studentsPreviousMonth = await User.countDocuments({ 
      role: 'student',
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
    });
    const studentsChange = studentsPreviousMonth > 0 
      ? ((studentsLastMonth - studentsPreviousMonth) / studentsPreviousMonth * 100).toFixed(1)
      : studentsLastMonth > 0 ? '100.0' : '0.0';
    
    const postsLastMonth = await Post.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo }
    });
    const postsPreviousMonth = await Post.countDocuments({ 
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
    });
    const postsChange = postsPreviousMonth > 0 
      ? ((postsLastMonth - postsPreviousMonth) / postsPreviousMonth * 100).toFixed(1)
      : postsLastMonth > 0 ? '100.0' : '0.0';
    
    const universitiesLastMonth = await University.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo }
    });
    const universitiesPreviousMonth = await University.countDocuments({ 
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
    });
    const universitiesChange = universitiesPreviousMonth > 0 
      ? ((universitiesLastMonth - universitiesPreviousMonth) / universitiesPreviousMonth * 100).toFixed(1)
      : universitiesLastMonth > 0 ? '100.0' : '0.0';
    
    const assessmentsLastMonth = await AssessmentResponse.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo }
    });
    const assessmentsPreviousMonth = await AssessmentResponse.countDocuments({ 
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
    });
    const assessmentsChange = assessmentsPreviousMonth > 0 
      ? ((assessmentsLastMonth - assessmentsPreviousMonth) / assessmentsPreviousMonth * 100).toFixed(1)
      : assessmentsLastMonth > 0 ? '100.0' : '0.0';

    // Calculate engagement rate - percentage of students who have engaged with the platform
    // A student is considered "engaged" if they have done at least one of:
    // - Completed an assessment
    // - Saved a university
    // - Created a post or comment
    // - Used merit calculator (has UserActivity record)
    let engagedStudents = 0;
    if (totalStudents > 0) {
      // Get unique students who have completed assessments
      const studentsWithAssessments = await AssessmentResponse.distinct('user');
      
      // Get unique students who have saved universities
      const studentsWithSavedUnis = await SavedUniversity.distinct('user');
      
      // Get unique students who have created posts or comments
      const studentsWithPosts = await Post.distinct('author');
      const studentsWithComments = await Comment.distinct('author');
      
      // Get unique students who have used merit calculator
      const UserActivity = require('../models/UserActivity');
      const studentsWithMeritCalc = await UserActivity.distinct('user', {
        section: 'Merit Calculator'
      }).catch(() => []);
      
      // Combine all unique engaged student IDs
      const allEngagedStudentIds = new Set([
        ...studentsWithAssessments.map(id => id.toString()),
        ...studentsWithSavedUnis.map(id => id.toString()),
        ...studentsWithPosts.map(id => id.toString()),
        ...studentsWithComments.map(id => id.toString()),
        ...studentsWithMeritCalc.map(id => id.toString())
      ]);
      
      engagedStudents = allEngagedStudentIds.size;
    }
    
    const engagementRate = totalStudents > 0 
      ? Math.round((engagedStudents / totalStudents) * 100)
      : 0;

    const stats = {
      users: {
        total: totalUsers,
        students: totalStudents,
        admins: totalAdmins,
        newThisMonth: newStudentsThisMonth,
        engagementRate: engagementRate
      },
      universities: totalUniversities,
      universitiesPublic,
      universitiesPrivate,
      programs: totalPrograms,
      assessments: totalAssessments,
      posts: totalPosts,
      comments: totalComments,
      todayPosts: todayPosts,
      pendingPosts: pendingPosts,
      changes: {
        students: parseFloat(studentsChange),
        posts: parseFloat(postsChange),
        universities: parseFloat(universitiesChange),
        assessments: parseFloat(assessmentsChange)
      }
    };

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get recent activities for admin dashboard
 */
exports.getRecentActivities = async (req, res) => {
  try {
    const activities = [];
    const limit = 5; // Only fetch 5 most recent activities
    
    // Get recent assessments
    const recentAssessments = await AssessmentResponse.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    
    recentAssessments.forEach(assessment => {
      if (assessment.user) {
        activities.push({
          user: assessment.user.name,
          action: 'completed Career Assessment',
          time: formatTimeAgo(assessment.createdAt),
          timestamp: assessment.createdAt
        });
      }
    });
    
    // Get recent posts
    const recentPosts = await Post.find()
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    
    recentPosts.forEach(post => {
      if (post.author) {
        activities.push({
          user: post.author.name,
          action: 'created a community post',
          time: formatTimeAgo(post.createdAt),
          timestamp: post.createdAt
        });
      }
    });
    
    // Get recent saved universities
    const recentSaved = await SavedUniversity.find()
      .populate('user', 'name email')
      .populate('university', 'name')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    
    recentSaved.forEach(saved => {
      if (saved.user && saved.university) {
        activities.push({
          user: saved.user.name,
          action: `saved ${saved.university.name} to favorites`,
          time: formatTimeAgo(saved.createdAt),
          timestamp: saved.createdAt
        });
      }
    });
    
    // Get recent user registrations
    const recentUsers = await User.find({ role: 'student' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    
    recentUsers.forEach(user => {
      activities.push({
        user: user.name,
        action: 'joined the platform',
        time: formatTimeAgo(user.createdAt),
        timestamp: user.createdAt
      });
    });
    
    // Sort by timestamp and return top 5
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.status(200).json({
      success: true,
      activities: activities.slice(0, 5) // Return only 5 activities
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get all assessments (Admin only)
 */
exports.getAllAssessments = async (req, res) => {
  try {
    console.log('📊 Fetching all assessments for admin...');
    const assessments = await AssessmentResponse.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    console.log(`✅ Found ${assessments.length} assessments`);

    // Transform data to match frontend expectations
    const transformedAssessments = assessments.map(assessment => {
      // Calculate overall score from category scores
      const categoryScores = assessment.results?.categoryScores || {};
      const totalScore = Object.values(categoryScores).reduce((sum, score) => sum + score, 0);
      const maxPossibleScore = Object.keys(categoryScores).length * 15; // 15 questions max per category
      const scorePercentage = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;

      // Get top recommended career
      const topCareer = assessment.results?.topCareers?.[0]?.career || 'N/A';

      // Map responses to answers format
      // Import questions from assessmentController
      const assessmentQuestions = [
        { id: 1, question: "I enjoy solving mathematical problems and puzzles" },
        { id: 2, question: "I'm interested in understanding how machines and devices work" },
        { id: 3, question: "I enjoy learning about human body and health sciences" },
        { id: 4, question: "I would like to help people with their health problems" },
        { id: 5, question: "I'm good at managing money and understanding business concepts" },
        { id: 6, question: "I enjoy working with computers and technology" },
        { id: 7, question: "I like creating and designing things (art, websites, products)" },
        { id: 8, question: "I'm interested in starting my own business someday" },
        { id: 9, question: "I enjoy writing, reading literature, and creative arts" },
        { id: 10, question: "I'm interested in understanding society, history, and human behavior" },
        { id: 11, question: "I'm good at analyzing and solving technical problems" },
        { id: 12, question: "I enjoy conducting experiments and lab work" },
        { id: 13, question: "I'm interested in programming and software development" },
        { id: 14, question: "I enjoy communicating and presenting ideas to others" },
        { id: 15, question: "I'm interested in social issues and helping communities" }
      ];

      const answers = assessment.responses.map((response) => {
        const question = assessmentQuestions.find(q => q.id === response.questionId);
        return {
          question: question ? question.question : `Question ${response.questionId}`,
          answer: response.answer
        };
      });

      return {
        _id: assessment._id,
        user: assessment.user,
        score: scorePercentage,
        recommendedCareer: topCareer,
        createdAt: assessment.createdAt,
        completedAt: assessment.completedAt,
        answers: answers,
        results: assessment.results
      };
    });

    res.status(200).json({
      success: true,
      count: transformedAssessments.length,
      assessments: transformedAssessments
    });
  } catch (error) {
    console.error('❌ Error fetching assessments:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get all merit criteria (Admin)
 */
exports.getAllMeritCriteria = async (req, res) => {
  try {
    const { universityId, programId } = req.query;
    const query = { isActive: true };
    
    if (universityId) query.university = universityId;
    if (programId) query.program = programId;

    const criteria = await UniversityCriteria.find(query)
      .populate('university', 'name city')
      .populate('program', 'name degree')
      .sort({ 'university.name': 1, 'program.name': 1 });

    res.status(200).json({
      success: true,
      count: criteria.length,
      criteria
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get single merit criteria (Admin)
 */
exports.getMeritCriteria = async (req, res) => {
  try {
    const criteria = await UniversityCriteria.findById(req.params.id)
      .populate('university', 'name city')
      .populate('program', 'name degree');

    if (!criteria) {
      return res.status(404).json({ success: false, message: 'Criteria not found' });
    }

    res.status(200).json({ success: true, criteria });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Create merit criteria (Admin)
 */
exports.createMeritCriteria = async (req, res) => {
  try {
    console.log('📥 Creating merit criteria with data:', JSON.stringify(req.body, null, 2));
    
    // Validate required fields
    if (!req.body.university || !req.body.program) {
      return res.status(400).json({ 
        success: false, 
        message: 'University and Program are required' 
      });
    }

    const criteria = await UniversityCriteria.create(req.body);
    
    await criteria.populate('university', 'name');
    await criteria.populate('program', 'name');

    console.log(`✅ Merit criteria created: ${criteria.university.name} - ${criteria.program.name}`);
    res.status(201).json({
      success: true,
      message: 'Merit criteria created successfully',
      criteria
    });
  } catch (error) {
    console.error('❌ Create criteria error:', error.message);
    console.error('Error details:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({ 
        success: false, 
        message: `Validation Error: ${messages}` 
      });
    }
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Merit criteria already exists for this university and program' 
      });
    }
    
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Failed to create merit criteria' 
    });
  }
};

/**
 * Update merit criteria (Admin)
 */
exports.updateMeritCriteria = async (req, res) => {
  try {
    const criteria = await UniversityCriteria.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('university', 'name')
    .populate('program', 'name');

    if (!criteria) {
      return res.status(404).json({ success: false, message: 'Criteria not found' });
    }

    console.log(`✅ Merit criteria updated: ${criteria.university.name} - ${criteria.program.name}`);
    res.status(200).json({
      success: true,
      message: 'Merit criteria updated successfully',
      criteria
    });
  } catch (error) {
    console.error('❌ Update criteria error:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Delete merit criteria (Admin)
 */
exports.deleteMeritCriteria = async (req, res) => {
  try {
    const criteria = await UniversityCriteria.findByIdAndDelete(req.params.id);
    
    if (!criteria) {
      return res.status(404).json({ success: false, message: 'Criteria not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Merit criteria deleted successfully'
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Get pending posts for approval
 */
exports.getPendingPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const posts = await Post.find({ status: 'pending' })
      .populate('author', 'name email profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get comment counts for each post
    const Comment = require('../models/Comment');
    const postsWithCounts = await Promise.all(
      posts.map(async (post) => {
        const commentCount = await Comment.countDocuments({ post: post._id });
        return {
          ...post,
          commentCount,
          likeCount: post.likes ? post.likes.length : 0
        };
      })
    );

    const total = await Post.countDocuments({ status: 'pending' });

    res.status(200).json({
      success: true,
      posts: postsWithCounts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Approve a post
 */
exports.approvePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findByIdAndUpdate(
      id,
      { status: 'approved' },
      { new: true }
    ).populate('author', 'name email');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Create notification for the student
    const Notification = require('../models/Notification');
    await Notification.create({
      user: post.author._id,
      title: 'Post Approved',
      message: `Your post "${post.title}" has been approved and is now visible to the community.`,
      type: 'general',
      link: `/community/posts/${post._id}`,
      metadata: {
        postId: post._id,
        postTitle: post.title
      }
    });

    res.status(200).json({
      success: true,
      message: 'Post approved successfully',
      post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Reject a post (deletes it and notifies the student)
 */
exports.rejectPost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id).populate('author', 'name email');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const authorId = post.author._id;
    const postTitle = post.title;

    // Delete the post and its comments
    const Comment = require('../models/Comment');
    await Comment.deleteMany({ post: id });
    await Post.findByIdAndDelete(id);

    // Create notification for the student
    const Notification = require('../models/Notification');
    await Notification.create({
      user: authorId,
      title: 'Post Rejected',
      message: `Your post "${postTitle}" has been rejected and removed. Please review the community guidelines before posting again.`,
      type: 'general',
      metadata: {
        postTitle: postTitle,
        reason: 'rejected'
      }
    });

    res.status(200).json({
      success: true,
      message: 'Post rejected and student notified'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get system settings
 */
exports.getSettings = async (req, res) => {
  try {
    const Settings = require('../models/Settings');
    const settings = await Settings.getSettings();
    
    // Get database status in real-time
    const mongoose = require('mongoose');
    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    
    // Get last backup from settings (real-time from database)
    const lastBackup = settings.lastBackup || new Date();
    
    res.status(200).json({
      success: true,
      settings: {
        ...settings.toObject(),
        dbStatus,
        lastBackup
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update system settings
 */
exports.updateSettings = async (req, res) => {
  try {
    const Settings = require('../models/Settings');
    const settings = await Settings.getSettings();
    
    const allowedFields = [
      'siteName', 
      'siteEmail', 
      'maintenanceMode', 
      'notificationsEnabled', 
      'emailNotifications', 
      'autoApprove'
    ];
    
    // Track if autoApprove changed from false to true
    const wasAutoApproveDisabled = !settings.autoApprove;
    const willAutoApproveBeEnabled = req.body.autoApprove === true;
    
    // Update only allowed fields
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        settings[field] = req.body[field];
      }
    });
    
    // Save all changes to database
    await settings.save();
    
    // If autoApprove is enabled (either was enabled or just got enabled), approve all pending posts
    if (willAutoApproveBeEnabled) {
      const Post = require('../models/Post');
      const updateResult = await Post.updateMany(
        { status: 'pending' },
        { status: 'approved' }
      );
      console.log(`Auto-approved ${updateResult.modifiedCount} pending posts`);
    }
    
    res.status(200).json({
      success: true,
      message: 'All settings updated successfully in database',
      settings: settings.toObject()
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update settings'
    });
  }
};

/**
 * Update admin password
 */
exports.updateAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }
    
    // Get current user with password
    const user = await User.findById(req.user.id).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};




