const { GoogleGenerativeAI } = require('@google/generative-ai');
const { sanitizeFacilityMicroBlurb, sanitizeInsightSnippet } = require('../utils/comparisonTextGuards');

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

function removeAsterisks(text) {
  return String(text || '').replace(/\*/g, '').trim();
}

function normalizeType(type) {
  const t = String(type || '').toLowerCase();
  if (t.includes('public')) return 'Public';
  if (t.includes('private')) return 'Private';
  return '';
}

function maskApiKeyForLog(key) {
  const k = String(key || '').trim();
  if (!k) return 'empty';
  const head = k.slice(0, 6);
  const tail = k.slice(-4);
  return `${head}...${tail} (len:${k.length})`;
}

/** Brief pause before trying the next model (helps 503 / short 429 bursts). */
async function backoffBeforeNextModel(err, isLastModel) {
  if (isLastModel) return;
  const msg = String(err?.message || err || '');
  const m = msg.match(/retry in ([\d.]+)\s*s/i);
  let ms = m ? Math.round(parseFloat(m[1], 10) * 1000) : 0;
  if (ms <= 0 && /503|Service Unavailable|high demand/i.test(msg)) ms = 3500;
  if (ms <= 0 && /429|Too Many Requests/i.test(msg)) ms = 4000;
  ms = Math.min(ms, 12000);
  if (ms > 0) await new Promise((r) => setTimeout(r, ms));
}

/**
 * Ask Gemini to produce concise comparison-friendly fields.
 * Returns Map<string, object> by university id.
 */
async function generateUniversityComparisonInsights(universities) {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  console.log(`[UniversityComparisonAI] api key fingerprint: ${maskApiKeyForLog(apiKey)}`);

  const genAI = new GoogleGenerativeAI(apiKey);
  const preferred = (process.env.GEMINI_MODEL || 'gemini-2.5-flash').trim();
  // Only ids that still exist on the Generative Language API for most keys (1.5 bare names often 404 on v1beta).
  const fallbacks = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash'];
  const modelsToTry = [preferred, ...fallbacks.filter((m) => m !== preferred)];

  const systemInstruction =
    'You are a strict JSON generator for university comparison. Return only valid JSON. No markdown, no asterisks.';

  const prompt = `Task: Generate concise comparison fields for each university (Pakistan-focused, practical for applicants).

Rules:
- Output JSON only.
- Schema per item:
{
  "items": [
    {
      "id": "string",
      "type": "Public|Private|",
      "hecRanking": number|null,
      "programsOffer": number|null,
      "addressShort": "max 4-6 words",
      "facilityMicroBlurbs": ["2-3 words","2-3 words","2-3 words","2-3 words","2-3 words"],
      "industryLinkages": "one short phrase, max ~18 words",
      "financialSupport": "one short phrase, max ~18 words",
      "labFacilitiesShort": "one short phrase, max ~18 words",
      "studentLifeShort": "one short phrase, max ~18 words",
      "feeComputingEngSemester": "string or empty",
      "feeBusinessSocialSemester": "string or empty"
    }
  ]
}
- facilityMicroBlurbs: exactly 5 strings in this order — (1) Library (2) Career Center (3) Health Center (4) Student Union (5) IT Services. Each string must be only 2 or 3 words (no commas), plain student benefit tone, not marketing slogans, not website UI text.
- industryLinkages: name realistic sectors or employer types graduates often join (banks, telecom, public sector, engineering firms, software houses, hospitals for medical). Do not invent a fake list of five exact company names unless you are certain from input.
- financialSupport: mention scholarships / HEC / need-based / on-campus aid in general terms if unknown from input.
- labFacilitiesShort: mention lab types or counts only if inferable; otherwise say to confirm on site.
- studentLifeShort: societies, sports, hostels in brief; conservative if unknown.
- No bullet markers, no markdown, no asterisks, no exclamation marks.
- Never copy navigation or accessibility widget text (screen reader, color switcher, language toggle, help desk phone lines).
- Keep website unchanged (do not output website).

Input universities JSON:
${JSON.stringify(universities).slice(0, 18000)}
`;

  let lastErr = null;
  for (let i = 0; i < modelsToTry.length; i++) {
    const modelName = modelsToTry[i];
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction,
        generationConfig: { temperature: 0.2, maxOutputTokens: 4096 },
      });
      const result = await model.generateContent(prompt);
      const raw = typeof result?.response?.text === 'function' ? result.response.text() : '';
      const cleaned = stripCodeFence(raw);
      const parsed = JSON.parse(cleaned);
      const out = new Map();
      for (const item of parsed?.items || []) {
        if (!item?.id) continue;
        const blurbsIn = Array.isArray(item.facilityMicroBlurbs) ? item.facilityMicroBlurbs : [];
        const facilityMicroBlurbs = [0, 1, 2, 3, 4].map((j) => sanitizeFacilityMicroBlurb(blurbsIn[j] || ''));

        out.set(String(item.id), {
          type: normalizeType(item.type),
          hecRanking: Number.isFinite(item.hecRanking) ? Number(item.hecRanking) : null,
          programsOffer: Number.isFinite(item.programsOffer) ? Number(item.programsOffer) : null,
          addressShort: removeAsterisks(item.addressShort),
          facilityMicroBlurbs,
          industryLinkages: sanitizeInsightSnippet(removeAsterisks(item.industryLinkages), 140),
          financialSupport: sanitizeInsightSnippet(removeAsterisks(item.financialSupport), 140),
          labFacilitiesShort: sanitizeInsightSnippet(removeAsterisks(item.labFacilitiesShort), 140),
          studentLifeShort: sanitizeInsightSnippet(removeAsterisks(item.studentLifeShort), 140),
          feeComputingEngSemester: removeAsterisks(item.feeComputingEngSemester),
          feeBusinessSocialSemester: removeAsterisks(item.feeBusinessSocialSemester),
        });
      }
      return out;
    } catch (err) {
      lastErr = err;
      const msg = String(err?.message || err || '');
      if (/429|quota|Too Many Requests/i.test(msg)) {
        console.error(`[UniversityComparisonAI] ❌ QUOTA EXCEEDED on model ${modelName} — free tier limit hit. Upgrade your Gemini API plan at https://ai.google.dev or wait for daily reset.`);
      } else if (/503|Service Unavailable|high demand/i.test(msg)) {
        console.warn(`[UniversityComparisonAI] ⚠️  model ${modelName} overloaded (503), retrying next...`);
      } else {
        console.warn(`[UniversityComparisonAI] model ${modelName} failed:`, msg);
      }
      await backoffBeforeNextModel(err, i >= modelsToTry.length - 1);
    }
  }
  if (lastErr) {
    console.error('[UniversityComparisonAI] ❌ All models failed — falling back to estimated data. Last error:', lastErr?.message || lastErr);
  }
  return null;
}

module.exports = {
  generateUniversityComparisonInsights,
};
