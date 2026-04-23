const mongoose = require('mongoose');

const assessmentResponseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Legacy support for old single test format
  responses: [{
    questionId: Number,
    answer: String,
    score: Number
  }],
  // New: Individual test results
  personalityResults: {
    // MBTI Results
    mbtiType: String,
    dimensionScores: {
      extroversion: Number,
      introversion: Number,
      sensing: Number,
      intuition: Number,
      thinking: Number,
      feeling: Number,
      judging: Number,
      perceiving: Number
    },
    rawScores: mongoose.Schema.Types.Mixed,
    // Legacy RIASEC Results (for backward compatibility)
    riasecScores: {
      Realistic: Number,
      Investigative: Number,
      Artistic: Number,
      Social: Number,
      Enterprising: Number,
      Conventional: Number
    },
    normalizedScores: {
      Realistic: Number,
      Investigative: Number,
      Artistic: Number,
      Social: Number,
      Enterprising: Number,
      Conventional: Number
    },
    careerFields: mongoose.Schema.Types.Mixed
  },
  aptitudeResults: {
    sectionScores: mongoose.Schema.Types.Mixed,
    normalizedSectionScores: mongoose.Schema.Types.Mixed,
    skillScores: mongoose.Schema.Types.Mixed,
    normalizedSkillScores: mongoose.Schema.Types.Mixed,
    careerFields: mongoose.Schema.Types.Mixed,
    totalCorrect: Number,
    totalQuestions: Number
  },
  interestResults: {
    topDimensions: [String],
    categoryScores: mongoose.Schema.Types.Mixed,
    normalizedScores: mongoose.Schema.Types.Mixed,
    workEnvironmentScore: Number,
    topCareers: [{
      career: String,
      score: Number,
      description: String,
      relatedPrograms: [String],
      category: String
    }]
  },
  // Brain Hemisphere (OHBDS) results - informational, not part of career aggregation
  brainResults: {
    dominance: String, // 'Left' or 'Right' (legacy DB rows may still say 'Balanced')
    leftScore: Number,
    rightScore: Number
  },
  // Aggregated results from all 3 tests
  aggregatedResults: {
    finalCareerScores: mongoose.Schema.Types.Mixed, // Career field scores after weighted aggregation
    topCareers: [{
      career: String,
      score: Number,
      description: String,
      relatedPrograms: [String],
      category: String
    }],
    recommendedDegrees: [{ degree: String, field: String, match: Number }],
    testWeights: {
      personality: Number,
      aptitude: Number,
      interest: Number
    },
    ruleBasedEnhancements: [String] // Track which rules were applied
  },
  // Legacy results (backward compatibility)
  results: {
    topCareers: [{
      career: String,
      score: Number,
      description: String,
      relatedPrograms: [String]
    }],
    categoryScores: {
      engineering: Number,
      medical: Number,
      business: Number,
      computerScience: Number,
      arts: Number
    }
  },
  // Track which tests are completed
  testsCompleted: {
    personality: { type: Boolean, default: false },
    aptitude: { type: Boolean, default: false },
    interest: { type: Boolean, default: false },
    brain: { type: Boolean, default: false }
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AssessmentResponse', assessmentResponseSchema);






