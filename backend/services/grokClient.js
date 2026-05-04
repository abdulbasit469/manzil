const axios = require('axios');

const XAI_DEFAULT_BASE = 'https://api.x.ai/v1';
const GROQ_DEFAULT_BASE = 'https://api.groq.com/openai/v1';

/** xAI Grok models (console ids). */
const XAI_MODEL_FALLBACK_CHAIN = [
  'grok-3-mini',
  'grok-4-0709',
  'grok-4-1-fast-non-reasoning',
  'grok-4-1-fast-reasoning',
  'grok-4-fast-non-reasoning',
  'grok-4-fast-reasoning',
  'grok-4.20-0309-non-reasoning',
  'grok-4.20-0309-reasoning',
  'grok-4.20-multi-agent-0309',
  'grok-4.3',
  'grok-code-fast-1',
];

/** Groq Cloud — use current production IDs (see https://console.groq.com/docs/deprecations). */
const GROQ_MODEL_FALLBACK_CHAIN = [
  'llama-3.1-8b-instant',
  'llama-3.3-70b-versatile',
  'openai/gpt-oss-120b',
  'meta-llama/llama-4-scout-17b-16e-instruct',
  'qwen/qwen3-32b',
];

function isGroqKey(k) {
  return String(k || '').trim().startsWith('gsk_');
}

/** Groq first if set, else xAI / legacy name. */
function getApiKey() {
  return (
    process.env.GROQ_API_KEY ||
    process.env.XAI_API_KEY ||
    process.env.GROK_API_KEY ||
    ''
  ).trim();
}

function maskApiKeyForLog(key) {
  const k = String(key || '').trim();
  if (!k) return 'empty';
  const head = k.slice(0, 6);
  const tail = k.slice(-4);
  return `${head}...${tail} (len:${k.length})`;
}

function getApiBase(apiKey) {
  if (isGroqKey(apiKey)) {
    return (process.env.GROQ_API_BASE || GROQ_DEFAULT_BASE).replace(/\/$/, '');
  }
  return (process.env.XAI_API_BASE || XAI_DEFAULT_BASE).replace(/\/$/, '');
}

function providerLabel(apiKey) {
  return isGroqKey(apiKey) ? 'Groq' : 'xAI';
}

/**
 * Groq free/on-demand tiers enforce low TPM; large prompts + high max_completion_tokens fail with "Request too large".
 * xAI can use larger JSON payloads and outputs.
 */
function getComparisonJsonBudget() {
  if (isGroqKey(getApiKey())) {
    const maxOut = parseInt(process.env.GROQ_JSON_MAX_TOKENS || '4096', 10) || 4096;
    return {
      maxOutputTokens: Math.min(Math.max(maxOut, 512), 8192),
      programInputChars: parseInt(process.env.GROQ_PROGRAM_INPUT_CHARS || '9000', 10) || 9000,
      universityInputChars: parseInt(process.env.GROQ_UNIVERSITY_INPUT_CHARS || '11000', 10) || 11000,
    };
  }
  return {
    maxOutputTokens: parseInt(process.env.GROK_JSON_MAX_TOKENS || '32000', 10) || 32000,
    programInputChars: 14000,
    universityInputChars: 18000,
  };
}

/**
 * Model chain: env list overrides defaults. Optional preferred model first.
 */
function getModelsToTry() {
  const key = getApiKey();
  const isGroq = isGroqKey(key);

  const rawList = isGroq ? process.env.GROQ_MODEL_LIST : process.env.GROK_MODEL_LIST;
  const defaultChain = isGroq ? GROQ_MODEL_FALLBACK_CHAIN : XAI_MODEL_FALLBACK_CHAIN;
  const chain = rawList
    ? rawList
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [...defaultChain];

  const preferred = String(
    isGroq
      ? process.env.GROQ_MODEL || process.env.GROK_MODEL || ''
      : process.env.GROK_MODEL || process.env.XAI_MODEL || ''
  ).trim();

  const out = [];
  const seen = new Set();
  const push = (m) => {
    const id = String(m || '').trim();
    if (!id || seen.has(id)) return;
    seen.add(id);
    out.push(id);
  };

  if (preferred) push(preferred);
  for (const m of chain) push(m);
  return out;
}

/** Do not rotate models — fix account / key instead. */
function isAbortAllModelsError(errorDetail) {
  const s = String(errorDetail || '').toLowerCase();
  if (s.includes('incorrect api key') || s.includes('invalid api key')) return true;
  if (s.includes('invalid_request_error') && s.includes('api key')) return true;
  if (
    s.includes('credits or licenses') ||
    s.includes("doesn't have any credits") ||
    s.includes('does not have any credits') ||
    s.includes('no credits')
  ) {
    return true;
  }
  if (s.includes('does not have permission to execute')) return true;
  if (s.includes('purchase those on')) return true;
  if (s.includes('insufficient_quota') || s.includes('billing_hard_limit')) return true;
  return false;
}

function extractAssistantText(message) {
  if (!message) return '';
  const c = message.content;
  if (typeof c === 'string' && c.trim()) return c.trim();
  if (Array.isArray(c)) {
    const parts = [];
    for (const part of c) {
      if (typeof part === 'string') parts.push(part);
      else if (part?.type === 'text' && typeof part.text === 'string') parts.push(part.text);
      else if (typeof part?.text === 'string') parts.push(part.text);
    }
    const joined = parts.join('').trim();
    if (joined) return joined;
  }
  const rc = message.reasoning_content;
  if (typeof rc === 'string' && rc.trim()) return rc.trim();
  return '';
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Single chat/completions request (xAI or Groq).
 * @param {object} opts
 * @param {string} opts.model
 */
async function grokChatCompletionOnce({ model, messages, temperature = 0.2, maxCompletionTokens }) {
  const apiKey = getApiKey();
  if (!apiKey) {
    return { text: null, error: 'no_api_key' };
  }

  const base = getApiBase(apiKey);
  const tag = providerLabel(apiKey);

  const body = {
    model,
    messages,
    temperature,
  };
  if (maxCompletionTokens != null && Number.isFinite(maxCompletionTokens) && maxCompletionTokens > 0) {
    body.max_completion_tokens = maxCompletionTokens;
  }

  try {
    const res = await axios.post(`${base}/chat/completions`, body, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      timeout: 120000,
    });

    const message = res.data?.choices?.[0]?.message;
    const textOut = extractAssistantText(message);
    if (textOut) {
      return { text: textOut, error: null, model };
    }
    const usage = res.data?.usage;
    console.warn(
      '[%s] empty assistant text (model=%s). finish_reason=%s usage=%s raw=%s',
      tag,
      model,
      res.data?.choices?.[0]?.finish_reason,
      usage ? JSON.stringify(usage) : 'n/a',
      JSON.stringify(res.data || {}).slice(0, 800)
    );
    return { text: null, error: 'empty_response', model };
  } catch (err) {
    const detail = err.response?.data
      ? JSON.stringify(err.response.data)
      : err.message;
    return { text: null, error: detail, model, status: err.response?.status };
  }
}

/**
 * Tries preferred model (if any), then provider-specific fallback chain.
 * @returns {Promise<{ text: string | null, error: string | null, model?: string }>}
 */
async function grokChatCompletion({ messages, temperature = 0.2, maxCompletionTokens }) {
  const apiKey = getApiKey();
  if (!apiKey) {
    return { text: null, error: 'no_api_key' };
  }

  const tag = providerLabel(apiKey);
  const models = getModelsToTry();
  let lastErr = null;

  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    const result = await grokChatCompletionOnce({
      model,
      messages,
      temperature,
      maxCompletionTokens,
    });

    if (result.text) {
      if (i > 0) {
        console.log(`[${tag}] OK with model ${model} (tried ${i + 1}/${models.length})`);
      }
      return { text: result.text, error: null, model };
    }

    lastErr = result.error;
    const errStr = String(lastErr || '');

    if (isAbortAllModelsError(errStr)) {
      console.warn(`[${tag}] stopping model fallbacks (key/billing/permission):`, errStr.slice(0, 400));
      return { text: null, error: lastErr };
    }

    console.warn(`[${tag}] model ${model} failed → next. ${errStr.slice(0, 220)}`);

    if (/429|rate|too many requests/i.test(errStr) && i < models.length - 1) {
      await sleep(2500);
    }
  }

  if (lastErr) {
    console.warn(`[${tag}] all models exhausted. Last error:`, String(lastErr).slice(0, 500));
  }
  return { text: null, error: lastErr };
}

function isGrokConfigured() {
  return Boolean(getApiKey());
}

module.exports = {
  grokChatCompletion,
  grokChatCompletionOnce,
  getApiKey,
  getModelsToTry,
  getApiBase,
  getComparisonJsonBudget,
  providerLabel,
  maskApiKeyForLog,
  isGrokConfigured,
  isGroqKey,
  MODEL_FALLBACK_CHAIN: XAI_MODEL_FALLBACK_CHAIN,
  GROQ_MODEL_FALLBACK_CHAIN,
};
