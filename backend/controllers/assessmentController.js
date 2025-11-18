const AssessmentResponse = require('../models/Assessment');

// ============================================
// PERSONALITY TEST (Holland Codes - RIASEC)
// ============================================

// Personality Test Questions (36 questions - 6 per RIASEC type)
const personalityQuestions = [
  // Realistic (R) - 6 questions
  { id: 1, question: "I enjoy working with tools, machines, and hands-on activities", riasecType: "Realistic" },
  { id: 2, question: "I prefer practical, concrete tasks over abstract thinking", riasecType: "Realistic" },
  { id: 3, question: "I like building, fixing, or constructing things", riasecType: "Realistic" },
  { id: 4, question: "I enjoy outdoor activities and working with nature", riasecType: "Realistic" },
  { id: 5, question: "I prefer working with things rather than people", riasecType: "Realistic" },
  { id: 6, question: "I am good at operating machinery and technical equipment", riasecType: "Realistic" },
  
  // Investigative (I) - 6 questions
  { id: 7, question: "I enjoy conducting research and solving complex problems", riasecType: "Investigative" },
  { id: 8, question: "I like analyzing data and finding patterns", riasecType: "Investigative" },
  { id: 9, question: "I am curious about how things work and why they happen", riasecType: "Investigative" },
  { id: 10, question: "I enjoy scientific experiments and laboratory work", riasecType: "Investigative" },
  { id: 11, question: "I prefer working independently on challenging problems", riasecType: "Investigative" },
  { id: 12, question: "I am interested in understanding natural phenomena and scientific principles", riasecType: "Investigative" },
  
  // Artistic (A) - 6 questions
  { id: 13, question: "I enjoy creative activities like writing, drawing, or music", riasecType: "Artistic" },
  { id: 14, question: "I prefer expressing myself through art, design, or performance", riasecType: "Artistic" },
  { id: 15, question: "I like working in unstructured, flexible environments", riasecType: "Artistic" },
  { id: 16, question: "I am imaginative and enjoy thinking outside the box", riasecType: "Artistic" },
  { id: 17, question: "I appreciate beauty, aesthetics, and creative expression", riasecType: "Artistic" },
  { id: 18, question: "I prefer activities that allow for self-expression and originality", riasecType: "Artistic" },
  
  // Social (S) - 6 questions
  { id: 19, question: "I enjoy helping and teaching others", riasecType: "Social" },
  { id: 20, question: "I like working in teams and collaborating with people", riasecType: "Social" },
  { id: 21, question: "I am good at understanding people's feelings and needs", riasecType: "Social" },
  { id: 22, question: "I prefer jobs that involve serving or helping others", riasecType: "Social" },
  { id: 23, question: "I enjoy counseling, mentoring, or providing guidance to others", riasecType: "Social" },
  { id: 24, question: "I am interested in social issues and community welfare", riasecType: "Social" },
  
  // Enterprising (E) - 6 questions
  { id: 25, question: "I enjoy leading and managing others", riasecType: "Enterprising" },
  { id: 26, question: "I like persuading and influencing people", riasecType: "Enterprising" },
  { id: 27, question: "I am interested in business, sales, and making profits", riasecType: "Enterprising" },
  { id: 28, question: "I prefer competitive environments and achieving goals", riasecType: "Enterprising" },
  { id: 29, question: "I enjoy taking risks and making important decisions", riasecType: "Enterprising" },
  { id: 30, question: "I am ambitious and want to achieve success in business or leadership", riasecType: "Enterprising" },
  
  // Conventional (C) - 6 questions
  { id: 31, question: "I prefer organized, structured work environments", riasecType: "Conventional" },
  { id: 32, question: "I enjoy working with data, numbers, and detailed records", riasecType: "Conventional" },
  { id: 33, question: "I like following established procedures and routines", riasecType: "Conventional" },
  { id: 34, question: "I am good at organizing information and maintaining accuracy", riasecType: "Conventional" },
  { id: 35, question: "I prefer clear instructions and well-defined tasks", riasecType: "Conventional" },
  { id: 36, question: "I enjoy administrative work and keeping things in order", riasecType: "Conventional" }
];

// RIASEC to Career Field Mapping
const riasecCareerMapping = {
  "Realistic": ["Engineering", "Technical", "Construction", "Manufacturing"],
  "Investigative": ["Medical", "Research", "Science", "Laboratory"],
  "Artistic": ["Arts", "Media", "Design", "Creative"],
  "Social": ["Teaching", "Counseling", "Healthcare", "Social Work"],
  "Enterprising": ["Business", "Management", "Sales", "Entrepreneurship"],
  "Conventional": ["Accounting", "Administration", "Finance", "Data Entry"]
};

/**
 * Normalize score to 0-100 scale
 */
const normalizeScore = (rawScore, maxPossibleScore) => {
  if (maxPossibleScore === 0) return 0;
  return Math.round((rawScore / maxPossibleScore) * 100);
};

/**
 * Get Personality Test Questions
 */
exports.getPersonalityQuestions = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      count: personalityQuestions.length,
      testType: "personality",
      questions: personalityQuestions.map(q => ({
        id: q.id,
        question: q.question,
        riasecType: q.riasecType
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Submit Personality Test
 */
exports.submitPersonalityTest = async (req, res) => {
  try {
    const { responses } = req.body; // Array of {questionId, answer}
    
    // Initialize RIASEC scores
    const riasecScores = {
      Realistic: 0,
      Investigative: 0,
      Artistic: 0,
      Social: 0,
      Enterprising: 0,
      Conventional: 0
    };

    // Scoring: Strongly Agree=5, Agree=4, Neutral=3, Disagree=2, Strongly Disagree=1
    const scoreMap = { 
      "Strongly Agree": 5, 
      "Agree": 4, 
      "Neutral": 3, 
      "Disagree": 2, 
      "Strongly Disagree": 1 
    };

    const processedResponses = responses.map(r => {
      const question = personalityQuestions.find(q => q.id === r.questionId);
      let score = scoreMap[r.answer] || 3;
      
      if (question && question.riasecType) {
        riasecScores[question.riasecType] += score;
      }
      
      return { questionId: r.questionId, answer: r.answer, score };
    });

    // Calculate max possible score per RIASEC type (6 questions × 5 = 30)
    const maxScorePerType = 6 * 5; // 30
    
    // Normalize scores to 0-100
    const normalizedScores = {};
    Object.keys(riasecScores).forEach(type => {
      normalizedScores[type] = normalizeScore(riasecScores[type], maxScorePerType);
    });

    const results = {
      riasecScores: riasecScores, // Raw scores
      normalizedScores: normalizedScores, // Normalized 0-100
      careerFields: {}
    };

    // Map RIASEC types to career fields
    Object.keys(normalizedScores).forEach(riasecType => {
      const fields = riasecCareerMapping[riasecType] || [];
      fields.forEach(field => {
        if (!results.careerFields[field]) {
          results.careerFields[field] = 0;
        }
        // Add normalized score to career field (can accumulate from multiple RIASEC types)
        results.careerFields[field] = Math.max(results.careerFields[field], normalizedScores[riasecType]);
      });
    });

    // Save personality test results
    let assessment = await AssessmentResponse.findOne({ user: req.user.id }).sort({ createdAt: -1 });
    if (!assessment) {
      assessment = await AssessmentResponse.create({
        user: req.user.id,
        personalityResults: results,
        testsCompleted: { personality: true, aptitude: false, interest: false }
      });
    } else {
      assessment.personalityResults = results;
      assessment.testsCompleted.personality = true;
      await assessment.save();
    }

    // Check if all tests are complete and auto-aggregate
    await checkAndAggregate(assessment);

    console.log(`Personality test completed by user: ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Personality test submitted successfully',
      testType: "personality",
      results: results
    });
  } catch (error) {
    console.error('Personality test error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// APTITUDE TEST
// ============================================

// Aptitude Test Questions (40 questions - 10 per category)
const aptitudeQuestions = [
  // Logical Reasoning (10 questions)
  { id: 1, question: "If all roses are flowers, and some flowers are red, which statement must be true?", options: ["A) All roses are red", "B) Some roses are red", "C) All red things are roses", "D) Cannot be determined"], correctAnswer: "D", category: "Logical Reasoning", skillType: "logical" },
  { id: 2, question: "Complete the sequence: 2, 6, 12, 20, 30, ?", options: ["A) 40", "B) 42", "C) 44", "D) 46"], correctAnswer: "B", category: "Logical Reasoning", skillType: "logical" },
  { id: 3, question: "If Monday is the first day, what day is the 25th day?", options: ["A) Monday", "B) Tuesday", "C) Wednesday", "D) Thursday"], correctAnswer: "D", category: "Logical Reasoning", skillType: "logical" },
  { id: 4, question: "A is taller than B, C is shorter than A. Who is the tallest?", options: ["A) A", "B) B", "C) C", "D) Cannot be determined"], correctAnswer: "A", category: "Logical Reasoning", skillType: "logical" },
  { id: 5, question: "If CAT is coded as 3120, how is DOG coded?", options: ["A) 4157", "B) 4156", "C) 4158", "D) 4159"], correctAnswer: "A", category: "Logical Reasoning", skillType: "logical" },
  { id: 6, question: "Find the odd one out: Apple, Orange, Banana, Carrot", options: ["A) Apple", "B) Orange", "C) Banana", "D) Carrot"], correctAnswer: "D", category: "Logical Reasoning", skillType: "logical" },
  { id: 7, question: "If 5 workers can build a wall in 10 days, how many days will 10 workers take?", options: ["A) 5 days", "B) 10 days", "C) 15 days", "D) 20 days"], correctAnswer: "A", category: "Logical Reasoning", skillType: "logical" },
  { id: 8, question: "Complete: If it rains, then the ground is wet. The ground is wet. Therefore?", options: ["A) It must have rained", "B) It might have rained", "C) It did not rain", "D) Cannot conclude"], correctAnswer: "D", category: "Logical Reasoning", skillType: "logical" },
  { id: 9, question: "What comes next: Z, Y, X, W, ?", options: ["A) V", "B) U", "C) T", "D) S"], correctAnswer: "A", category: "Logical Reasoning", skillType: "logical" },
  { id: 10, question: "If all students study, and some students play sports, which is true?", options: ["A) All students play sports", "B) Some students who study play sports", "C) No students play sports", "D) Cannot be determined"], correctAnswer: "B", category: "Logical Reasoning", skillType: "logical" },
  
  // Mathematical Ability (10 questions)
  { id: 11, question: "What is 25% of 200?", options: ["A) 40", "B) 50", "C) 60", "D) 75"], correctAnswer: "B", category: "Mathematical Ability", skillType: "mathematical" },
  { id: 12, question: "If x + 5 = 12, what is x?", options: ["A) 5", "B) 6", "C) 7", "D) 8"], correctAnswer: "C", category: "Mathematical Ability", skillType: "mathematical" },
  { id: 13, question: "What is the square root of 144?", options: ["A) 10", "B) 11", "C) 12", "D) 13"], correctAnswer: "C", category: "Mathematical Ability", skillType: "mathematical" },
  { id: 14, question: "If a train travels 120 km in 2 hours, what is its speed?", options: ["A) 50 km/h", "B) 60 km/h", "C) 70 km/h", "D) 80 km/h"], correctAnswer: "B", category: "Mathematical Ability", skillType: "mathematical" },
  { id: 15, question: "What is 3/4 + 1/2?", options: ["A) 1", "B) 1.25", "C) 1.5", "D) 1.75"], correctAnswer: "B", category: "Mathematical Ability", skillType: "mathematical" },
  { id: 16, question: "If a rectangle has length 8 and width 5, what is its area?", options: ["A) 13", "B) 26", "C) 40", "D) 45"], correctAnswer: "C", category: "Mathematical Ability", skillType: "mathematical" },
  { id: 17, question: "What is 15 × 6?", options: ["A) 80", "B) 90", "C) 100", "D) 110"], correctAnswer: "B", category: "Mathematical Ability", skillType: "mathematical" },
  { id: 18, question: "If 2x - 4 = 10, what is x?", options: ["A) 5", "B) 6", "C) 7", "D) 8"], correctAnswer: "C", category: "Mathematical Ability", skillType: "mathematical" },
  { id: 19, question: "What is the average of 10, 20, 30, 40?", options: ["A) 20", "B) 25", "C) 30", "D) 35"], correctAnswer: "B", category: "Mathematical Ability", skillType: "mathematical" },
  { id: 20, question: "If 1 dollar = 280 rupees, how many rupees is 5 dollars?", options: ["A) 1200", "B) 1300", "C) 1400", "D) 1500"], correctAnswer: "C", category: "Mathematical Ability", skillType: "mathematical" },
  
  // Verbal Ability (10 questions)
  { id: 21, question: "Choose the synonym of 'BRIEF':", options: ["A) Long", "B) Short", "C) Detailed", "D) Complete"], correctAnswer: "B", category: "Verbal Ability", skillType: "verbal" },
  { id: 22, question: "Choose the antonym of 'ANCIENT':", options: ["A) Old", "B) Modern", "C) Historic", "D) Traditional"], correctAnswer: "B", category: "Verbal Ability", skillType: "verbal" },
  { id: 23, question: "Fill in the blank: The student _____ the exam yesterday.", options: ["A) take", "B) takes", "C) took", "D) taking"], correctAnswer: "C", category: "Verbal Ability", skillType: "verbal" },
  { id: 24, question: "What does 'AMBIGUOUS' mean?", options: ["A) Clear", "B) Unclear or having multiple meanings", "C) Simple", "D) Complex"], correctAnswer: "B", category: "Verbal Ability", skillType: "verbal" },
  { id: 25, question: "Choose the correct spelling:", options: ["A) Recieve", "B) Receive", "C) Receeve", "D) Receve"], correctAnswer: "B", category: "Verbal Ability", skillType: "verbal" },
  { id: 26, question: "Which word is a noun?", options: ["A) Run", "B) Quickly", "C) Beautiful", "D) Happiness"], correctAnswer: "D", category: "Verbal Ability", skillType: "verbal" },
  { id: 27, question: "Fill in the blank: She is _____ than her sister.", options: ["A) tall", "B) taller", "C) tallest", "D) more tall"], correctAnswer: "B", category: "Verbal Ability", skillType: "verbal" },
  { id: 28, question: "What is the plural of 'child'?", options: ["A) childs", "B) children", "C) childes", "D) childrens"], correctAnswer: "B", category: "Verbal Ability", skillType: "verbal" },
  { id: 29, question: "Choose the synonym of 'ENORMOUS':", options: ["A) Small", "B) Tiny", "C) Huge", "D) Medium"], correctAnswer: "C", category: "Verbal Ability", skillType: "verbal" },
  { id: 30, question: "Fill in the blank: I _____ to the library every week.", options: ["A) go", "B) goes", "C) going", "D) went"], correctAnswer: "A", category: "Verbal Ability", skillType: "verbal" },
  
  // Analytical Skills (10 questions)
  { id: 31, question: "If pattern: 3, 9, 27, 81, what comes next?", options: ["A) 162", "B) 243", "C) 324", "D) 405"], correctAnswer: "B", category: "Analytical Skills", skillType: "analytical" },
  { id: 32, question: "Analyze: All birds fly. Penguins are birds. Therefore?", options: ["A) Penguins fly", "B) Penguins do not fly", "C) Some birds do not fly", "D) Cannot conclude"], correctAnswer: "C", category: "Analytical Skills", skillType: "analytical" },
  { id: 33, question: "If A=1, B=2, C=3, what is the value of CAT?", options: ["A) 24", "B) 25", "C) 26", "D) 27"], correctAnswer: "A", category: "Analytical Skills", skillType: "analytical" },
  { id: 34, question: "Find the pattern: 2, 4, 8, 16, ?", options: ["A) 24", "B) 32", "C) 40", "D) 48"], correctAnswer: "B", category: "Analytical Skills", skillType: "analytical" },
  { id: 35, question: "If 3 books cost 450 rupees, how much do 5 books cost?", options: ["A) 600", "B) 650", "C) 700", "D) 750"], correctAnswer: "D", category: "Analytical Skills", skillType: "analytical" },
  { id: 36, question: "Analyze: Some students are athletes. All athletes are fit. Therefore?", options: ["A) All students are fit", "B) Some students are fit", "C) No students are fit", "D) Cannot conclude"], correctAnswer: "B", category: "Analytical Skills", skillType: "analytical" },
  { id: 37, question: "If today is Friday, what day will it be in 10 days?", options: ["A) Monday", "B) Tuesday", "C) Wednesday", "D) Thursday"], correctAnswer: "A", category: "Analytical Skills", skillType: "analytical" },
  { id: 38, question: "Find the missing number: 5, 10, 20, 40, ?", options: ["A) 60", "B) 70", "C) 80", "D) 90"], correctAnswer: "C", category: "Analytical Skills", skillType: "analytical" },
  { id: 39, question: "If a clock shows 3:15, what is the angle between hands?", options: ["A) 0°", "B) 7.5°", "C) 15°", "D) 30°"], correctAnswer: "B", category: "Analytical Skills", skillType: "analytical" },
  { id: 40, question: "Analyze: All doctors are educated. Some educated people are teachers. Therefore?", options: ["A) All doctors are teachers", "B) Some doctors might be teachers", "C) No doctors are teachers", "D) Cannot conclude"], correctAnswer: "D", category: "Analytical Skills", skillType: "analytical" }
];

// Skill Type to Career Field Mapping
const skillCareerMapping = {
  "logical": ["Engineering", "Computer Science", "Mathematics"],
  "mathematical": ["Engineering", "Finance", "Economics", "Mathematics"],
  "verbal": ["Business", "Media", "Law", "Social Sciences", "Journalism"],
  "analytical": ["Engineering", "Computer Science", "Research", "Data Science"]
};

/**
 * Get Aptitude Test Questions
 */
exports.getAptitudeQuestions = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      count: aptitudeQuestions.length,
      testType: "aptitude",
      questions: aptitudeQuestions.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options,
        category: q.category,
        skillType: q.skillType
        // Note: correctAnswer is NOT sent to client
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Submit Aptitude Test
 */
exports.submitAptitudeTest = async (req, res) => {
  try {
    const { responses } = req.body; // Array of {questionId, answer}
    
    // Initialize section scores
    const sectionScores = {
      "Logical Reasoning": { correct: 0, total: 0 },
      "Mathematical Ability": { correct: 0, total: 0 },
      "Verbal Ability": { correct: 0, total: 0 },
      "Analytical Skills": { correct: 0, total: 0 }
    };

    const skillScores = {
      logical: { correct: 0, total: 0 },
      mathematical: { correct: 0, total: 0 },
      verbal: { correct: 0, total: 0 },
      analytical: { correct: 0, total: 0 }
    };

    const processedResponses = responses.map(r => {
      const question = aptitudeQuestions.find(q => q.id === r.questionId);
      if (!question) {
        return { questionId: r.questionId, answer: r.answer, correct: false };
      }

      const isCorrect = r.answer.toUpperCase() === question.correctAnswer.toUpperCase();
      
      // Update section scores
      if (sectionScores[question.category]) {
        sectionScores[question.category].total++;
        if (isCorrect) {
          sectionScores[question.category].correct++;
        }
      }

      // Update skill scores
      if (skillScores[question.skillType]) {
        skillScores[question.skillType].total++;
        if (isCorrect) {
          skillScores[question.skillType].correct++;
        }
      }

      return { questionId: r.questionId, answer: r.answer, correct: isCorrect };
    });

    // Calculate percentage per section and normalize to 0-100
    const normalizedSectionScores = {};
    Object.keys(sectionScores).forEach(section => {
      const { correct, total } = sectionScores[section];
      const percentage = total > 0 ? (correct / total) * 100 : 0;
      normalizedSectionScores[section] = Math.round(percentage);
    });

    // Calculate percentage per skill and normalize to 0-100
    const normalizedSkillScores = {};
    Object.keys(skillScores).forEach(skill => {
      const { correct, total } = skillScores[skill];
      const percentage = total > 0 ? (correct / total) * 100 : 0;
      normalizedSkillScores[skill] = Math.round(percentage);
    });

    // Map skill types to career fields
    const careerFields = {};
    Object.keys(normalizedSkillScores).forEach(skill => {
      const fields = skillCareerMapping[skill] || [];
      fields.forEach(field => {
        if (!careerFields[field]) {
          careerFields[field] = 0;
        }
        // Use maximum score from skills that map to this field
        careerFields[field] = Math.max(careerFields[field], normalizedSkillScores[skill]);
      });
    });

    const results = {
      sectionScores: sectionScores, // Raw scores {correct, total}
      normalizedSectionScores: normalizedSectionScores, // Percentage per section (0-100)
      skillScores: skillScores, // Raw skill scores
      normalizedSkillScores: normalizedSkillScores, // Percentage per skill (0-100)
      careerFields: careerFields,
      totalCorrect: processedResponses.filter(r => r.correct).length,
      totalQuestions: processedResponses.length
    };

    // Save aptitude test results
    let assessment = await AssessmentResponse.findOne({ user: req.user.id }).sort({ createdAt: -1 });
    if (!assessment) {
      assessment = await AssessmentResponse.create({
        user: req.user.id,
        aptitudeResults: results,
        testsCompleted: { personality: false, aptitude: true, interest: false }
      });
    } else {
      assessment.aptitudeResults = results;
      assessment.testsCompleted.aptitude = true;
      await assessment.save();
    }

    // Check if all tests are complete and auto-aggregate
    await checkAndAggregate(assessment);

    console.log(`Aptitude test completed by user: ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Aptitude test submitted successfully',
      testType: "aptitude",
      results: results
    });
  } catch (error) {
    console.error('Aptitude test error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// INTEREST TEST (Expanded)
// ============================================

// Interest Test Questions (36 questions - expanded from 15)
const assessmentQuestions = [
  // Engineering (6 questions)
  { id: 1, question: "I enjoy solving mathematical problems and puzzles", category: "engineering" },
  { id: 2, question: "I'm interested in understanding how machines and devices work", category: "engineering" },
  { id: 3, question: "I'm good at analyzing and solving technical problems", category: "engineering" },
  { id: 4, question: "I like designing and building structures or systems", category: "engineering" },
  { id: 5, question: "I enjoy working with tools, equipment, and technology", category: "engineering" },
  { id: 6, question: "I'm interested in physics, mechanics, and how things function", category: "engineering" },
  
  // Medical (6 questions)
  { id: 7, question: "I enjoy learning about human body and health sciences", category: "medical" },
  { id: 8, question: "I would like to help people with their health problems", category: "medical" },
  { id: 9, question: "I enjoy conducting experiments and lab work", category: "medical" },
  { id: 10, question: "I'm interested in biology, chemistry, and life sciences", category: "medical" },
  { id: 11, question: "I want to work in healthcare and make a difference in people's lives", category: "medical" },
  { id: 12, question: "I'm comfortable working in hospitals, clinics, or laboratories", category: "medical" },
  
  // Business (6 questions)
  { id: 13, question: "I'm good at managing money and understanding business concepts", category: "business" },
  { id: 14, question: "I'm interested in starting my own business someday", category: "business" },
  { id: 15, question: "I enjoy communicating and presenting ideas to others", category: "business" },
  { id: 16, question: "I like analyzing market trends and business opportunities", category: "business" },
  { id: 17, question: "I'm interested in finance, accounting, and economics", category: "business" },
  { id: 18, question: "I enjoy working in corporate environments and managing projects", category: "business" },
  
  // Computer Science (6 questions)
  { id: 19, question: "I enjoy working with computers and technology", category: "computerScience" },
  { id: 20, question: "I like creating and designing things (art, websites, products)", category: "computerScience" },
  { id: 21, question: "I'm interested in programming and software development", category: "computerScience" },
  { id: 22, question: "I enjoy problem-solving using technology and coding", category: "computerScience" },
  { id: 23, question: "I'm interested in artificial intelligence, data science, and emerging tech", category: "computerScience" },
  { id: 24, question: "I like working with digital systems, networks, and cybersecurity", category: "computerScience" },
  
  // Arts (6 questions)
  { id: 25, question: "I enjoy writing, reading literature, and creative arts", category: "arts" },
  { id: 26, question: "I'm interested in understanding society, history, and human behavior", category: "arts" },
  { id: 27, question: "I'm interested in social issues and helping communities", category: "arts" },
  { id: 28, question: "I enjoy media, journalism, and communication", category: "arts" },
  { id: 29, question: "I'm interested in psychology, sociology, and understanding people", category: "arts" },
  { id: 30, question: "I like creative expression through writing, design, or performance", category: "arts" },
  
  // Work Environment Preferences (6 questions)
  { id: 31, question: "I prefer working in teams and collaborating with others", category: "workEnvironment" },
  { id: 32, question: "I like structured work environments with clear routines", category: "workEnvironment" },
  { id: 33, question: "I prefer flexible work schedules and creative freedom", category: "workEnvironment" },
  { id: 34, question: "I enjoy working in office settings with modern facilities", category: "workEnvironment" },
  { id: 35, question: "I prefer field work and hands-on activities over desk work", category: "workEnvironment" },
  { id: 36, question: "I like working independently and managing my own projects", category: "workEnvironment" }
];

// Career mappings
const careerMappings = {
  engineering: [
    { career: "Electrical Engineering", description: "Design and develop electrical systems and equipment", relatedPrograms: ["BS Electrical Engineering", "BE Electrical Engineering"] },
    { career: "Mechanical Engineering", description: "Design and develop mechanical systems and machinery", relatedPrograms: ["BS Mechanical Engineering", "BE Mechanical Engineering"] },
    { career: "Civil Engineering", description: "Design and construct infrastructure projects", relatedPrograms: ["BS Civil Engineering", "BE Civil Engineering"] }
  ],
  medical: [
    { career: "Medicine (MBBS)", description: "Diagnose and treat diseases, become a doctor", relatedPrograms: ["MBBS"] },
    { career: "Pharmacy", description: "Study medications and their effects", relatedPrograms: ["Pharm-D", "BS Pharmacy"] },
    { career: "Medical Laboratory Technology", description: "Work in diagnostic laboratories", relatedPrograms: ["BS MLT", "BS Medical Lab Sciences"] }
  ],
  business: [
    { career: "Business Administration", description: "Manage organizations and business operations", relatedPrograms: ["BBA", "MBA"] },
    { career: "Accounting & Finance", description: "Manage financial records and analysis", relatedPrograms: ["BBA Finance", "BS Accounting"] },
    { career: "Marketing", description: "Promote products and manage brand strategies", relatedPrograms: ["BBA Marketing"] }
  ],
  computerScience: [
    { career: "Software Engineering", description: "Design and develop software applications", relatedPrograms: ["BS Software Engineering", "BS Computer Science"] },
    { career: "Data Science", description: "Analyze data and build AI/ML models", relatedPrograms: ["BS Data Science", "BS Computer Science"] },
    { career: "Cybersecurity", description: "Protect systems from cyber threats", relatedPrograms: ["BS Cybersecurity", "BS Computer Science"] }
  ],
  arts: [
    { career: "Mass Communication", description: "Work in media, journalism, and public relations", relatedPrograms: ["BS Mass Communication"] },
    { career: "Psychology", description: "Study human behavior and mental health", relatedPrograms: ["BS Psychology"] },
    { career: "Social Sciences", description: "Study society, politics, and economics", relatedPrograms: ["BS Sociology", "BS Economics"] }
  ]
};

/**
 * Get Interest Test Questions
 */
exports.getQuestions = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      count: assessmentQuestions.length,
      testType: "interest",
      questions: assessmentQuestions.map(q => ({
        id: q.id,
        question: q.question,
        category: q.category
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Submit Interest Test
 */
exports.submitAssessment = async (req, res) => {
  try {
    const { responses } = req.body; // Array of {questionId, answer}
    
    // Calculate scores per category (excluding workEnvironment for career mapping)
    const categoryScores = {
      engineering: 0,
      medical: 0,
      business: 0,
      computerScience: 0,
      arts: 0,
      workEnvironment: 0 // Track separately for work preferences
    };

    // Count questions per category for normalization
    const questionCounts = {
      engineering: 0,
      medical: 0,
      business: 0,
      computerScience: 0,
      arts: 0,
      workEnvironment: 0
    };

    const processedResponses = responses.map(r => {
      const question = assessmentQuestions.find(q => q.id === r.questionId);
      let score = 0;
      
      // Scoring: Strongly Agree=5, Agree=4, Neutral=3, Disagree=2, Strongly Disagree=1
      const scoreMap = { 
        "Strongly Agree": 5, 
        "Agree": 4, 
        "Neutral": 3, 
        "Disagree": 2, 
        "Strongly Disagree": 1 
      };
      score = scoreMap[r.answer] || 3;
      
      if (question) {
        categoryScores[question.category] += score;
        questionCounts[question.category]++;
      }
      
      return { questionId: r.questionId, answer: r.answer, score };
    });

    // Normalize category scores to 0-100 (max score per category = 6 questions × 5 = 30)
    const maxScorePerCategory = 6 * 5; // 30
    const normalizedScores = {};
    Object.keys(categoryScores).forEach(category => {
      if (category !== 'workEnvironment') {
        normalizedScores[category] = normalizeScore(categoryScores[category], maxScorePerCategory);
      }
    });

    // Find top 3 careers based on normalized scores
    const sortedCategories = Object.entries(normalizedScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const topCareers = [];
    sortedCategories.forEach(([category, score]) => {
      const careers = careerMappings[category] || [];
      careers.forEach(c => {
        topCareers.push({ ...c, score, category });
      });
    });

    const results = {
      topCareers: topCareers.slice(0, 5),
      categoryScores: categoryScores, // Raw scores
      normalizedScores: normalizedScores, // Normalized 0-100
      workEnvironmentScore: categoryScores.workEnvironment // Work preferences
    };

    // Save interest test results
    let assessment = await AssessmentResponse.findOne({ user: req.user.id }).sort({ createdAt: -1 });
    if (!assessment) {
      assessment = await AssessmentResponse.create({
        user: req.user.id,
        responses: processedResponses, // Legacy support
        results: results, // Legacy support
        interestResults: results,
        testsCompleted: { personality: false, aptitude: false, interest: true }
      });
    } else {
      assessment.responses = processedResponses; // Legacy support
      assessment.results = results; // Legacy support
      assessment.interestResults = results;
      assessment.testsCompleted.interest = true;
      await assessment.save();
    }

    // Check if all tests are complete and auto-aggregate
    await checkAndAggregate(assessment);

    console.log(`Interest test completed by user: ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Interest test submitted successfully',
      testType: "interest",
      results
    });
  } catch (error) {
    console.error('Interest test error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Check and Auto-Aggregate if all tests are complete
 */
const checkAndAggregate = async (assessment) => {
  if (assessment.testsCompleted.personality && 
      assessment.testsCompleted.aptitude && 
      assessment.testsCompleted.interest &&
      !assessment.aggregatedResults) {
    
    const aggregatedResults = performWeightedAggregation(
      assessment.personalityResults,
      assessment.aptitudeResults,
      assessment.interestResults
    );
    
    assessment.aggregatedResults = aggregatedResults;
    await assessment.save();
    
    console.log(`Auto-aggregated results for user: ${assessment.user}`);
  }
};

/**
 * Weighted Aggregation Function
 * Combines Personality (30%), Aptitude (40%), and Interest (30%) test scores
 */
const performWeightedAggregation = (personalityResults, aptitudeResults, interestResults) => {
  // Test weights
  const weights = {
    personality: 0.30,
    aptitude: 0.40,
    interest: 0.30
  };

  // Map interest categories to career fields (defined at function level for scope)
  const interestMapping = {
    engineering: "Engineering",
    medical: "Medical",
    business: "Business",
    computerScience: "Computer Science",
    arts: "Arts"
  };

  // Map all test results to common career fields
  const careerFieldMapping = {
    "Engineering": ["Engineering", "Technical", "Construction"],
    "Medical": ["Medical", "Research", "Science", "Laboratory", "Healthcare"],
    "Business": ["Business", "Management", "Sales", "Entrepreneurship"],
    "Computer Science": ["Computer Science", "Mathematics", "Data Science"],
    "Arts": ["Arts", "Media", "Design", "Creative"],
    "Teaching": ["Teaching", "Counseling", "Social Work"],
    "Finance": ["Finance", "Economics", "Accounting", "Administration"]
  };

  // Initialize final career field scores
  const finalCareerScores = {};

  // Helper function to add score to career field
  const addToCareerField = (field, score, weight) => {
    if (!finalCareerScores[field]) {
      finalCareerScores[field] = 0;
    }
    finalCareerScores[field] += score * weight;
  };

  // 1. Process Personality Test results (30% weight)
  if (personalityResults && personalityResults.careerFields) {
    Object.keys(personalityResults.careerFields).forEach(field => {
      const score = personalityResults.careerFields[field];
      addToCareerField(field, score, weights.personality);
    });
  }

  // 2. Process Aptitude Test results (40% weight)
  if (aptitudeResults && aptitudeResults.careerFields) {
    Object.keys(aptitudeResults.careerFields).forEach(field => {
      const score = aptitudeResults.careerFields[field];
      addToCareerField(field, score, weights.aptitude);
    });
  }

  // 3. Process Interest Test results (30% weight)
  if (interestResults && interestResults.normalizedScores) {
    Object.keys(interestResults.normalizedScores).forEach(category => {
      const score = interestResults.normalizedScores[category];
      const field = interestMapping[category];
      if (field) {
        addToCareerField(field, score, weights.interest);
      }
    });
  }

  // 4. Apply rule-based enhancements
  const ruleBasedEnhancements = [];

  // Rule 1: Logical + Analytical (high) → Engineering boost
  if (aptitudeResults && aptitudeResults.normalizedSkillScores) {
    const logical = aptitudeResults.normalizedSkillScores.logical || 0;
    const analytical = aptitudeResults.normalizedSkillScores.analytical || 0;
    if (logical >= 70 && analytical >= 70) {
      finalCareerScores["Engineering"] = (finalCareerScores["Engineering"] || 0) + 10;
      ruleBasedEnhancements.push("High logical and analytical skills → Engineering boost");
    }
  }

  // Rule 2: Creative + Communication (high) → Media boost
  if (personalityResults && personalityResults.normalizedScores) {
    const artistic = personalityResults.normalizedScores.Artistic || 0;
    const social = personalityResults.normalizedScores.Social || 0;
    if (artistic >= 70 && social >= 70) {
      finalCareerScores["Arts"] = (finalCareerScores["Arts"] || 0) + 10;
      ruleBasedEnhancements.push("High creative and communication skills → Media/Arts boost");
    }
  }

  // Rule 3: Mathematical + Analytical (high) → Finance/Economics boost
  if (aptitudeResults && aptitudeResults.normalizedSkillScores) {
    const mathematical = aptitudeResults.normalizedSkillScores.mathematical || 0;
    const analytical = aptitudeResults.normalizedSkillScores.analytical || 0;
    if (mathematical >= 70 && analytical >= 70) {
      finalCareerScores["Finance"] = (finalCareerScores["Finance"] || 0) + 10;
      ruleBasedEnhancements.push("High mathematical and analytical skills → Finance/Economics boost");
    }
  }

  // Rule 4: Social + Enterprising (high) → Business/Management boost
  if (personalityResults && personalityResults.normalizedScores) {
    const social = personalityResults.normalizedScores.Social || 0;
    const enterprising = personalityResults.normalizedScores.Enterprising || 0;
    if (social >= 70 && enterprising >= 70) {
      finalCareerScores["Business"] = (finalCareerScores["Business"] || 0) + 10;
      ruleBasedEnhancements.push("High social and enterprising traits → Business/Management boost");
    }
  }

  // 5. Generate top careers from final scores
  const sortedCareers = Object.entries(finalCareerScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7);

  // Map to career recommendations with descriptions
  const topCareers = [];
  sortedCareers.forEach(([field, score]) => {
    // Find careers from interest test mappings
    const interestCategory = Object.keys(interestMapping).find(
      cat => interestMapping[cat] === field
    );
    
    // Check if careerMappings exists and has the category
    if (interestCategory && careerMappings && careerMappings[interestCategory]) {
      careerMappings[interestCategory].forEach(career => {
        topCareers.push({
          ...career,
          score: Math.round(score),
          category: field
        });
      });
    } else {
      // Generic career recommendation with better descriptions
      const careerDescriptions = {
        "Engineering": "Design and develop technical systems, infrastructure, and solutions",
        "Medical": "Work in healthcare, diagnose and treat patients, or conduct medical research",
        "Business": "Manage organizations, analyze markets, and drive business growth",
        "Computer Science": "Develop software, analyze data, and work with technology systems",
        "Arts": "Create content, communicate ideas, and work in media and creative industries",
        "Finance": "Manage finances, analyze economic data, and work in accounting or banking",
        "Teaching": "Educate others, provide guidance, and work in educational institutions"
      };
      
      const relatedProgramsMap = {
        "Engineering": ["BS Electrical Engineering", "BS Mechanical Engineering", "BS Civil Engineering"],
        "Medical": ["MBBS", "Pharm-D", "BS Medical Lab Sciences"],
        "Business": ["BBA", "MBA", "BS Accounting"],
        "Computer Science": ["BS Computer Science", "BS Software Engineering", "BS Data Science"],
        "Arts": ["BS Mass Communication", "BS Psychology", "BS Sociology"],
        "Finance": ["BBA Finance", "BS Economics", "BS Accounting"],
        "Teaching": ["B.Ed", "BS Education", "M.Ed"]
      };
      
      topCareers.push({
        career: field,
        description: careerDescriptions[field] || `Career in ${field} based on your assessment results`,
        relatedPrograms: relatedProgramsMap[field] || [],
        score: Math.round(score),
        category: field
      });
    }
  });

  return {
    finalCareerScores,
    topCareers: topCareers.slice(0, 7),
    testWeights: weights,
    ruleBasedEnhancements
  };
};

/**
 * Submit Complete Assessment (All 3 Tests)
 */
exports.submitCompleteAssessment = async (req, res) => {
  try {
    const { personalityResponses, aptitudeResponses, interestResponses } = req.body;

    // Process Personality Test
    let personalityResults = null;
    if (personalityResponses && personalityResponses.length > 0) {
      const riasecScores = {
        Realistic: 0, Investigative: 0, Artistic: 0,
        Social: 0, Enterprising: 0, Conventional: 0
      };
      const scoreMap = { "Strongly Agree": 5, "Agree": 4, "Neutral": 3, "Disagree": 2, "Strongly Disagree": 1 };
      
      personalityResponses.forEach(r => {
        const question = personalityQuestions.find(q => q.id === r.questionId);
        if (question && question.riasecType) {
          riasecScores[question.riasecType] += scoreMap[r.answer] || 3;
        }
      });

      const maxScorePerType = 6 * 5;
      const normalizedScores = {};
      Object.keys(riasecScores).forEach(type => {
        normalizedScores[type] = normalizeScore(riasecScores[type], maxScorePerType);
      });

      const careerFields = {};
      Object.keys(normalizedScores).forEach(riasecType => {
        const fields = riasecCareerMapping[riasecType] || [];
        fields.forEach(field => {
          careerFields[field] = Math.max(careerFields[field] || 0, normalizedScores[riasecType]);
        });
      });

      personalityResults = { riasecScores, normalizedScores, careerFields };
    }

    // Process Aptitude Test
    let aptitudeResults = null;
    if (aptitudeResponses && aptitudeResponses.length > 0) {
      const sectionScores = {
        "Logical Reasoning": { correct: 0, total: 0 },
        "Mathematical Ability": { correct: 0, total: 0 },
        "Verbal Ability": { correct: 0, total: 0 },
        "Analytical Skills": { correct: 0, total: 0 }
      };
      const skillScores = {
        logical: { correct: 0, total: 0 },
        mathematical: { correct: 0, total: 0 },
        verbal: { correct: 0, total: 0 },
        analytical: { correct: 0, total: 0 }
      };

      aptitudeResponses.forEach(r => {
        const question = aptitudeQuestions.find(q => q.id === r.questionId);
        if (question) {
          const isCorrect = r.answer.toUpperCase() === question.correctAnswer.toUpperCase();
          if (sectionScores[question.category]) {
            sectionScores[question.category].total++;
            if (isCorrect) sectionScores[question.category].correct++;
          }
          if (skillScores[question.skillType]) {
            skillScores[question.skillType].total++;
            if (isCorrect) skillScores[question.skillType].correct++;
          }
        }
      });

      const normalizedSectionScores = {};
      Object.keys(sectionScores).forEach(section => {
        const { correct, total } = sectionScores[section];
        normalizedSectionScores[section] = total > 0 ? Math.round((correct / total) * 100) : 0;
      });

      const normalizedSkillScores = {};
      Object.keys(skillScores).forEach(skill => {
        const { correct, total } = skillScores[skill];
        normalizedSkillScores[skill] = total > 0 ? Math.round((correct / total) * 100) : 0;
      });

      const careerFields = {};
      Object.keys(normalizedSkillScores).forEach(skill => {
        const fields = skillCareerMapping[skill] || [];
        fields.forEach(field => {
          careerFields[field] = Math.max(careerFields[field] || 0, normalizedSkillScores[skill]);
        });
      });

      aptitudeResults = {
        sectionScores,
        normalizedSectionScores,
        skillScores,
        normalizedSkillScores,
        careerFields,
        totalCorrect: aptitudeResponses.filter(r => {
          const q = aptitudeQuestions.find(q => q.id === r.questionId);
          return q && r.answer.toUpperCase() === q.correctAnswer.toUpperCase();
        }).length,
        totalQuestions: aptitudeResponses.length
      };
    }

    // Process Interest Test
    let interestResults = null;
    if (interestResponses && interestResponses.length > 0) {
      const categoryScores = {
        engineering: 0, medical: 0, business: 0,
        computerScience: 0, arts: 0, workEnvironment: 0
      };

      const scoreMap = { "Strongly Agree": 5, "Agree": 4, "Neutral": 3, "Disagree": 2, "Strongly Disagree": 1 };
      interestResponses.forEach(r => {
        const question = assessmentQuestions.find(q => q.id === r.questionId);
        if (question) {
          categoryScores[question.category] += scoreMap[r.answer] || 3;
        }
      });

      const maxScorePerCategory = 6 * 5;
      const normalizedScores = {};
      Object.keys(categoryScores).forEach(category => {
        if (category !== 'workEnvironment') {
          normalizedScores[category] = normalizeScore(categoryScores[category], maxScorePerCategory);
        }
      });

      const sortedCategories = Object.entries(normalizedScores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

      const topCareers = [];
      sortedCategories.forEach(([category, score]) => {
        const careers = careerMappings[category] || [];
        careers.forEach(c => {
          topCareers.push({ ...c, score, category });
        });
      });

      interestResults = {
        categoryScores,
        normalizedScores,
        workEnvironmentScore: categoryScores.workEnvironment,
        topCareers: topCareers.slice(0, 5)
      };
    }

    // Perform weighted aggregation
    const aggregatedResults = performWeightedAggregation(personalityResults, aptitudeResults, interestResults);

    // Save complete assessment
    const assessment = await AssessmentResponse.create({
      user: req.user.id,
      personalityResults: personalityResults || undefined,
      aptitudeResults: aptitudeResults || undefined,
      interestResults: interestResults || undefined,
      aggregatedResults: aggregatedResults,
      testsCompleted: {
        personality: !!personalityResults,
        aptitude: !!aptitudeResults,
        interest: !!interestResults
      }
    });

    console.log(`Complete assessment submitted by user: ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Complete assessment submitted successfully',
      results: {
        personality: personalityResults,
        aptitude: aptitudeResults,
        interest: interestResults,
        aggregated: aggregatedResults
      }
    });
  } catch (error) {
    console.error('Complete assessment error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get Assessment Status (which tests are completed)
 */
exports.getAssessmentStatus = async (req, res) => {
  try {
    const assessment = await AssessmentResponse.findOne({ user: req.user.id }).sort({ createdAt: -1 });
    
    if (!assessment) {
      return res.status(200).json({
        success: true,
        status: {
          personality: false,
          aptitude: false,
          interest: false,
          allCompleted: false
        }
      });
    }

    const allCompleted = assessment.testsCompleted?.personality && 
                        assessment.testsCompleted?.aptitude && 
                        assessment.testsCompleted?.interest;

    res.status(200).json({
      success: true,
      status: {
        personality: assessment.testsCompleted?.personality || false,
        aptitude: assessment.testsCompleted?.aptitude || false,
        interest: assessment.testsCompleted?.interest || false,
        allCompleted: allCompleted
      },
      hasAggregatedResults: !!assessment.aggregatedResults
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get user's assessment results
 */
exports.getResults = async (req, res) => {
  try {
    const assessment = await AssessmentResponse.findOne({ user: req.user.id }).sort({ createdAt: -1 });
    
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'No assessment found. Please take the assessment first.'
      });
    }

    // Return aggregated results if available, otherwise legacy results
    const results = assessment.aggregatedResults || assessment.results;

    res.status(200).json({
      success: true,
      results: results,
      personality: assessment.personalityResults,
      aptitude: assessment.aptitudeResults,
      interest: assessment.interestResults,
      aggregated: assessment.aggregatedResults,
      completedAt: assessment.completedAt
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};






