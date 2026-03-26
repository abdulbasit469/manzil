/**
 * Enrich University documents with light homepage text for the in-app detail page.
 * Uses meta description + visible text (no JS execution). Many .edu.pk sites work; some may block bots.
 *
 * From project root (where package.json lives):
 *   npm run enrich:universities
 *   node backend/scripts/enrichUniversitiesFromWebsites.js --dry-run --limit=5
 *   node backend/scripts/enrichUniversitiesFromWebsites.js --id=507f1f77bcf86cd799439011
 *   node backend/scripts/enrichUniversitiesFromWebsites.js --id=... --puppeteer-only   # skip axios (403-prone sites)
 *
 * Env: MONGO_URI (same as server)
 * When axios gets 403/401/429 (bot/WAF), falls back to Puppeteer (real Chromium).
 */
require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const https = require('https');
const puppeteer = require('puppeteer');
const mongoose = require('mongoose');
const University = require('../models/University');

/** Many Pakistani university sites use HTTPS with incomplete chains; this agent only runs in this admin script. */
const insecureHttpsAgent = new https.Agent({ rejectUnauthorized: false });

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { dryRun: false, limit: null, id: null, delayMs: 2000, puppeteerOnly: false };
  for (const a of args) {
    if (a === '--dry-run') out.dryRun = true;
    else if (a === '--puppeteer-only') out.puppeteerOnly = true;
    else if (a.startsWith('--limit=')) out.limit = parseInt(a.split('=')[1], 10);
    else if (a.startsWith('--id=')) out.id = a.split('=')[1];
    else if (a.startsWith('--delay=')) out.delayMs = parseInt(a.split('=')[1], 10);
  }
  return out;
}

function normalizeUrl(raw) {
  if (!raw || typeof raw !== 'string') return null;
  let u = raw.trim();
  if (!u) return null;
  if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
  try {
    const parsed = new URL(u);
    return parsed.href;
  } catch {
    return null;
  }
}

function extractFromHtml(html, pageUrl) {
  const $ = cheerio.load(html);

  $('script, style, noscript, svg, iframe').remove();

  const metaDesc =
    $('meta[name="description"]').attr('content') ||
    $('meta[property="og:description"]').attr('content') ||
    '';

  let mainText = '';
  const main = $('main, article, #content, .content, #main-content').first();
  if (main.length) {
    mainText = main.text();
  }
  if (!mainText || mainText.length < 40) {
    mainText = $('body').text();
  }

  mainText = mainText.replace(/\s+/g, ' ').trim();

  let summary = (metaDesc || '').trim();
  if (summary.length < 80 && mainText.length > 0) {
    summary = mainText.slice(0, 1800);
  } else if (mainText.length > 0 && summary.length < 400) {
    summary = `${summary}\n\n${mainText.slice(0, 1200)}`.trim();
  }

  summary = summary.slice(0, 7500);

  const highlights = [];
  const sentences = summary.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
  for (const s of sentences) {
    if (s.length < 25 || s.length > 320) continue;
    highlights.push(s);
    if (highlights.length >= 6) break;
  }

  return { summary: summary || null, highlights, sourceUrl: pageUrl };
}

/** Reused across many rows so we do not launch Chromium per university */
let sharedBrowser = null;

async function getSharedBrowser() {
  if (sharedBrowser && sharedBrowser.isConnected()) return sharedBrowser;
  sharedBrowser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled',
      '--window-size=1920,1080',
    ],
  });
  return sharedBrowser;
}

async function closeSharedBrowser() {
  if (sharedBrowser) {
    try {
      await sharedBrowser.close();
    } catch (_) {}
    sharedBrowser = null;
  }
}

/**
 * Fetch HTML via real Chromium — helps with Cloudflare / WAF / soft bot blocks that return 403 to axios.
 */
async function fetchPageWithPuppeteer(url) {
  const browser = await getSharedBrowser();
  const page = await browser.newPage();
  try {
    await page.setViewport({ width: 1366, height: 768 });
    await page.setUserAgent(UA);
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9,ur;q=0.8',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
    });
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise((r) => setTimeout(r, 2000));
    const html = await page.content();
    return html;
  } finally {
    await page.close().catch(() => {});
  }
}

async function fetchPageAxios(url) {
  const isHttps = /^https:/i.test(url);
  const res = await axios.get(url, {
    timeout: 25000,
    maxRedirects: 5,
    validateStatus: (s) => s >= 200 && s < 400,
    httpsAgent: isHttps ? insecureHttpsAgent : undefined,
    headers: {
      'User-Agent': UA,
      Accept: 'text/html,application/xhtml+xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Upgrade-Insecure-Requests': '1',
    },
  });
  const ct = res.headers['content-type'] || '';
  if (!ct.includes('text/html') && !ct.includes('application/xhtml')) {
    throw new Error(`Unexpected content-type: ${ct}`);
  }
  return typeof res.data === 'string' ? res.data : String(res.data);
}

function shouldRetryWithBrowser(err) {
  const st = err.response?.status;
  if (st === 403 || st === 401 || st === 429) return true;
  const msg = (err.message || '').toLowerCase();
  if (msg.includes('403') || msg.includes('401') || msg.includes('429')) return true;
  return false;
}

/**
 * Try fast axios first; on bot-block style errors use Puppeteer.
 */
async function fetchPage(url, options = {}) {
  const { puppeteerOnly = false } = options;
  if (puppeteerOnly) {
    return fetchPageWithPuppeteer(url);
  }
  try {
    return await fetchPageAxios(url);
  } catch (err) {
    if (!shouldRetryWithBrowser(err)) throw err;
    console.warn('[enrich] axios blocked, retrying with Puppeteer…');
    return fetchPageWithPuppeteer(url);
  }
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  const { dryRun, limit, id, delayMs, puppeteerOnly } = parseArgs();

  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/manzil';
  try {
    await mongoose.connect(uri);
    console.log('[enrich] Connected to MongoDB');

    const query = { website: { $exists: true, $nin: [null, ''] } };
    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        console.error('[enrich] Invalid --id (not a valid ObjectId)');
        process.exit(1);
      }
      query._id = new mongoose.Types.ObjectId(id);
    }

    let cursor = University.find(query).select('name website scrapedAt').sort({ name: 1 });
    if (limit && Number.isFinite(limit)) cursor = cursor.limit(limit);
    const list = await cursor.lean();

    console.log(
      `[enrich] Processing ${list.length} universities (dryRun=${dryRun}, puppeteerOnly=${puppeteerOnly})`
    );

    let ok = 0;
    let fail = 0;

    for (let i = 0; i < list.length; i++) {
      const uni = list[i];
      const url = normalizeUrl(uni.website);
      if (!url) {
        console.warn(`[enrich] SKIP (bad URL) ${uni.name}: ${uni.website}`);
        fail += 1;
        continue;
      }

      process.stdout.write(`[enrich] (${i + 1}/${list.length}) ${uni.name} … `);

      try {
        const html = await fetchPage(url, { puppeteerOnly });
        const { summary, highlights, sourceUrl } = extractFromHtml(html, url);
        if (!summary) {
          console.log('no text extracted');
          fail += 1;
        } else if (dryRun) {
          console.log(`OK dry-run, ${summary.length} chars, ${highlights.length} highlights`);
          ok += 1;
        } else {
          await University.updateOne(
            { _id: uni._id },
            {
              $set: {
                scrapedSummary: summary,
                scrapedHighlights: highlights,
                scrapedAt: new Date(),
                scrapedSourceUrl: sourceUrl,
              },
            }
          );
          console.log(`saved (${summary.length} chars)`);
          ok += 1;
        }
      } catch (e) {
        console.log(`FAIL: ${e.message}`);
        fail += 1;
      }

      if (i < list.length - 1) await sleep(delayMs);
    }

    console.log(`[enrich] Done. OK=${ok} FAIL=${fail}`);
  } finally {
    await closeSharedBrowser();
    await mongoose.disconnect();
  }
}

run().catch(async (e) => {
  console.error('[enrich] Fatal:', e);
  await closeSharedBrowser();
  process.exit(1);
});
