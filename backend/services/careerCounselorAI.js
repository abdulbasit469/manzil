/**
 * Generative AI layer for Manzil career counselor (Google Gemini).
 * Requires GEMINI_API_KEY or GOOGLE_AI_API_KEY in environment.
 * Optional: GEMINI_MODEL (default: gemini-2.5-flash)
 */
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { MANZIL_CONTEXT } = require('../data/chatbotKnowledgeBase');

const SYSTEM_INSTRUCTION = `You are Manzil AI Career Counselor, a concise assistant for Pakistani students after intermediate.

${MANZIL_CONTEXT}

RULES — follow every rule without exception:
1. SCOPE: Only answer questions about admissions, entry tests (MDCAT, ECAT, NET, etc.), university choices, degree programs, and career paths for Pakistani students. Nothing else.
2. OUT-OF-SCOPE: If the question is not related to the above topics, reply with exactly this sentence and nothing more: "I can only help with admissions, entry tests, and career guidance for Pakistani students."
3. LENGTH: Give the shortest correct answer possible. 1–3 sentences maximum. Do not add background, disclaimers, encouragement phrases, or filler words.
4. FORMAT: Plain text only. No bullet points, no headings, no markdown, no emojis.
5. ACCURACY: Never guess. If you do not know the exact answer, say: "I don't have that information. Please check the official university website."
6. LANGUAGE: Match the student's language (English or Roman Urdu). Keep the same tone — no formal essay style.`;


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

  const preferred = (process.env.GEMINI_MODEL || 'gemini-2.5-flash').trim();
  const fallbacks = ['gemini-2.5-pro', 'gemini-2.0-flash', 'gemini-2.5-flash'];
  const modelsToTry = [preferred, ...fallbacks.filter((m) => m !== preferred)];

  const genAI = new GoogleGenerativeAI(apiKey);
  let lastErr = null;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: SYSTEM_INSTRUCTION,
        generationConfig: {
          maxOutputTokens: 180,
          temperature: 0.2,
        },
      });
      const prompt = `Student question: "${String(userMessage).slice(0, 2000)}"\n\nAnswer in 1–3 sentences only. If out of scope, say the exact refusal sentence from the rules.`;
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
