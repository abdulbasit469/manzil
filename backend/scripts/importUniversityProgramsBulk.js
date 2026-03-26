/**
 * Import programs from backend/data/universityProgramsBulk.js into MongoDB.
 * Skips duplicate (same university + program name + degree). Uses insertMany for speed.
 *
 * Run: node backend/scripts/importUniversityProgramsBulk.js
 *      node backend/scripts/importUniversityProgramsBulk.js --dry-run
 */
require('dotenv').config();
const path = require('path');
const mongoose = require('mongoose');
const University = require('../models/University');
const Program = require('../models/Program');
const {
  mapGroupToCategory,
  inferDegree,
  splitProgramList,
} = require('./lib/programImportHelpers');

const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/manzil';

const dryRun = process.argv.includes('--dry-run');

function normKey(name, degree) {
  return `${(name || '').trim().toLowerCase()}|${(degree || '').trim().toLowerCase()}`;
}

function findUniversityFromCache(allUniversities, matchNames) {
  const names = Array.isArray(matchNames) ? matchNames : [matchNames];
  for (const n of names) {
    const t = n.trim();
    const exact = allUniversities.find((u) => u.name === t);
    if (exact) return exact;
  }
  const first = names[0].trim();
  const esc = first.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  let u = allUniversities.find((x) => new RegExp(`^${esc}`, 'i').test(x.name));
  if (u) return u;
  const words = first.split(/\s+/).filter((w) => w.length > 3).slice(0, 4);
  if (words.length) {
    const re = new RegExp(words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*'), 'i');
    u = allUniversities.find((x) => re.test(x.name));
  }
  return u || null;
}

async function run() {
  const dataPath = path.join(__dirname, '..', 'data', 'universityProgramsBulk.js');
  let bulk;
  try {
    bulk = require(dataPath);
  } catch (e) {
    console.error('[import] Missing or invalid', dataPath, e.message);
    process.exit(1);
  }
  if (!Array.isArray(bulk)) {
    console.error('[import] universityProgramsBulk.js must export an array');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('[import] connected. entries=', bulk.length, 'dryRun=', dryRun);

  const allUniversities = await University.find().select('name').lean();

  let created = 0;
  let skipped = 0;
  let missingUni = 0;
  const toInsertAll = [];

  for (const entry of bulk) {
    const matchNames = entry.matchNames || entry.m;
    const groups = entry.groups || entry.g;
    if (!matchNames || !groups) {
      console.warn('[import] skip bad entry');
      continue;
    }

    const uni = findUniversityFromCache(allUniversities, matchNames);
    if (!uni) {
      console.warn('[import] university not found for:', matchNames[0]);
      missingUni += 1;
      continue;
    }

    const existingRows = await Program.find({ university: uni._id }).select('name degree').lean();
    const seen = new Set(existingRows.map((r) => normKey(r.name, r.degree)));

    for (const [groupLabel, programStr] of Object.entries(groups)) {
      if (typeof programStr !== 'string') continue;
      const category = mapGroupToCategory(groupLabel);
      const items = splitProgramList(programStr);
      for (const rawName of items) {
        let name = rawName.trim();
        if (!name) continue;
        if (name.length > 220) name = name.slice(0, 220);

        const degree = inferDegree(name);
        const key = normKey(name, degree);
        if (seen.has(key)) {
          skipped += 1;
          continue;
        }
        seen.add(key);

        if (dryRun) {
          console.log(`[dry-run] would add: ${uni.name} | ${groupLabel} | ${name}`);
          created += 1;
          continue;
        }

        toInsertAll.push({
          name,
          degree,
          university: uni._id,
          duration: '4 years',
          feePerSemester: 0,
          category,
          programGroup: groupLabel,
          description: 'Imported listing — verify fees and eligibility on the official website.',
          isActive: true,
        });
        created += 1;
      }
    }
  }

  if (!dryRun && toInsertAll.length) {
    const chunk = 500;
    for (let i = 0; i < toInsertAll.length; i += chunk) {
      const slice = toInsertAll.slice(i, i + chunk);
      await Program.insertMany(slice, { ordered: false });
      console.log(`[import] inserted batch ${i + slice.length}/${toInsertAll.length}`);
    }
  }

  console.log(`[import] done. created=${created} skipped(duplicate)=${skipped} missingUniversity=${missingUni}`);
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error('[import] fatal', e);
  process.exit(1);
});
