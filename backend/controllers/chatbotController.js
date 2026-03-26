const { getAnswer, FAQ, getAnswerWithMeta } = require('../data/chatbotFAQ');
const { generateCounselorReply, isAIConfigured } = require('../services/careerCounselorAI');

/**
 * GET /api/chatbot/faq
 * Returns list of all questions (for suggestions/quick picks). Protected.
 */
exports.getFAQList = (req, res) => {
  try {
    const questions = FAQ.map((f) => f.q);
    res.status(200).json({
      success: true,
      questions,
      aiCounselorEnabled: isAIConfigured(),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/chatbot/status — optional: whether generative AI is configured (for UI badge)
 */
exports.getStatus = (req, res) => {
  try {
    res.status(200).json({
      success: true,
      aiCounselorEnabled: isAIConfigured(),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/chatbot/ask
 * Body: { message: string }
 * Pipeline: (1) FAQ + keyword + token-overlap NLP → (2) Google Gemini career counselor if no good match and API key set.
 */
exports.ask = async (req, res) => {
  try {
    const message = req.body?.message ?? req.body?.query ?? '';
    const meta = getAnswerWithMeta(message);

    if (meta.answer) {
      return res.status(200).json({
        success: true,
        answer: meta.answer,
        matchedQuestion: meta.question || null,
        suggestedQuestions: meta.suggested || [],
        source: 'faq',
        confidence: meta.confidence,
        matchedBy: meta.matchedBy,
        aiAvailable: isAIConfigured(),
      });
    }

    if (isAIConfigured()) {
      const aiReply = await generateCounselorReply(message);
      if (aiReply) {
        return res.status(200).json({
          success: true,
          answer: aiReply,
          matchedQuestion: null,
          suggestedQuestions: meta.suggested || [],
          source: 'ai',
          confidence: null,
          matchedBy: 'gemini',
          aiAvailable: true,
        });
      }
      console.warn('[chatbot] Gemini returned empty; falling back to generic FAQ text.');
    }

    const legacy = getAnswer(message);
    return res.status(200).json({
      success: true,
      answer: legacy.answer,
      matchedQuestion: legacy.question || null,
      suggestedQuestions: legacy.suggested || [],
      source: 'fallback',
      confidence: 0,
      matchedBy: 'legacy',
      aiAvailable: isAIConfigured(),
    });
  } catch (error) {
    console.error('[chatbot] ask error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
