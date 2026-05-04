/**
 * Generative AI layer for Manzil career counselor (xAI Grok).
 * Set XAI_API_KEY or GROK_API_KEY. Optional: GROK_MODEL / XAI_MODEL (default grok-4.20-reasoning).
 */
const {
  grokChatCompletion,
  getApiKey,
  isGrokConfigured,
} = require('./grokClient');
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

/**
 * @param {string} userMessage
 * @returns {Promise<string|null>} reply text, or null if no key / error
 */
async function generateCounselorReply(userMessage) {
  if (!getApiKey()) return null;

  const { text, error } = await grokChatCompletion({
    messages: [
      { role: 'system', content: SYSTEM_INSTRUCTION },
      {
        role: 'user',
        content: `Student question: "${String(userMessage).slice(0, 2000)}"\n\nAnswer in 1–3 sentences only. If out of scope, say the exact refusal sentence from the rules.`,
      },
    ],
    temperature: 0.2,
    maxCompletionTokens: parseInt(process.env.GROK_CHAT_MAX_TOKENS || '8192', 10) || 8192,
  });

  if (text) return text;
  if (error) {
    console.error('[CareerCounselorAI] Grok failed:', error);
  }
  return null;
}

module.exports = {
  generateCounselorReply,
  isAIConfigured: isGrokConfigured,
  getApiKey: () => (getApiKey() ? '***' : ''),
};
