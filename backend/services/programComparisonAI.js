const { GoogleGenerativeAI } = require('@google/generative-ai');

function getApiKey() {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_AI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    ''
  ).trim();
}

function stripCodeFence(text) {
  return String(text || '')
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim();
}

function clean(text) {
  return String(text || '').replace(/\*/g, '').trim();
}

async function backoffBeforeNextModel(err, isLastModel) {
  if (isLastModel) return;
  const msg = String(err?.message || err || '');
  const m = msg.match(/retry in ([\d.]+)\s*s/i);
  let ms = m ? Math.round(parseFloat(m[1]) * 1000) : 0;
  if (ms <= 0 && /503|Service Unavailable|high demand/i.test(msg)) ms = 3500;
  if (ms <= 0 && /429|Too Many Requests/i.test(msg)) ms = 4000;
  ms = Math.min(ms, 12000);
  if (ms > 0) await new Promise((r) => setTimeout(r, ms));
}

/**
 * Ask Gemini to produce concise comparison-friendly insights for degree programs.
 * Returns Map<string, object> keyed by program id.
 */
async function generateProgramComparisonInsights(programs) {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const genAI = new GoogleGenerativeAI(apiKey);
  const preferred = (process.env.GEMINI_MODEL || 'gemini-2.5-flash').trim();
  const fallbacks = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash'];
  const modelsToTry = [preferred, ...fallbacks.filter((m) => m !== preferred)];

  const systemInstruction =
    'You are a strict JSON generator for degree program comparison in Pakistan. Return only valid JSON. No markdown, no asterisks.';

  const prompt = `Task: Generate concise, practical comparison insights for each degree program listed below (Pakistan higher education context, useful for applicants).

Rules:
- Output JSON only. No markdown, no asterisks, no bullet markers, no exclamation marks.
- Schema:
{
  "items": [
    {
      "id": "string",
      "careerOutlook": "1-2 sentences, realistic job market for this degree in Pakistan",
      "salaryRange": "estimated starting salary range in PKR per month, e.g. Rs. 40,000 - 80,000",
      "industryLinkages": "key sectors or employer types graduates join, max ~20 words",
      "admissionDifficulty": "Easy | Moderate | Competitive | Highly Competitive",
      "programStrengths": "1 sentence about what this program is known for at this university or in general"
    }
  ]
}
- careerOutlook: based on the degree and field; realistic for Pakistan job market. No invented statistics.
- salaryRange: give a conservative realistic range for fresh graduates in Pakistan. If unknown, give a broad range for the field.
- industryLinkages: mention real sectors (software houses, banks, hospitals, telecom, public sector, engineering firms, etc.)
- admissionDifficulty: based on the field prestige and typical competition in Pakistan.
- programStrengths: brief factual statement, no marketing language.
- Never use asterisks or markdown formatting in any field.

Input programs JSON:
${JSON.stringify(programs).slice(0, 14000)}
`;

  let lastErr = null;
  for (let i = 0; i < modelsToTry.length; i++) {
    const modelName = modelsToTry[i];
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction,
        generationConfig: { temperature: 0.2, maxOutputTokens: 3000 },
      });
      const result = await model.generateContent(prompt);
      const raw = typeof result?.response?.text === 'function' ? result.response.text() : '';
      const cleaned = stripCodeFence(raw);
      const parsed = JSON.parse(cleaned);
      const out = new Map();
      for (const item of parsed?.items || []) {
        if (!item?.id) continue;
        out.set(String(item.id), {
          careerOutlook: clean(item.careerOutlook),
          salaryRange: clean(item.salaryRange),
          industryLinkages: clean(item.industryLinkages),
          admissionDifficulty: clean(item.admissionDifficulty),
          programStrengths: clean(item.programStrengths),
        });
      }
      return out;
    } catch (err) {
      lastErr = err;
      const msg = String(err?.message || err || '');
      if (/429|quota|Too Many Requests/i.test(msg)) {
        console.error(`[ProgramComparisonAI] ❌ QUOTA EXCEEDED on model ${modelName}`);
      } else if (/503|Service Unavailable|high demand/i.test(msg)) {
        console.warn(`[ProgramComparisonAI] ⚠️  model ${modelName} overloaded, retrying...`);
      } else {
        console.warn(`[ProgramComparisonAI] model ${modelName} failed:`, msg);
      }
      await backoffBeforeNextModel(err, i >= modelsToTry.length - 1);
    }
  }
  if (lastErr) {
    console.error('[ProgramComparisonAI] ❌ All models failed. Last error:', lastErr?.message || lastErr);
  }
  return null;
}

module.exports = { generateProgramComparisonInsights };
