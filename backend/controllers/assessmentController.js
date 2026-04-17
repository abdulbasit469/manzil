const AssessmentResponse = require('../models/Assessment');

// ============================================
// PERSONALITY TEST (MBTI - Myers-Briggs Type Indicator)
// ============================================

// MBTI Test Questions (80 questions - 20 per dimension)
// Questions 1-20: Extroversion (E) vs Introversion (I)
// Questions 21-40: Sensing (S) vs Intuition (N)
// Questions 41-60: Thinking (T) vs Feeling (F)
// Questions 61-80: Judging (J) vs Perceiving (P)

const personalityQuestions = [
  // Extroversion (E) vs Introversion (I) - Questions 1-20
  { id: 1, question: "I feel energized after spending time with a large group of people", mbtiDimension: "E/I", dimensionType: "E" },
  { id: 2, question: "I prefer to think things through before speaking", mbtiDimension: "E/I", dimensionType: "I" },
  { id: 3, question: "I enjoy being the center of attention at social gatherings", mbtiDimension: "E/I", dimensionType: "E" },
  { id: 4, question: "I need quiet time alone to recharge my energy", mbtiDimension: "E/I", dimensionType: "I" },
  { id: 5, question: "I am comfortable starting conversations with strangers", mbtiDimension: "E/I", dimensionType: "E" },
  { id: 6, question: "I prefer deep conversations with one or two close friends", mbtiDimension: "E/I", dimensionType: "I" },
  { id: 7, question: "I enjoy networking events and meeting new people", mbtiDimension: "E/I", dimensionType: "E" },
  { id: 8, question: "I feel drained after too much social interaction", mbtiDimension: "E/I", dimensionType: "I" },
  { id: 9, question: "I am outgoing and talkative in social settings", mbtiDimension: "E/I", dimensionType: "E" },
  { id: 10, question: "I prefer to observe before participating in group activities", mbtiDimension: "E/I", dimensionType: "I" },
  { id: 11, question: "I enjoy being around people and feel lonely when alone for too long", mbtiDimension: "E/I", dimensionType: "E" },
  { id: 12, question: "I process my thoughts internally before sharing them", mbtiDimension: "E/I", dimensionType: "I" },
  { id: 13, question: "I am comfortable speaking in front of groups", mbtiDimension: "E/I", dimensionType: "E" },
  { id: 14, question: "I prefer written communication over verbal when possible", mbtiDimension: "E/I", dimensionType: "I" },
  { id: 15, question: "I enjoy being part of multiple social groups", mbtiDimension: "E/I", dimensionType: "E" },
  { id: 16, question: "I need time to reflect before making important decisions", mbtiDimension: "E/I", dimensionType: "I" },
  { id: 17, question: "I am energized by external activities and interactions", mbtiDimension: "E/I", dimensionType: "E" },
  { id: 18, question: "I prefer working independently rather than in teams", mbtiDimension: "E/I", dimensionType: "I" },
  { id: 19, question: "I enjoy being spontaneous and trying new social activities", mbtiDimension: "E/I", dimensionType: "E" },
  { id: 20, question: "I value my privacy and personal space", mbtiDimension: "E/I", dimensionType: "I" },
  
  // Sensing (S) vs Intuition (N) - Questions 21-40
  { id: 21, question: "I focus on facts and concrete details rather than abstract concepts", mbtiDimension: "S/N", dimensionType: "S" },
  { id: 22, question: "I enjoy thinking about future possibilities and potential", mbtiDimension: "S/N", dimensionType: "N" },
  { id: 23, question: "I prefer step-by-step instructions and clear procedures", mbtiDimension: "S/N", dimensionType: "S" },
  { id: 24, question: "I see patterns and connections that others might miss", mbtiDimension: "S/N", dimensionType: "N" },
  { id: 25, question: "I trust my past experiences and proven methods", mbtiDimension: "S/N", dimensionType: "S" },
  { id: 26, question: "I enjoy brainstorming and generating new ideas", mbtiDimension: "S/N", dimensionType: "N" },
  { id: 27, question: "I pay attention to details and notice small changes", mbtiDimension: "S/N", dimensionType: "S" },
  { id: 28, question: "I am interested in theories and abstract thinking", mbtiDimension: "S/N", dimensionType: "N" },
  { id: 29, question: "I prefer practical, hands-on learning experiences", mbtiDimension: "S/N", dimensionType: "S" },
  { id: 30, question: "I enjoy exploring different perspectives and possibilities", mbtiDimension: "S/N", dimensionType: "N" },
  { id: 31, question: "I focus on what is happening in the present moment", mbtiDimension: "S/N", dimensionType: "S" },
  { id: 32, question: "I think about the big picture and long-term implications", mbtiDimension: "S/N", dimensionType: "N" },
  { id: 33, question: "I prefer concrete examples over abstract explanations", mbtiDimension: "S/N", dimensionType: "S" },
  { id: 34, question: "I enjoy reading between the lines and finding hidden meanings", mbtiDimension: "S/N", dimensionType: "N" },
  { id: 35, question: "I trust what I can see, hear, and experience directly", mbtiDimension: "S/N", dimensionType: "S" },
  { id: 36, question: "I am drawn to innovative and unconventional ideas", mbtiDimension: "S/N", dimensionType: "N" },
  { id: 37, question: "I prefer established methods that have worked before", mbtiDimension: "S/N", dimensionType: "S" },
  { id: 38, question: "I enjoy thinking about what could be rather than what is", mbtiDimension: "S/N", dimensionType: "N" },
  { id: 39, question: "I notice and remember specific details and facts", mbtiDimension: "S/N", dimensionType: "S" },
  { id: 40, question: "I am interested in understanding underlying principles and concepts", mbtiDimension: "S/N", dimensionType: "N" },
  
  // Thinking (T) vs Feeling (F) - Questions 41-60
  { id: 41, question: "I make decisions based on logical analysis rather than personal values", mbtiDimension: "T/F", dimensionType: "T" },
  { id: 42, question: "I consider how decisions will affect people's feelings", mbtiDimension: "T/F", dimensionType: "F" },
  { id: 43, question: "I prioritize truth and accuracy over harmony", mbtiDimension: "T/F", dimensionType: "T" },
  { id: 44, question: "I value empathy and understanding in my interactions", mbtiDimension: "T/F", dimensionType: "F" },
  { id: 45, question: "I focus on objective criteria when evaluating situations", mbtiDimension: "T/F", dimensionType: "T" },
  { id: 46, question: "I am sensitive to the emotional atmosphere in a room", mbtiDimension: "T/F", dimensionType: "F" },
  { id: 47, question: "I prefer to be direct and straightforward in communication", mbtiDimension: "T/F", dimensionType: "T" },
  { id: 48, question: "I consider personal values and relationships when making choices", mbtiDimension: "T/F", dimensionType: "F" },
  { id: 49, question: "I enjoy debating and analyzing different viewpoints", mbtiDimension: "T/F", dimensionType: "T" },
  { id: 50, question: "I prioritize maintaining positive relationships", mbtiDimension: "T/F", dimensionType: "F" },
  { id: 51, question: "I make decisions based on what makes the most sense logically", mbtiDimension: "T/F", dimensionType: "T" },
  { id: 52, question: "I am good at understanding and responding to others' emotions", mbtiDimension: "T/F", dimensionType: "F" },
  { id: 53, question: "I value fairness and consistency in my approach", mbtiDimension: "T/F", dimensionType: "T" },
  { id: 54, question: "I consider the impact of my actions on others' well-being", mbtiDimension: "T/F", dimensionType: "F" },
  { id: 55, question: "I prefer to solve problems using systematic analysis", mbtiDimension: "T/F", dimensionType: "T" },
  { id: 56, question: "I am motivated by helping others and making a positive difference", mbtiDimension: "T/F", dimensionType: "F" },
  { id: 57, question: "I can be critical and analytical when evaluating ideas", mbtiDimension: "T/F", dimensionType: "T" },
  { id: 58, question: "I value personal connections and authentic relationships", mbtiDimension: "T/F", dimensionType: "F" },
  { id: 59, question: "I focus on efficiency and effectiveness in my work", mbtiDimension: "T/F", dimensionType: "T" },
  { id: 60, question: "I am attuned to the needs and feelings of those around me", mbtiDimension: "T/F", dimensionType: "F" },
  
  // Judging (J) vs Perceiving (P) - Questions 61-80
  { id: 61, question: "I prefer to have things planned and organized in advance", mbtiDimension: "J/P", dimensionType: "J" },
  { id: 62, question: "I enjoy keeping my options open and staying flexible", mbtiDimension: "J/P", dimensionType: "P" },
  { id: 63, question: "I like to make decisions quickly and stick to them", mbtiDimension: "J/P", dimensionType: "J" },
  { id: 64, question: "I prefer to gather more information before making decisions", mbtiDimension: "J/P", dimensionType: "P" },
  { id: 65, question: "I work best with clear deadlines and structured schedules", mbtiDimension: "J/P", dimensionType: "J" },
  { id: 66, question: "I enjoy adapting to new situations and changing plans", mbtiDimension: "J/P", dimensionType: "P" },
  { id: 67, question: "I feel stressed when things are disorganized or unfinished", mbtiDimension: "J/P", dimensionType: "J" },
  { id: 68, question: "I prefer to work on multiple projects and switch between them", mbtiDimension: "J/P", dimensionType: "P" },
  { id: 69, question: "I like to complete tasks before starting new ones", mbtiDimension: "J/P", dimensionType: "J" },
  { id: 70, question: "I enjoy the process of exploring and discovering", mbtiDimension: "J/P", dimensionType: "P" },
  { id: 71, question: "I prefer to have a clear plan and know what to expect", mbtiDimension: "J/P", dimensionType: "J" },
  { id: 72, question: "I am comfortable with uncertainty and last-minute changes", mbtiDimension: "J/P", dimensionType: "P" },
  { id: 73, question: "I like to set goals and work systematically toward them", mbtiDimension: "J/P", dimensionType: "J" },
  { id: 74, question: "I enjoy spontaneity and going with the flow", mbtiDimension: "J/P", dimensionType: "P" },
  { id: 75, question: "I prefer to finish projects well before deadlines", mbtiDimension: "J/P", dimensionType: "J" },
  { id: 76, question: "I work well under pressure and can meet deadlines when needed", mbtiDimension: "J/P", dimensionType: "P" },
  { id: 77, question: "I like to have a sense of closure and completion", mbtiDimension: "J/P", dimensionType: "J" },
  { id: 78, question: "I enjoy exploring different options and possibilities", mbtiDimension: "J/P", dimensionType: "P" },
  { id: 79, question: "I prefer structured routines and consistent schedules", mbtiDimension: "J/P", dimensionType: "J" },
  { id: 80, question: "I am comfortable with open-ended situations and ambiguity", mbtiDimension: "J/P", dimensionType: "P" }
];

/**
 * Normalize score to 0-100 scale
 */
const normalizeScore = (rawScore, maxPossibleScore) => {
  if (maxPossibleScore === 0) return 0;
  return Math.round((rawScore / maxPossibleScore) * 100);
};

/**
 * Get Personality Test Questions (MBTI)
 */
exports.getPersonalityQuestions = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      count: personalityQuestions.length,
      testType: "personality",
      testName: "MBTI",
      questions: personalityQuestions.map(q => ({
        id: q.id,
        question: q.question,
        mbtiDimension: q.mbtiDimension,
        dimensionType: q.dimensionType
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Submit Personality Test (MBTI)
 */
exports.submitPersonalityTest = async (req, res) => {
  try {
    const { responses } = req.body; // Array of {questionId, answer}
    
    // MBTI Scoring: Strongly Agree=1, Agree=0.75, Neutral=0.5, Disagree=0.25, Strongly Disagree=0
    const scoreMap = { 
      "Strongly Agree": 1, 
      "Agree": 0.75, 
      "Neutral": 0.5, 
      "Disagree": 0.25, 
      "Strongly Disagree": 0 
    };

    // Initialize dimension scores (tracking both sides of each dimension)
    let extroversionScore = 0;  // E dimension (questions 1-20)
    let introversionScore = 0;  // I dimension (questions 1-20)
    let sensingScore = 0;       // S dimension (questions 21-40)
    let intuitionScore = 0;     // N dimension (questions 21-40)
    let thinkingScore = 0;      // T dimension (questions 41-60)
    let feelingScore = 0;       // F dimension (questions 41-60)
    let judgingScore = 0;       // J dimension (questions 61-80)
    let perceivingScore = 0;    // P dimension (questions 61-80)

    const processedResponses = responses.map(r => {
      const question = personalityQuestions.find(q => q.id === r.questionId);
      if (!question) return null;
      
      let score = scoreMap[r.answer] || 0.5;
      
      // Calculate scores for each dimension based on question range and type
      if (question.id >= 1 && question.id <= 20) {
        // E/I dimension
        if (question.dimensionType === "E") {
          extroversionScore += score;
        } else if (question.dimensionType === "I") {
          introversionScore += score;
        }
      } else if (question.id >= 21 && question.id <= 40) {
        // S/N dimension
        if (question.dimensionType === "S") {
          sensingScore += score;
        } else if (question.dimensionType === "N") {
          intuitionScore += score;
        }
      } else if (question.id >= 41 && question.id <= 60) {
        // T/F dimension
        if (question.dimensionType === "T") {
          thinkingScore += score;
        } else if (question.dimensionType === "F") {
          feelingScore += score;
        }
      } else if (question.id >= 61 && question.id <= 80) {
        // J/P dimension
        if (question.dimensionType === "J") {
          judgingScore += score;
        } else if (question.dimensionType === "P") {
          perceivingScore += score;
        }
      }
      
      return { questionId: r.questionId, answer: r.answer, score };
    }).filter(r => r !== null);

    // Determine MBTI type (each dimension has 20 questions, max score = 20)
    // If score > 10, choose first option; else choose second option
    const mbtiType = 
      (extroversionScore > introversionScore ? "E" : "I") +
      (sensingScore > intuitionScore ? "S" : "N") +
      (thinkingScore > feelingScore ? "T" : "F") +
      (judgingScore > perceivingScore ? "J" : "P");

    const results = {
      mbtiType: mbtiType,
      dimensionScores: {
        extroversion: extroversionScore,
        introversion: introversionScore,
        sensing: sensingScore,
        intuition: intuitionScore,
        thinking: thinkingScore,
        feeling: feelingScore,
        judging: judgingScore,
        perceiving: perceivingScore
      },
      rawScores: {
        E: extroversionScore,
        I: introversionScore,
        S: sensingScore,
        N: intuitionScore,
        T: thinkingScore,
        F: feelingScore,
        J: judgingScore,
        P: perceivingScore
      }
    };

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

    console.log(`MBTI test completed by user: ${req.user.email}, Type: ${mbtiType}`);

    res.status(201).json({
      success: true,
      message: 'MBTI personality test submitted successfully',
      testType: "personality",
      mbtiType: mbtiType,
      results: results
    });
  } catch (error) {
    console.error('MBTI test error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get MBTI Details using Gemini API
 */
exports.getMBTIDetails = async (req, res) => {
  try {
    const { mbtiType } = req.params;
    
    if (!mbtiType || mbtiType.length !== 4) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid MBTI type. Must be 4 characters (e.g., ESTJ)' 
      });
    }

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        success: false, 
        message: 'Gemini API key not configured. Please configure GEMINI_API_KEY in environment variables.' 
      });
    }

    // Use Gemini API REST API directly
    // First, get list of available models, then use the first available one
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      
      // First, try to get list of available models
      let availableModel = null;
      try {
        const listModelsUrl = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
        const listResponse = await fetch(listModelsUrl);
        
        if (listResponse.ok) {
          const modelsData = await listResponse.json();
          // Find first model that supports generateContent
          const supportedModel = modelsData.models?.find(model => 
            model.supportedGenerationMethods?.includes('generateContent')
          );
          if (supportedModel) {
            availableModel = supportedModel.name.replace('models/', '');
            console.log(`Found available model: ${availableModel}`);
          }
        }
      } catch (listError) {
        console.log('Could not list models, will try default models');
      }
      
      // If we found an available model, use it; otherwise try common model names
      const modelsToTry = availableModel 
        ? [availableModel]
        : [
            'gemini-2.5-flash',
            'gemini-1.5-flash-latest',
            'gemini-1.5-pro-latest',
            'gemini-1.5-flash',
            'gemini-1.5-pro',
            'gemini-pro'
          ];
      
      const dimensionNames = {
        'E': 'Extraversion', 'I': 'Introversion',
        'S': 'Sensing', 'N': 'Intuition',
        'T': 'Thinking', 'F': 'Feeling',
        'J': 'Judging', 'P': 'Perceiving'
      };

      const prompt = `Describe the MBTI personality type ${mbtiType} in a simple, natural way. Write like a human, not like AI. Format EXACTLY like this:

${mbtiType[0]} -> ${dimensionNames[mbtiType[0]]}
${mbtiType[1]} -> ${dimensionNames[mbtiType[1]]}
${mbtiType[2]} -> ${dimensionNames[mbtiType[2]]}
${mbtiType[3]} -> ${dimensionNames[mbtiType[3]]}

Then you MUST write exactly 4 bullet points. Each bullet point should be 1-2 lines. Use plain text only - NO asterisks, NO bold, NO special formatting. Write casually like a friend explaining it. Keep it short. Start each bullet point on a new line.`;

      let lastError = null;
      
      for (const modelName of modelsToTry) {
        try {
          // Remove 'models/' prefix if present
          const cleanModelName = modelName.replace('models/', '');
          const apiUrl = `https://generativelanguage.googleapis.com/v1/models/${cleanModelName}:generateContent?key=${apiKey}`;
          
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: prompt
                }]
              }]
            })
          });

          if (response.ok) {
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (text && text.trim().length > 0) {
              console.log(`Successfully used model: ${cleanModelName}`);
              
              // Parse the text to extract description paragraphs
              // Remove dimension mapping lines (E -> Extraversion format)
              let cleanText = text;
              const lines = cleanText.split('\n');
              const descriptionLines = lines.filter(line => {
                const trimmed = line.trim();
                // Skip dimension mappings and empty lines
                return trimmed.length > 0 && !trimmed.match(/^[A-Z]\s*->/) && !trimmed.match(/^[A-Z]\s*->/);
              });
              
              // Join lines back, split by double newlines or bullet points
              let description = descriptionLines.join('\n');
              
              // Split by bullets or paragraphs
              const paragraphs = description
                .split(/\n\s*\n|^\s*[-•*]\s*/m)
                .map(p => p.trim())
                .filter(p => p.length > 0 && !p.match(/^[A-Z]\s*->/));
              
              return res.status(200).json({
                success: true,
                mbtiType: mbtiType,
                details: {
                  description: paragraphs.length > 0 ? paragraphs : [text.trim()]
                }
              });
            }
          } else {
            const errorData = await response.json().catch(() => ({}));
            lastError = `Model ${cleanModelName}: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`;
            console.log(`Model ${cleanModelName} failed, trying next...`);
            continue; // Try next model
          }
        } catch (modelError) {
          lastError = `Model ${modelName} error: ${modelError.message}`;
          console.log(`Model ${modelName} error, trying next...`);
          continue; // Try next model
        }
      }
      
      // If all models failed
      throw new Error(`All Gemini models failed. Last error: ${lastError}`);
    } catch (geminiError) {
      console.error('Gemini API error:', geminiError);
      console.error('Gemini API error details:', geminiError.message);
      
      // Return detailed error message
      const errorMessage = geminiError.message || 'Unknown error occurred';
      
      return res.status(500).json({ 
        success: false, 
        message: `Failed to generate MBTI details using Gemini API: ${errorMessage}. Please check your API key and try again.`
      });
    }
  } catch (error) {
    console.error('Get MBTI details error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// BRAIN HEMISPHERE TEST (OHBDS - Open Hemispheric Brain Dominance Scale)
// ============================================
// 20 questions from archive/codebook. Scale: 1=Disagree, 3=Neutral, 5=Agree
// Left-brain items: logical, analytical, order. Right-brain: creative, emotional, random.
const brainQuestions = [
  { id: 1, question: "I do not need others praise.", hemisphere: "right" },
  { id: 2, question: "I would prefer a class in mathematics to a class in pottery.", hemisphere: "left" },
  { id: 3, question: "I never show up late.", hemisphere: "left" },
  { id: 4, question: "I don't bother to read the instructions before I start putting something together.", hemisphere: "right" },
  { id: 5, question: "I could not live in a mess.", hemisphere: "left" },
  { id: 6, question: "I am totally random.", hemisphere: "right" },
  { id: 7, question: "I like working with words.", hemisphere: "left" },
  { id: 8, question: "I behave in a businesslike manner.", hemisphere: "left" },
  { id: 9, question: "I come up with something new.", hemisphere: "right" },
  { id: 10, question: "I am not easily disturbed by events.", hemisphere: "left" },
  { id: 11, question: "I rarely cry during sad movies.", hemisphere: "left" },
  { id: 12, question: "I plan my life logically.", hemisphere: "left" },
  { id: 13, question: "I need a creative outlet.", hemisphere: "right" },
  { id: 14, question: "I make decisions based on facts, not feelings.", hemisphere: "left" },
  { id: 15, question: "I make a mess of things.", hemisphere: "right" },
  { id: 16, question: "I get stressed out easily.", hemisphere: "right" },
  { id: 17, question: "I am romantic.", hemisphere: "right" },
  { id: 18, question: "I prize logic above all else.", hemisphere: "left" },
  { id: 19, question: "I often forget to put things back in their proper place.", hemisphere: "right" },
  { id: 20, question: "I am calm even in tense situations.", hemisphere: "left" }
];

// Map frontend answer text to numeric 1-5 (OHBDS: 1=Disagree, 5=Agree)
const brainScoreMap = {
  "Strongly Agree": 5,
  "Agree": 4,
  "Neutral": 3,
  "Disagree": 2,
  "Strongly Disagree": 1
};

exports.getBrainQuestions = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      count: brainQuestions.length,
      testType: "brain",
      testName: "Brain Hemisphere",
      questions: brainQuestions.map(q => ({
        id: q.id,
        question: q.question,
        hemisphere: q.hemisphere
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.submitBrainTest = async (req, res) => {
  try {
    const { responses } = req.body; // Array of { questionId, answer } (answer as text or 1-5)
    if (!responses || !Array.isArray(responses)) {
      return res.status(400).json({ success: false, message: "Responses array is required." });
    }

    let leftScore = 0;
    let rightScore = 0;
    const questionMap = Object.fromEntries(brainQuestions.map(q => [q.id, q]));

    for (const r of responses) {
      const q = questionMap[r.questionId];
      if (!q) continue;
      const numScore = typeof r.answer === "number" ? r.answer : (brainScoreMap[r.answer] ?? 3);
      const clamped = Math.min(5, Math.max(1, numScore));
      if (q.hemisphere === "left") leftScore += clamped;
      else rightScore += clamped;
    }

    const totalLeftMax = brainQuestions.filter(q => q.hemisphere === "left").length * 5;
    const totalRightMax = brainQuestions.filter(q => q.hemisphere === "right").length * 5;
    const leftNorm = totalLeftMax > 0 ? Math.round((leftScore / totalLeftMax) * 100) : 0;
    const rightNorm = totalRightMax > 0 ? Math.round((rightScore / totalRightMax) * 100) : 0;
    // Use normalized scores (fair: left/right question counts differ). Not clinical neuroscience — self-report style.
    const normDiff = Math.abs(leftNorm - rightNorm);
    const dominance = normDiff <= 12 ? "Balanced" : leftNorm > rightNorm ? "Left" : "Right";

    let assessment = await AssessmentResponse.findOne({ user: req.user.id }).sort({ createdAt: -1 });
    const results = {
      dominance,
      leftScore,
      rightScore,
      leftNorm,
      rightNorm
    };

    if (!assessment) {
      assessment = await AssessmentResponse.create({
        user: req.user.id,
        brainResults: { dominance: results.dominance, leftScore: results.leftScore, rightScore: results.rightScore },
        testsCompleted: { personality: false, aptitude: false, interest: false, brain: true }
      });
    } else {
      assessment.brainResults = { dominance: results.dominance, leftScore: results.leftScore, rightScore: results.rightScore };
      if (!assessment.testsCompleted) assessment.testsCompleted = {};
      assessment.testsCompleted.brain = true;
      await assessment.save();
    }

    res.status(201).json({
      success: true,
      message: "Brain Hemisphere test submitted successfully",
      testType: "brain",
      dominance: results.dominance,
      results: { leftScore: results.leftScore, rightScore: results.rightScore, leftNorm: results.leftNorm, rightNorm: results.rightNorm }
    });
  } catch (error) {
    console.error("Brain test error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Static details for Left / Right / Balanced - personality traits in paragraph form
const brainDetails = {
  Left: {
    title: "Left Brain Dominance",
    description: [
      "Your thinking style is logical, analytical, and sequential; you like to follow steps and rely on facts. Your strengths are in math, language, planning, and organization. Your personality traits include being structured, fact-based, detail-oriented, and calm under pressure. You prefer clear rules and evidence-based decisions. Careers that often suit left-brain dominant people include engineering, accounting, law, and data analysis."
    ]
  },
  Right: {
    title: "Right Brain Dominance",
    description: [
      "Your thinking style is creative, intuitive, and holistic; you see the big picture and connect ideas in new ways. Your strengths are in art, music, innovation, and big-picture thinking. Your personality traits include being spontaneous, emotional, visual, and adaptable. You value creativity and flexibility over strict routines. Careers that often suit right-brain dominant people include design, arts, counseling, and roles that need innovation and empathy."
    ]
  },
  Balanced: {
    title: "Balanced (mixed) style",
    description: [
      "On this short quiz, your answers did not lean strongly toward either style — you reported a mix of structured and flexible habits. That is common: real people use both analysis and creativity. This result is a light-weight career-planning hint (not a medical or scientific brain scan). Roles that blend planning with creativity — such as teaching, product roles, or entrepreneurship — often suit mixed profiles."
    ]
  }
};

exports.getBrainDetails = async (req, res) => {
  try {
    const { dominance } = req.params; // Left, Right, or Balanced
    const key = ["Left", "Right", "Balanced"].includes(dominance) ? dominance : "Balanced";
    const details = brainDetails[key];
    res.status(200).json({
      success: true,
      dominance: key,
      details: {
        title: details.title,
        description: details.description
      }
    });
  } catch (error) {
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

// Career Path Profiler (Interest) - 10 MCQs, options A–F map to dimensions
// A=analytical, B=creative, C=social, D=leadership, E=practical, F=research
const OPTION_TO_DIMENSION = { A: "analytical", B: "creative", C: "social", D: "leadership", E: "practical", F: "research" };
const DIMENSION_LABELS = { analytical: "Analytical", creative: "Creative", social: "Social", leadership: "Leadership", practical: "Practical", research: "Research" };

const interestMCQQuestions = [
  { id: 1, question: "Which activity do you enjoy the most?", options: [
    { letter: "A", text: "Solving logical puzzles or mathematical problems" },
    { letter: "B", text: "Designing, drawing, or creating something new" },
    { letter: "C", text: "Helping people solve their problems" },
    { letter: "D", text: "Organizing tasks or leading a team" },
    { letter: "E", text: "Building or fixing things" },
    { letter: "F", text: "Researching and exploring new ideas" }
  ]},
  { id: 2, question: "Which type of school assignment do you prefer?", options: [
    { letter: "A", text: "Problem-solving or calculations" },
    { letter: "B", text: "Creative projects or presentations" },
    { letter: "C", text: "Group discussions or debates" },
    { letter: "D", text: "Planning or managing a project" },
    { letter: "E", text: "Practical experiments or hands-on work" },
    { letter: "F", text: "Research or report writing" }
  ]},
  { id: 3, question: "What type of problems do you enjoy solving?", options: [
    { letter: "A", text: "Logical and technical problems" },
    { letter: "B", text: "Creative and design challenges" },
    { letter: "C", text: "Social or human-related issues" },
    { letter: "D", text: "Business or management challenges" },
    { letter: "E", text: "Mechanical or practical issues" },
    { letter: "F", text: "Scientific or research questions" }
  ]},
  { id: 4, question: "Which skill describes you best?", options: [
    { letter: "A", text: "Analytical thinking" },
    { letter: "B", text: "Creativity" },
    { letter: "C", text: "Communication" },
    { letter: "D", text: "Leadership" },
    { letter: "E", text: "Practical / technical skills" },
    { letter: "F", text: "Curiosity and research ability" }
  ]},
  { id: 5, question: "What kind of work environment do you prefer?", options: [
    { letter: "A", text: "Computer-based or analytical environment" },
    { letter: "B", text: "Creative studio or design space" },
    { letter: "C", text: "Social environment with lots of interaction" },
    { letter: "D", text: "Office with management responsibilities" },
    { letter: "E", text: "Workshop, lab, or field work" },
    { letter: "F", text: "Research lab or academic environment" }
  ]},
  { id: 6, question: "How do you prefer to complete tasks?", options: [
    { letter: "A", text: "By analyzing data and solving step-by-step problems" },
    { letter: "B", text: "By thinking creatively and trying new ideas" },
    { letter: "C", text: "By discussing and collaborating with others" },
    { letter: "D", text: "By planning and organizing people or resources" },
    { letter: "E", text: "By physically building or testing things" },
    { letter: "F", text: "By studying information deeply" }
  ]},
  { id: 7, question: "Which type of content do you enjoy learning about?", options: [
    { letter: "A", text: "Technology and systems" },
    { letter: "B", text: "Art, design, or media" },
    { letter: "C", text: "Psychology and human behavior" },
    { letter: "D", text: "Business and entrepreneurship" },
    { letter: "E", text: "Engineering or mechanical systems" },
    { letter: "F", text: "Science and research" }
  ]},
  { id: 8, question: "What motivates you the most in a career?", options: [
    { letter: "A", text: "Solving complex problems" },
    { letter: "B", text: "Expressing creativity" },
    { letter: "C", text: "Helping others and making an impact" },
    { letter: "D", text: "Leading teams or organizations" },
    { letter: "E", text: "Building or inventing things" },
    { letter: "F", text: "Discovering new knowledge" }
  ]},
  { id: 9, question: "Which activity sounds most interesting?", options: [
    { letter: "A", text: "Writing code or analyzing data" },
    { letter: "B", text: "Creating videos, designs, or artwork" },
    { letter: "C", text: "Teaching or counseling people" },
    { letter: "D", text: "Running a company or managing projects" },
    { letter: "E", text: "Designing machines or structures" },
    { letter: "F", text: "Conducting experiments" }
  ]},
  { id: 10, question: "What type of achievement would make you most proud?", options: [
    { letter: "A", text: "Solving a difficult technical problem" },
    { letter: "B", text: "Creating something original" },
    { letter: "C", text: "Improving people's lives" },
    { letter: "D", text: "Leading a successful organization" },
    { letter: "E", text: "Building something useful" },
    { letter: "F", text: "Discovering something new" }
  ]}
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
 * Get Interest Test (Career Path Profiler) Questions - 10 MCQs
 */
exports.getQuestions = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      count: interestMCQQuestions.length,
      testType: "interest",
      testName: "Career Path Profiler",
      questions: interestMCQQuestions.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Map dimension scores to category scores for aggregation (engineering, medical, business, computerScience, arts)
 */
const dimensionToCategoryScores = (dimensionScores) => {
  const maxPerDim = 10; // 10 questions, so max count per dimension = 10
  const raw = {
    engineering: (dimensionScores.practical || 0) * 0.6 + (dimensionScores.research || 0) * 0.3,
    medical: (dimensionScores.social || 0) * 0.4 + (dimensionScores.research || 0) * 0.6,
    business: dimensionScores.leadership || 0,
    computerScience: dimensionScores.analytical || 0,
    arts: (dimensionScores.creative || 0) * 0.7 + (dimensionScores.social || 0) * 0.3
  };
  const maxRaw = 10;
  const normalizedScores = {};
  Object.keys(raw).forEach(cat => {
    normalizedScores[cat] = Math.round((raw[cat] / maxRaw) * 100);
  });
  return normalizedScores;
};

/**
 * Submit Interest Test (Career Path Profiler) - responses: [{ questionId, answer: "A"|"B"|... }]
 */
exports.submitAssessment = async (req, res) => {
  try {
    const { responses } = req.body;

    const dimensionScores = { analytical: 0, creative: 0, social: 0, leadership: 0, practical: 0, research: 0 };

    (responses || []).forEach(r => {
      const dim = OPTION_TO_DIMENSION[r.answer];
      if (dim) dimensionScores[dim]++;
    });

    const sortedDims = Object.entries(dimensionScores)
      .sort((a, b) => b[1] - a[1])
      .filter(([, count]) => count > 0);
    const topDimensions = sortedDims.slice(0, 3).map(([dim]) => DIMENSION_LABELS[dim]);

    const normalizedScores = dimensionToCategoryScores(dimensionScores);
    const sortedCategories = Object.entries(normalizedScores).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const topCareers = [];
    sortedCategories.forEach(([category, score]) => {
      (careerMappings[category] || []).forEach(c => {
        topCareers.push({ ...c, score, category });
      });
    });

    const results = {
      dimensionScores,
      normalizedScores,
      topDimensions,
      topCareers: topCareers.slice(0, 6),
      workEnvironmentScore: null
    };

    let assessment = await AssessmentResponse.findOne({ user: req.user.id }).sort({ createdAt: -1 });
    if (!assessment) {
      assessment = await AssessmentResponse.create({
        user: req.user.id,
        interestResults: results,
        testsCompleted: { personality: false, aptitude: false, interest: true }
      });
    } else {
      assessment.interestResults = results;
      assessment.testsCompleted.interest = true;
      await assessment.save();
    }

    await checkAndAggregate(assessment);
    console.log(`Interest (Career Path Profiler) completed by user: ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Career Path Profiler submitted successfully',
      testType: 'interest',
      topDimensions,
      results
    });
  } catch (error) {
    console.error('Interest test error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Short paragraph per dimension for Interest (Career Path Profiler) details modal
const interestDimensionDetails = {
  Analytical: "You prefer logical thinking, data, and technology. You enjoy solving complex problems and working with systems.",
  Creative: "You enjoy design, art, and expressing new ideas. You thrive in roles that allow originality and visual or creative work.",
  Social: "You are motivated by helping others and communication. You enjoy teaching, counseling, and roles that improve people's lives.",
  Leadership: "You like organizing, leading, and business. You are motivated by managing teams and driving results.",
  Practical: "You prefer hands-on work, building and fixing things. You enjoy engineering, workshops, and tangible outcomes.",
  Research: "You are curious and enjoy discovering new knowledge. You thrive in science, research, and academic environments."
};

/**
 * Get Interest (Career Path Profiler) details for the current user - paragraph based on top dimensions
 */
exports.getInterestDetails = async (req, res) => {
  try {
    const assessment = await AssessmentResponse.findOne({ user: req.user.id }).sort({ createdAt: -1 });
    const topDimensions = assessment?.interestResults?.topDimensions;
    if (!topDimensions || !Array.isArray(topDimensions) || topDimensions.length === 0) {
      return res.status(200).json({
        success: true,
        title: 'Career Path Profiler – Your Interests',
        topDimensions: [],
        description: [
          'Your Career Path Profiler assessment is complete. Your top interest dimensions (e.g. Analytical, Creative, Social) are used to generate degree recommendations.',
          'If you have just completed the test, try refreshing the page to see your detailed breakdown here.'
        ]
      });
    }
    const paragraphs = topDimensions.map(d => interestDimensionDetails[d] || `${d} is one of your leading interests.`).filter(Boolean);
    res.status(200).json({
      success: true,
      title: 'Career Path Profiler – Your Interests',
      topDimensions,
      description: paragraphs.length ? paragraphs : ['Your interests help match you with suitable careers and programs.']
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Check and Auto-Aggregate when all 3 tests are complete: Personality, Brain, Interest
 */
const checkAndAggregate = async (assessment) => {
  const hasThree = assessment.testsCompleted?.personality &&
    assessment.testsCompleted?.brain &&
    assessment.testsCompleted?.interest;
  if (hasThree && !assessment.aggregatedResults) {
    try {
      const aggregatedResults = performWeightedAggregation(
        assessment.personalityResults,
        assessment.interestResults,
        assessment.brainResults,
        assessment.aptitudeResults
      );
      assessment.aggregatedResults = aggregatedResults;
      await assessment.save();
      console.log(`Auto-aggregated results (Personality + Brain + Interest) for user: ${assessment.user}`);
    } catch (err) {
      console.error('checkAndAggregate error:', err.message);
    }
  }
};

/**
 * Derive career field scores from MBTI type when careerFields are not present
 */
const mbtiToCareerScores = (mbtiType) => {
  if (!mbtiType || mbtiType.length !== 4) return {};
  const scores = {};
  const t = mbtiType[2] === 'T'; // Thinking
  const f = mbtiType[2] === 'F'; // Feeling
  const n = mbtiType[1] === 'N'; // Intuition
  const s = mbtiType[1] === 'S'; // Sensing
  const j = mbtiType[3] === 'J'; // Judging
  if (t) { scores["Engineering"] = 60; scores["Computer Science"] = 70; scores["Finance"] = 50; }
  if (f) { scores["Arts"] = 65; scores["Medical"] = 55; scores["Teaching"] = 50; }
  if (n) { scores["Arts"] = (scores["Arts"] || 0) + 40; scores["Computer Science"] = (scores["Computer Science"] || 0) + 30; }
  if (s) { scores["Engineering"] = (scores["Engineering"] || 0) + 30; scores["Medical"] = (scores["Medical"] || 0) + 30; }
  if (j) { scores["Business"] = 55; scores["Finance"] = (scores["Finance"] || 0) + 40; }
  return scores;
};

/**
 * Weighted Aggregation: Personality + Interest + Brain (and optionally Aptitude)
 * Used for degree recommendations based on 3 tests: Personality, Brain Hemisphere, Career Path Profiler
 */
const performWeightedAggregation = (personalityResults, interestResults, brainResults, aptitudeResults) => {
  const hasAptitude = aptitudeResults && Object.keys(aptitudeResults.careerFields || {}).length > 0;
  const weights = hasAptitude
    ? { personality: 0.25, aptitude: 0.35, interest: 0.30, brain: 0.10 }
    : { personality: 0.35, interest: 0.45, brain: 0.20 };

  const interestMapping = {
    engineering: "Engineering",
    medical: "Medical",
    business: "Business",
    computerScience: "Computer Science",
    arts: "Arts"
  };

  const finalCareerScores = {};
  const ruleBasedEnhancements = [];

  const addToCareerField = (field, score, weight) => {
    if (!finalCareerScores[field]) finalCareerScores[field] = 0;
    finalCareerScores[field] += score * weight;
  };

  // 1. Personality: use careerFields or derive from MBTI
  if (personalityResults) {
    if (personalityResults.careerFields && Object.keys(personalityResults.careerFields).length > 0) {
      Object.keys(personalityResults.careerFields).forEach(field => {
        addToCareerField(field, personalityResults.careerFields[field], weights.personality);
      });
    } else if (personalityResults.mbtiType) {
      const mbtiScores = mbtiToCareerScores(personalityResults.mbtiType);
      Object.keys(mbtiScores).forEach(field => {
        addToCareerField(field, mbtiScores[field], weights.personality);
      });
    }
  }

  // 2. Aptitude (optional)
  if (hasAptitude && aptitudeResults.careerFields) {
    Object.keys(aptitudeResults.careerFields).forEach(field => {
      addToCareerField(field, aptitudeResults.careerFields[field], weights.aptitude);
    });
  }

  // 3. Interest (Career Path Profiler) – use saved normalizedScores or derive from dimensionScores
  if (interestResults) {
    let interestScores = interestResults.normalizedScores;
    if (!interestScores || Object.keys(interestScores).length === 0) {
      if (interestResults.dimensionScores) {
        interestScores = dimensionToCategoryScores(interestResults.dimensionScores);
      }
    }
    if (interestScores) {
      Object.keys(interestScores).forEach(category => {
        const field = interestMapping[category];
        if (field) addToCareerField(field, interestScores[category], weights.interest);
      });
    }
  }

  // 4. Brain Hemisphere
  if (brainResults && brainResults.dominance) {
    const brainBoost = 25;
    if (brainResults.dominance === "Left") {
      addToCareerField("Engineering", brainBoost, weights.brain);
      addToCareerField("Computer Science", brainBoost, weights.brain);
      addToCareerField("Finance", brainBoost * 0.6, weights.brain);
    } else if (brainResults.dominance === "Right") {
      addToCareerField("Arts", brainBoost, weights.brain);
      addToCareerField("Teaching", brainBoost * 0.8, weights.brain);
    } else {
      addToCareerField("Business", brainBoost * 0.8, weights.brain);
      addToCareerField("Computer Science", brainBoost * 0.5, weights.brain);
      addToCareerField("Arts", brainBoost * 0.5, weights.brain);
    }
  }

  // Rule-based enhancements (optional, when data present)
  if (aptitudeResults && aptitudeResults.normalizedSkillScores) {
    const logical = aptitudeResults.normalizedSkillScores.logical || 0;
    const analytical = aptitudeResults.normalizedSkillScores.analytical || 0;
    if (logical >= 70 && analytical >= 70) {
      finalCareerScores["Engineering"] = (finalCareerScores["Engineering"] || 0) + 10;
      ruleBasedEnhancements.push("High logical and analytical skills → Engineering boost");
    }
  }
  if (personalityResults && personalityResults.normalizedScores) {
    const artistic = personalityResults.normalizedScores.Artistic || 0;
    const social = personalityResults.normalizedScores.Social || 0;
    if (artistic >= 70 && social >= 70) {
      finalCareerScores["Arts"] = (finalCareerScores["Arts"] || 0) + 10;
      ruleBasedEnhancements.push("High creative and communication skills → Media/Arts boost");
    }
    const enterprising = personalityResults.normalizedScores.Enterprising || 0;
    if (social >= 70 && enterprising >= 70) {
      finalCareerScores["Business"] = (finalCareerScores["Business"] || 0) + 10;
      ruleBasedEnhancements.push("High social and enterprising traits → Business/Management boost");
    }
  }

  // Top 3 career fields only (no long job-title explosion from interest mappings)
  const sortedCareers = Object.entries(finalCareerScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const careerDescriptions = {
    Engineering: "Design and develop technical systems, infrastructure, and solutions",
    Medical: "Work in healthcare, diagnose and treat patients, or conduct medical research",
    Business: "Manage organizations, analyze markets, and drive business growth",
    "Computer Science": "Develop software, analyze data, and work with technology systems",
    Arts: "Create content, communicate ideas, and work in media and creative industries",
    Finance: "Manage finances, analyze economic data, and work in accounting or banking",
    Teaching: "Educate others, provide guidance, and work in educational institutions"
  };

  const relatedProgramsMap = {
    Engineering: ["BS Electrical Engineering", "BS Mechanical Engineering", "BS Civil Engineering"],
    Medical: ["MBBS", "Pharm-D", "BS Medical Lab Sciences"],
    Business: ["BBA", "MBA", "BS Accounting"],
    "Computer Science": ["BS Computer Science", "BS Software Engineering", "BS Data Science"],
    Arts: ["BS Mass Communication", "BS Psychology", "BS Sociology"],
    Finance: ["BBA Finance", "BS Economics", "BS Accounting"],
    Teaching: ["B.Ed", "BS Education", "M.Ed"]
  };

  const topCareers = sortedCareers.map(([field, score]) => ({
    career: field,
    description: careerDescriptions[field] || `Career field: ${field}`,
    relatedPrograms: relatedProgramsMap[field] || [],
    score: Math.round(score),
    category: field
  }));

  // Build recommended degrees list (for degree recommendation system)
  const seen = new Set();
  const recommendedDegrees = [];
  topCareers.forEach(c => {
    const list = c.relatedPrograms || [];
    const match = Math.round(c.score || 0);
    list.forEach(degreeName => {
      if (!seen.has(degreeName)) {
        seen.add(degreeName);
        recommendedDegrees.push({ degree: degreeName, field: c.category || c.career, match });
      }
    });
  });

  return {
    finalCareerScores,
    topCareers: topCareers.slice(0, 3),
    recommendedDegrees: recommendedDegrees.slice(0, 12),
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

    // Perform weighted aggregation (personality, interest, brain, aptitude)
    const aggregatedResults = performWeightedAggregation(
      personalityResults,
      interestResults,
      null,
      aptitudeResults
    );

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
        },
        mbtiType: null,
        brainCompleted: false,
        brainDominance: null
      });
    }

    // Infer completion from saved data so old/present results count even if flags were missing
    const personalityDone = assessment.testsCompleted?.personality || !!assessment.personalityResults?.mbtiType;
    const brainDone = assessment.testsCompleted?.brain || !!assessment.brainResults?.dominance;
    const interestDone = assessment.testsCompleted?.interest ||
      !!(assessment.interestResults?.normalizedScores && Object.keys(assessment.interestResults.normalizedScores).length > 0) ||
      !!(assessment.interestResults?.topDimensions && assessment.interestResults.topDimensions.length > 0) ||
      !!(assessment.interestResults?.dimensionScores && Object.keys(assessment.interestResults.dimensionScores).length > 0) ||
      !!(assessment.interestResults?.topCareers && assessment.interestResults.topCareers.length > 0);
    const allCompleted = personalityDone && brainDone && interestDone;

    // Run aggregation if all 3 tests are done but aggregated not yet saved
    if (allCompleted) {
      await checkAndAggregate(assessment);
    }

    // Get MBTI type from personality results
    const mbtiType = assessment.personalityResults?.mbtiType || null;
    const brainCompleted = brainDone;
    const brainDominance = assessment.brainResults?.dominance || null;
    const interestTopDimensions = assessment.interestResults?.topDimensions || null;

    res.status(200).json({
      success: true,
      status: {
        personality: personalityDone,
        aptitude: assessment.testsCompleted?.aptitude || false,
        interest: interestDone,
        allCompleted: allCompleted
      },
      hasAggregatedResults: !!assessment.aggregatedResults,
      mbtiType: mbtiType,
      brainCompleted: brainCompleted,
      brainDominance: brainDominance,
      interestTopDimensions: interestTopDimensions
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

    // Same completion logic as status: use saved data so no re-attempt needed
    const personalityDone = assessment.testsCompleted?.personality || !!assessment.personalityResults?.mbtiType;
    const brainDone = assessment.testsCompleted?.brain || !!assessment.brainResults?.dominance;
    const interestDone = assessment.testsCompleted?.interest ||
      !!(assessment.interestResults?.normalizedScores && Object.keys(assessment.interestResults.normalizedScores).length > 0) ||
      !!(assessment.interestResults?.topDimensions && assessment.interestResults.topDimensions.length > 0) ||
      !!(assessment.interestResults?.dimensionScores && Object.keys(assessment.interestResults.dimensionScores).length > 0) ||
      !!(assessment.interestResults?.topCareers && assessment.interestResults.topCareers.length > 0);
    const allThree = personalityDone && brainDone && interestDone;

    let results = assessment.aggregatedResults || assessment.results;
    let aggregated = assessment.aggregatedResults;

    // Always derive recommendations from saved test data when all 3 are present (no re-attempt needed)
    if (allThree) {
      try {
        aggregated = performWeightedAggregation(
          assessment.personalityResults,
          assessment.interestResults,
          assessment.brainResults,
          assessment.aptitudeResults
        );
        if (!assessment.aggregatedResults) {
          assessment.aggregatedResults = aggregated;
          await assessment.save();
        }
      } catch (err) {
        console.error('getResults aggregation error:', err.message);
      }
    }

    // If aggregated exists but recommendedDegrees missing/empty, build from topCareers
    if (aggregated && (!aggregated.recommendedDegrees || aggregated.recommendedDegrees.length === 0) && aggregated.topCareers?.length > 0) {
      const seen = new Set();
      const recommendedDegrees = [];
      aggregated.topCareers.forEach(c => {
        (c.relatedPrograms || []).forEach(degreeName => {
          if (!seen.has(degreeName)) {
            seen.add(degreeName);
            recommendedDegrees.push({ degree: degreeName, field: c.category || c.career || '', match: Math.round(c.score || 0) });
          }
        });
      });
      aggregated = { ...aggregated, recommendedDegrees: recommendedDegrees.slice(0, 15) };
    }

    // When all 3 complete, ensure we always return recommendations (rule-based weighted aggregation, not AI)
    const defaultDegrees = [
      { degree: 'BS Computer Science', field: 'Computer Science', match: 75 },
      { degree: 'BS Software Engineering', field: 'Computer Science', match: 72 },
      { degree: 'BBA', field: 'Business', match: 70 },
      { degree: 'BS Psychology', field: 'Arts', match: 68 },
      { degree: 'BS Electrical Engineering', field: 'Engineering', match: 65 }
    ];
    if (allThree) {
      if (!aggregated) {
        aggregated = { topCareers: [], recommendedDegrees: defaultDegrees, finalCareerScores: {}, testWeights: {}, ruleBasedEnhancements: [] };
      } else if (!aggregated.recommendedDegrees || aggregated.recommendedDegrees.length === 0) {
        aggregated = { ...aggregated, recommendedDegrees: defaultDegrees };
        if (!aggregated.topCareers || aggregated.topCareers.length === 0) {
          aggregated.topCareers = [{ career: 'General', category: 'General', score: 70, description: 'Based on your 3 assessments', relatedPrograms: defaultDegrees.map(d => d.degree) }];
        }
      }
    }

    res.status(200).json({
      success: true,
      results: results,
      personality: assessment.personalityResults,
      aptitude: assessment.aptitudeResults,
      interest: assessment.interestResults,
      aggregated: aggregated,
      completedAt: assessment.completedAt
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};






