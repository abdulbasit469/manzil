/**
 * Assessment Test Validation Script
 * Tests scoring logic and weighted aggregation
 */

// Mock test data
const mockPersonalityResponses = [
  { questionId: 1, answer: "Strongly Agree" }, // Realistic
  { questionId: 2, answer: "Agree" }, // Realistic
  { questionId: 7, answer: "Strongly Agree" }, // Investigative
  { questionId: 8, answer: "Agree" }, // Investigative
  { questionId: 13, answer: "Neutral" }, // Artistic
  { questionId: 19, answer: "Disagree" }, // Social
  { questionId: 25, answer: "Neutral" }, // Enterprising
  { questionId: 31, answer: "Agree" } // Conventional
];

const mockAptitudeResponses = [
  { questionId: 1, answer: "D" }, // Logical - correct
  { questionId: 2, answer: "B" }, // Logical - correct
  { questionId: 11, answer: "B" }, // Math - correct
  { questionId: 12, answer: "C" }, // Math - correct
  { questionId: 21, answer: "B" }, // Verbal - correct
  { questionId: 31, answer: "B" } // Analytical - correct
];

const mockInterestResponses = [
  { questionId: 1, answer: "Strongly Agree" }, // Engineering
  { questionId: 2, answer: "Agree" }, // Engineering
  { questionId: 7, answer: "Agree" }, // Medical
  { questionId: 13, answer: "Neutral" } // Business
];

// Test scoring functions
function testPersonalityScoring() {
  console.log("\n=== Testing Personality Test Scoring ===");
  
  const scoreMap = { 
    "Strongly Agree": 5, 
    "Agree": 4, 
    "Neutral": 3, 
    "Disagree": 2, 
    "Strongly Disagree": 1 
  };
  
  const riasecScores = {
    Realistic: 0,
    Investigative: 0,
    Artistic: 0,
    Social: 0,
    Enterprising: 0,
    Conventional: 0
  };
  
  // Mock questions
  const personalityQuestions = [
    { id: 1, riasecType: "Realistic" },
    { id: 2, riasecType: "Realistic" },
    { id: 7, riasecType: "Investigative" },
    { id: 8, riasecType: "Investigative" },
    { id: 13, riasecType: "Artistic" },
    { id: 19, riasecType: "Social" },
    { id: 25, riasecType: "Enterprising" },
    { id: 31, riasecType: "Conventional" }
  ];
  
  mockPersonalityResponses.forEach(r => {
    const question = personalityQuestions.find(q => q.id === r.questionId);
    if (question && question.riasecType) {
      riasecScores[question.riasecType] += scoreMap[r.answer] || 3;
    }
  });
  
  console.log("RIASEC Scores:", riasecScores);
  
  // Normalize
  const maxScorePerType = 6 * 5; // 30
  const normalizedScores = {};
  Object.keys(riasecScores).forEach(type => {
    normalizedScores[type] = Math.round((riasecScores[type] / maxScorePerType) * 100);
  });
  
  console.log("Normalized Scores (0-100):", normalizedScores);
  
  // Verify Realistic should be highest (5+4=9, normalized = 30%)
  if (normalizedScores.Realistic === 30) {
    console.log("✅ Personality scoring test PASSED");
  } else {
    console.log("❌ Personality scoring test FAILED");
  }
}

function testAptitudeScoring() {
  console.log("\n=== Testing Aptitude Test Scoring ===");
  
  const aptitudeQuestions = [
    { id: 1, correctAnswer: "D", category: "Logical Reasoning", skillType: "logical" },
    { id: 2, correctAnswer: "B", category: "Logical Reasoning", skillType: "logical" },
    { id: 11, correctAnswer: "B", category: "Mathematical Ability", skillType: "mathematical" },
    { id: 12, correctAnswer: "C", category: "Mathematical Ability", skillType: "mathematical" },
    { id: 21, correctAnswer: "B", category: "Verbal Ability", skillType: "verbal" },
    { id: 31, correctAnswer: "B", category: "Analytical Skills", skillType: "analytical" }
  ];
  
  const sectionScores = {
    "Logical Reasoning": { correct: 0, total: 0 },
    "Mathematical Ability": { correct: 0, total: 0 },
    "Verbal Ability": { correct: 0, total: 0 },
    "Analytical Skills": { correct: 0, total: 0 }
  };
  
  mockAptitudeResponses.forEach(r => {
    const question = aptitudeQuestions.find(q => q.id === r.questionId);
    if (question) {
      const isCorrect = r.answer.toUpperCase() === question.correctAnswer.toUpperCase();
      if (sectionScores[question.category]) {
        sectionScores[question.category].total++;
        if (isCorrect) {
          sectionScores[question.category].correct++;
        }
      }
    }
  });
  
  console.log("Section Scores:", sectionScores);
  
  // Calculate percentages
  const normalizedSectionScores = {};
  Object.keys(sectionScores).forEach(section => {
    const { correct, total } = sectionScores[section];
    normalizedSectionScores[section] = total > 0 ? Math.round((correct / total) * 100) : 0;
  });
  
  console.log("Normalized Section Scores (0-100):", normalizedSectionScores);
  
  // Verify all should be 100% (all correct)
  const allCorrect = Object.values(normalizedSectionScores).every(score => score === 100);
  if (allCorrect) {
    console.log("✅ Aptitude scoring test PASSED");
  } else {
    console.log("❌ Aptitude scoring test FAILED");
  }
}

function testWeightedAggregation() {
  console.log("\n=== Testing Weighted Aggregation ===");
  
  // Mock normalized results
  const personalityResults = {
    normalizedScores: {
      Realistic: 80,
      Investigative: 60,
      Artistic: 40,
      Social: 30,
      Enterprising: 50,
      Conventional: 45
    },
    careerFields: {
      "Engineering": 80,
      "Technical": 80
    }
  };
  
  const aptitudeResults = {
    normalizedSkillScores: {
      logical: 90,
      mathematical: 85,
      verbal: 70,
      analytical: 88
    },
    careerFields: {
      "Engineering": 90,
      "Computer Science": 90,
      "Finance": 85
    }
  };
  
  const interestResults = {
    normalizedScores: {
      engineering: 75,
      medical: 50,
      business: 40,
      computerScience: 70,
      arts: 30
    }
  };
  
  // Apply weights
  const weights = {
    personality: 0.30,
    aptitude: 0.40,
    interest: 0.30
  };
  
  const finalCareerScores = {};
  
  // Personality (30%)
  if (personalityResults.careerFields) {
    Object.keys(personalityResults.careerFields).forEach(field => {
      finalCareerScores[field] = (finalCareerScores[field] || 0) + 
        (personalityResults.careerFields[field] * weights.personality);
    });
  }
  
  // Aptitude (40%)
  if (aptitudeResults.careerFields) {
    Object.keys(aptitudeResults.careerFields).forEach(field => {
      finalCareerScores[field] = (finalCareerScores[field] || 0) + 
        (aptitudeResults.careerFields[field] * weights.aptitude);
    });
  }
  
  // Interest (30%)
  const interestMapping = {
    engineering: "Engineering",
    medical: "Medical",
    business: "Business",
    computerScience: "Computer Science",
    arts: "Arts"
  };
  
  Object.keys(interestResults.normalizedScores).forEach(category => {
    const field = interestMapping[category];
    if (field) {
      finalCareerScores[field] = (finalCareerScores[field] || 0) + 
        (interestResults.normalizedScores[category] * weights.interest);
    }
  });
  
  console.log("Final Career Scores:", finalCareerScores);
  
  // Engineering should be: (80*0.30) + (90*0.40) + (75*0.30) = 24 + 36 + 22.5 = 82.5
  const expectedEngineering = (80 * 0.30) + (90 * 0.40) + (75 * 0.30);
  const actualEngineering = finalCareerScores["Engineering"];
  
  console.log(`Expected Engineering score: ${expectedEngineering}`);
  console.log(`Actual Engineering score: ${actualEngineering}`);
  
  if (Math.abs(actualEngineering - expectedEngineering) < 0.1) {
    console.log("✅ Weighted aggregation test PASSED");
  } else {
    console.log("❌ Weighted aggregation test FAILED");
  }
}

// Run all tests
console.log("========================================");
console.log("Assessment System Test Suite");
console.log("========================================");

testPersonalityScoring();
testAptitudeScoring();
testWeightedAggregation();

console.log("\n========================================");
console.log("All tests completed!");
console.log("========================================");

