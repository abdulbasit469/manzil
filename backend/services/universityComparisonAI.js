const { grokChatCompletion, getApiKey, maskApiKeyForLog, getComparisonJsonBudget } = require('./grokClient');
const { sanitizeFacilityMicroBlurb, sanitizeInsightSnippet } = require('../utils/comparisonTextGuards');

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
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

/**
 * Ask Grok to produce concise comparison-friendly fields.
 * Returns Map<string, object> by university id.
 */
async function generateUniversityComparisonInsights(universities) {
  if (!getApiKey()) {
    console.warn(
      '[UniversityComparisonAI] Skipping Grok (no API key). Set XAI_API_KEY or GROK_API_KEY in .env next to package.json, then restart the server.'
    );
    if (process.env.GEMINI_API_KEY?.trim()) {
      console.warn(
        '[UniversityComparisonAI] GEMINI_API_KEY is set but the backend no longer uses Gemini; use XAI_API_KEY from https://console.x.ai'
      );
    }
    return null;
  }
  console.log(`[UniversityComparisonAI] api key fingerprint: ${maskApiKeyForLog(getApiKey())}`);

  const systemInstruction =
    'You are a strict JSON generator for university comparison. Return only valid JSON. No markdown, no asterisks.';

  const budget = getComparisonJsonBudget();

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
${JSON.stringify(universities).slice(0, budget.universityInputChars)}
`;

  const messages = [
    { role: 'system', content: systemInstruction },
    { role: 'user', content: prompt },
  ];

  let lastErr = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    const { text, error } = await grokChatCompletion({
      messages,
      temperature: 0.2,
      maxCompletionTokens: budget.maxOutputTokens,
    });
    if (error) lastErr = error;
    if (!text) {
      const msg = String(error || '');
      if (/429|rate|Too Many Requests/i.test(msg) && attempt === 0) {
        await sleep(4000);
        continue;
      }
      break;
    }
    try {
      const cleaned = stripCodeFence(text);
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
      console.warn('[UniversityComparisonAI] JSON parse failed:', err?.message || err);
    }
  }

  if (lastErr) {
    console.error(
      '[UniversityComparisonAI] Grok failed — falling back to estimated data. Last error:',
      String(lastErr?.message || lastErr)
    );
  }
  return null;
}

module.exports = {
  generateUniversityComparisonInsights,
};
