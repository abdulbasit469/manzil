const User = require('../models/User');
const University = require('../models/University');
const Program = require('../models/Program');
const AssessmentResponse = require('../models/Assessment');
const UniversityCriteria = require('../models/UniversityCriteria');

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
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
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
    const totalPrograms = await Program.countDocuments();
    const totalAssessments = await AssessmentResponse.countDocuments();

    const stats = {
      users: {
        total: totalUsers,
        students: totalStudents,
        admins: totalAdmins
      },
      universities: totalUniversities,
      programs: totalPrograms,
      assessments: totalAssessments
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




