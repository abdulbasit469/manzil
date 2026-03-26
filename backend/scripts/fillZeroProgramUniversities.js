/**
 * Universities with 0 programs: try fuzzy match to universityProgramsBulk.js and insert programs.
 * Remaining (optional): one honest placeholder row so the app does not show "0 programs".
 *
 * Run from project root:
 *   node backend/scripts/fillZeroProgramUniversities.js --dry-run
 *   node backend/scripts/fillZeroProgramUniversities.js
 *   node backend/scripts/fillZeroProgramUniversities.js --no-placeholder
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
  findBestBulkEntryForUniversity,
} = require('./lib/programImportHelpers');

const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/manzil';

const dryRun = process.argv.includes('--dry-run');
const noPlaceholder = process.argv.includes('--no-placeholder');
/** Stricter fuzzy threshold (higher = fewer false matches) */
const MIN_FUZZY_SCORE = Number(process.env.FILL_ZERO_MIN_SCORE || 58);

function normKey(name, degree) {
  return `${(name || '').trim().toLowerCase()}|${(degree || '').trim().toLowerCase()}`;
}

async function countPrograms(uniId) {
  return Program.countDocuments({ university: uniId, isActive: { $ne: false } });
}

async function main() {
  const dataPath = path.join(__dirname, '..', 'data', 'universityProgramsBulk.js');
  let bulk;
  try {
    bulk = require(dataPath);
  } catch (e) {
    console.error('[fill-zero] Cannot load', dataPath, e.message);
    process.exit(1);
  }
  if (!Array.isArray(bulk)) {
    console.error('[fill-zero] bulk must be an array');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('[fill-zero] connected. dryRun=', dryRun, 'placeholder=', !noPlaceholder, 'minScore=', MIN_FUZZY_SCORE);

  const allUnis = await University.find({}).select('name').lean();
  const zeroUnis = [];
  for (const u of allUnis) {
    const n = await countPrograms(u._id);
    if (n === 0) zeroUnis.push(u);
  }

  console.log('[fill-zero] universities with 0 programs:', zeroUnis.length);

  let fromBulk = 0;
  let placeholder = 0;
  let skipped = 0;
  const toInsert = [];
  let wouldInsertCount = 0;

  for (const u of zeroUnis) {
    const match = findBestBulkEntryForUniversity(u.name, bulk, MIN_FUZZY_SCORE);

    if (match) {
      const { entry, score } = match;
      const groups = entry.groups || entry.g;
      if (!groups) {
        skipped += 1;
        continue;
      }

      const existingRows = await Program.find({ university: u._id }).select('name degree').lean();
      const seen = new Set(existingRows.map((r) => normKey(r.name, r.degree)));

      let addedForUni = 0;
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
          if (seen.has(key)) continue;
          seen.add(key);
          addedForUni += 1;
          if (dryRun) {
            wouldInsertCount += 1;
          } else {
            toInsert.push({
              name,
              degree,
              university: u._id,
              duration: '4 years',
              feePerSemester: 0,
              category,
              programGroup: groupLabel,
              description: `Imported from bulk match (score ${score}) — verify on official website.`,
              isActive: true,
            });
          }
        }
      }

      if (addedForUni > 0) {
        fromBulk += 1;
        console.log(`[fill-zero] ${dryRun ? '[dry-run] ' : ''}bulk match: "${u.name}" → score ${score} (+${addedForUni} programs)`);
      } else {
        skipped += 1;
      }
      continue;
    }

    if (!noPlaceholder) {
      placeholder += 1;
      console.log(`[fill-zero] ${dryRun ? '[dry-run] ' : ''}placeholder: "${u.name}"`);
      if (dryRun) {
        wouldInsertCount += 1;
      } else {
        toInsert.push({
          name: 'Programs — see official website',
          degree: 'Various',
          university: u._id,
          duration: '—',
          feePerSemester: 0,
          category: 'Other',
          programGroup: 'General',
          description:
            'No detailed program list is stored in Manzil for this university yet. Check the official website or admissions office for current undergraduate and graduate offerings.',
          isActive: true,
        });
      }
    } else {
      console.log(`[fill-zero] no match, no placeholder: "${u.name}"`);
    }
  }

  if (!dryRun && toInsert.length) {
    const chunk = 400;
    for (let i = 0; i < toInsert.length; i += chunk) {
      const slice = toInsert.slice(i, i + chunk);
      await Program.insertMany(slice, { ordered: false });
      console.log(`[fill-zero] inserted ${i + slice.length}/${toInsert.length}`);
    }
  }

  const rowMsg = dryRun ? `wouldInsert=${wouldInsertCount}` : `inserted=${toInsert.length}`;
  console.log(
    `[fill-zero] done. unisMatchedBulk=${fromBulk} placeholders=${noPlaceholder ? 0 : placeholder} skipped=${skipped} ${rowMsg}`
  );
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
