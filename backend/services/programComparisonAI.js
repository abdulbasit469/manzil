const { grokChatCompletion, getApiKey, getComparisonJsonBudget } = require('./grokClient');

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
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

const PROGRAM_AI_FALLBACK = {
  careerOutlook:
    'Career options follow this discipline in Pakistan. Confirm placements and accreditation with the department.',
  salaryRange: 'Roughly Rs. 35,000–90,000/month for new graduates, depending on city, role, and employer.',
  industryLinkages:
    'Private firms, public-sector units, and professional employers typical for this field in Pakistan.',
  admissionDifficulty: 'Moderate to competitive; depends on intake year and number of seats.',
  programStrengths: 'Structured programme in this field; compare syllabus and faculty on the official page.',
  eligibilityHint:
    'Typically intermediate (FA/FSc or equivalent) with marks per university policy; verify on the admissions page.',
  closingMeritGuidance:
    'Closing merit changes each year; check the university admissions page for the latest merit lists.',
};

function toPosInt(v) {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n);
}

/**
 * Merge LLM output with guaranteed non-empty strings for comparison UI.
 * @param {Array<object>} programs - Same shape as generateProgramComparisonInsights input.
 * @param {Map<string, object>|null|undefined} llmMap - Parsed LLM rows keyed by id, or null if LLM failed.
 * @returns {Map<string, object>}
 */
function mergeProgramComparisonInsights(programs, llmMap) {
  const out = new Map();
  for (const prog of programs) {
    const id = String(prog.id);
    const llm = llmMap?.get(id);
    const row = {
      careerOutlook: clean(llm?.careerOutlook),
      salaryRange: clean(llm?.salaryRange),
      industryLinkages: clean(llm?.industryLinkages),
      admissionDifficulty: clean(llm?.admissionDifficulty),
      programStrengths: clean(llm?.programStrengths),
      eligibilityHint: clean(llm?.eligibilityHint),
      feeGuidance: clean(llm?.feeGuidance),
      feeSemesterMinPkr: toPosInt(llm?.feeSemesterMinPkr),
      feeSemesterMaxPkr: toPosInt(llm?.feeSemesterMaxPkr),
      closingMeritGuidance: clean(llm?.closingMeritGuidance),
    };

    const hasElig = String(prog.eligibility || '').trim();
    const hasFee = Number(prog.feePerSemester) > 0;
    const m = prog.meritFromDatabase;
    const hasOfficialMerit = m && (m.closingMerit != null || m.year != null);

    if (!row.careerOutlook) row.careerOutlook = PROGRAM_AI_FALLBACK.careerOutlook;
    if (!row.salaryRange) row.salaryRange = PROGRAM_AI_FALLBACK.salaryRange;
    if (!row.industryLinkages) row.industryLinkages = PROGRAM_AI_FALLBACK.industryLinkages;
    if (!row.admissionDifficulty) row.admissionDifficulty = PROGRAM_AI_FALLBACK.admissionDifficulty;
    if (!row.programStrengths) row.programStrengths = PROGRAM_AI_FALLBACK.programStrengths;
    if (!hasElig && !row.eligibilityHint) row.eligibilityHint = PROGRAM_AI_FALLBACK.eligibilityHint;
    if (!hasOfficialMerit && !row.closingMeritGuidance) {
      row.closingMeritGuidance = PROGRAM_AI_FALLBACK.closingMeritGuidance;
    }

    const listed = prog.listedSemesterFeeRangePkr;
    if (!hasFee && listed && listed.min > 0 && listed.max >= listed.min) {
      if (!row.feeSemesterMinPkr || !row.feeSemesterMaxPkr) {
        row.feeSemesterMinPkr = Math.round(listed.min);
        row.feeSemesterMaxPkr = Math.round(listed.max);
      }
    }

    if (row.feeSemesterMinPkr && row.feeSemesterMaxPkr && row.feeSemesterMaxPkr < row.feeSemesterMinPkr) {
      const t = row.feeSemesterMinPkr;
      row.feeSemesterMinPkr = row.feeSemesterMaxPkr;
      row.feeSemesterMaxPkr = t;
    }

    out.set(id, row);
  }
  return out;
}

/**
 * Ask Grok to produce concise comparison-friendly insights for degree programs.
 * Returns Map<string, object> keyed by program id.
 */
async function generateProgramComparisonInsights(programs) {
  if (!getApiKey()) {
    console.warn(
      '[ProgramComparisonAI] Skipping LLM (no API key). Set GROQ_API_KEY or XAI_API_KEY in .env next to package.json, then restart the server.'
    );
    if (process.env.GEMINI_API_KEY?.trim()) {
      console.warn(
        '[ProgramComparisonAI] GEMINI_API_KEY is set but unused; use GROQ_API_KEY (gsk_) or XAI_API_KEY (xai-).'
      );
    }
    return null;
  }

  const systemInstruction =
    'You are a strict JSON generator for degree program comparison in Pakistan. Return only valid JSON. No markdown, no asterisks.';

  const budget = getComparisonJsonBudget();

  const prompt = `Task: Generate concise, practical comparison insights for each degree program listed below (Pakistan higher education context, useful for applicants).

Rules:
- Output JSON only. No markdown, no asterisks, no bullet markers, no exclamation marks.
- Schema:
{
  "items": [
    {
      "id": "string",
      "careerOutlook": "2-3 sentences: typical job paths and career outlook for this degree in Pakistan",
      "salaryRange": "estimated starting salary range in PKR per month, e.g. Rs. 40,000 - 80,000",
      "industryLinkages": "key sectors or employer types graduates join, max ~20 words",
      "admissionDifficulty": "Easy | Moderate | Competitive | Highly Competitive",
      "programStrengths": "1 sentence about what this program is known for at this university or in general",
      "eligibilityHint": "if input eligibility is empty: one short line of typical entry requirements for this degree in Pakistan; if input already has eligibility text use empty string",
      "feeSemesterMinPkr": null,
      "feeSemesterMaxPkr": null,
      "closingMeritGuidance": "if input meritFromDatabase is non-null (official year or closingMerit in input), use empty string. Otherwise one short sentence (max ~35 words) on typical competitiveness of last closing merit for this program and university in Pakistan. Do not invent an exact official percentage."
    }
  ]
}
- careerOutlook: job market and career scope; realistic for Pakistan. No invented statistics.
- salaryRange: conservative range for fresh graduates in Pakistan; broad range OK if unknown.
- industryLinkages: real sectors (software houses, banks, hospitals, telecom, public sector, etc.)
- admissionDifficulty: typical competition for this field in Pakistan.
- programStrengths: brief factual statement, no marketing language.
- eligibilityHint must be empty string when the input JSON already has eligibility text.
- Fees (STRICT): When input feePerSemester is greater than 0, set feeSemesterMinPkr and feeSemesterMaxPkr to null. When feePerSemester is 0 or missing:
  * If input listedSemesterFeeRangePkr has min and max, set feeSemesterMinPkr and feeSemesterMaxPkr to those integers exactly (PKR per semester).
  * Otherwise set both fields to positive integers for THIS university only (use university.name, university.city, university.type, degree, category). Output numbers only — do not put fee prose anywhere.
  * feeSemesterMaxPkr must be >= feeSemesterMinPkr.
- closingMeritGuidance must be empty only when meritFromDatabase is non-null (official lastClosingMerit with year or closingMerit in input). When meritFromDatabase is null, you MUST output one non-empty sentence. Never output a fake precise merit number as if it were official.
- Never use asterisks or markdown formatting in any field.

Input programs JSON:
${JSON.stringify(programs).slice(0, budget.programInputChars)}
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
        out.set(String(item.id), {
          careerOutlook: clean(item.careerOutlook),
          salaryRange: clean(item.salaryRange),
          industryLinkages: clean(item.industryLinkages),
          admissionDifficulty: clean(item.admissionDifficulty),
          programStrengths: clean(item.programStrengths),
          eligibilityHint: clean(item.eligibilityHint),
          feeGuidance: clean(item.feeGuidance),
          feeSemesterMinPkr: toPosInt(item.feeSemesterMinPkr),
          feeSemesterMaxPkr: toPosInt(item.feeSemesterMaxPkr),
          closingMeritGuidance: clean(item.closingMeritGuidance),
        });
      }
      return out;
    } catch (err) {
      lastErr = err;
      console.warn('[ProgramComparisonAI] JSON parse failed:', err?.message || err);
    }
  }

  if (lastErr) {
    console.error('[ProgramComparisonAI] Grok failed. Last error:', String(lastErr?.message || lastErr));
  }
  return null;
}

module.exports = { generateProgramComparisonInsights, mergeProgramComparisonInsights };
