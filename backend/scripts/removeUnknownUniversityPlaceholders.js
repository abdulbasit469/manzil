/**
 * One-off: remove "Unknown" placeholder text from university name/city/address in MongoDB.
 * Run from project root: node backend/scripts/removeUnknownUniversityPlaceholders.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const University = require('../models/University');
const {
  stripUnknownPlaceholder,
  stripUnknownFromAddress,
} = require('../utils/sanitizeUniversityStrings');

function nameFromWebsite(url) {
  if (!url || typeof url !== 'string') return null;
  try {
    const u = new URL(url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`);
    const host = u.hostname.replace(/^www\./i, '');
    const part = host.split('.').filter(Boolean)[0];
    if (!part || part.length < 2) return null;
    const pretty = part.replace(/[-_]/g, ' ');
    return pretty.charAt(0).toUpperCase() + pretty.slice(1).toLowerCase() + ' (verify name)';
  } catch {
    return null;
  }
}

async function main() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/manzil';
  await mongoose.connect(uri);
  console.log('[removeUnknown] connected');

  const all = await University.find({}).lean();
  let updated = 0;
  let unchanged = 0;

  for (const u of all) {
    const $set = {};

    if (typeof u.name === 'string') {
      const n = stripUnknownPlaceholder(u.name);
      if (n !== u.name) {
        if (n === '') {
          const guess = nameFromWebsite(u.website);
          $set.name = guess || `University ${String(u._id).slice(-6)} (rename in admin)`;
          console.log('[removeUnknown] name was only "Unknown" →', $set.name, 'id=', u._id);
        } else {
          $set.name = n;
        }
      }
    }

    if (typeof u.city === 'string') {
      const c = stripUnknownPlaceholder(u.city);
      if (c !== u.city) {
        $set.city = c === '' ? 'Not specified' : c;
      }
    }

    if (typeof u.address === 'string') {
      const a = stripUnknownFromAddress(u.address);
      if (a !== u.address) {
        $set.address = a;
      }
    }

    if (Object.keys($set).length === 0) {
      unchanged++;
      continue;
    }

    try {
      await University.updateOne({ _id: u._id }, { $set });
      updated++;
      console.log('[removeUnknown] updated', u._id, JSON.stringify($set));
    } catch (e) {
      console.error('[removeUnknown] FAILED', u._id, e.message);
    }
  }

  console.log('[removeUnknown] done. updated:', updated, 'unchanged:', unchanged);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
