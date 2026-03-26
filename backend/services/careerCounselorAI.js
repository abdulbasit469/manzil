/**
 * Generative AI layer for Manzil career counselor (Google Gemini).
 * Requires GEMINI_API_KEY or GOOGLE_AI_API_KEY in environment.
 * Optional: GEMINI_MODEL (default: gemini-1.5-flash)
 */
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { MANZIL_CONTEXT } = require('../data/chatbotKnowledgeBase');

const SYSTEM_INSTRUCTION = `You are **Manzil AI Career Counselor**, an NLP assistant for Pakistani students after intermediate.

${MANZIL_CONTEXT}

**Style:** Supportive, clear, non-judgmental. No hallucinated facts.

**Output:** Plain text only (no markdown headings). Max about 120 words unless the user asks for detail.`;

function getApiKey() {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_AI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    ''
  ).trim();
}

/**
 * @param {string} userMessage
 * @returns {Promise<string|null>} reply text, or null if no key / error
 */
async function generateCounselorReply(userMessage) {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const preferred = (process.env.GEMINI_MODEL || 'gemini-1.5-flash').trim();
  const fallbacks = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash-8b'];
  const modelsToTry = [preferred, ...fallbacks.filter((m) => m !== preferred)];

  const genAI = new GoogleGenerativeAI(apiKey);
  let lastErr = null;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: SYSTEM_INSTRUCTION,
        generationConfig: {
          maxOutputTokens: 512,
          temperature: 0.35,
        },
      });
      const prompt = `Student message (may be English or Roman Urdu):\n"""${String(userMessage).slice(0, 4000)}"""\n\nReply helpfully as Manzil career counselor.`;
      const result = await model.generateContent(prompt);
      const text = typeof result?.response?.text === 'function' ? result.response.text() : '';
      if (text && text.trim()) {
        return text.trim();
      }
    } catch (err) {
      lastErr = err;
      console.warn(`[CareerCounselorAI] Model ${modelName} failed:`, err?.message || err);
    }
  }

  if (lastErr) {
    console.error('[CareerCounselorAI] All models failed:', lastErr.message);
  }
  return null;
}

function isAIConfigured() {
  return Boolean(getApiKey());
}

module.exports = {
  generateCounselorReply,
  isAIConfigured,
  getApiKey: () => (getApiKey() ? '***' : ''),
};
