/**
 * DB cleanup:
 * 1) Delete universities whose name contains "(Not specified)" OR city is exactly "Not specified"
 *    OR city is exactly "Unknown" (case-insensitive) + related programs, criteria, applications, saves.
 * 2) Rename universities: strip " (reference)" / "(reference)" segments (case-insensitive), collapse spaces, trim.
 *
 * Dry-run (default): logs only, no writes.
 * Apply: node backend/scripts/cleanupUniversitiesNotSpecifiedAndReference.js --apply
 *
 * Optional ranked deletes (1-based index after sort by name): ONLY if you know what you are doing.
 *   node backend/scripts/cleanupUniversitiesNotSpecifiedAndReference.js --apply --delete-ranks=4,5,6,7,8
 *
 * Print full list with ranks (dry-run safe; no writes):
 *   node backend/scripts/cleanupUniversitiesNotSpecifiedAndReference.js --print-sorted-index
 */
require('dotenv').config();
const mongoose = require('mongoose');
const University = require('../models/University');
const Program = require('../models/Program');
const SavedUniversity = require('../models/SavedUniversity');
const Application = require('../models/Application');
const UniversityCriteria = require('../models/UniversityCriteria');

const NOT_SPECIFIED_RE = /\(not specified\)/i;
const REFERENCE_SEGMENT_RE = /\s*\(reference\)\s*/gi;

function parseArgs(argv) {
  const apply = argv.includes('--apply');
  const printSortedIndex = argv.includes('--print-sorted-index');
  let deleteRanks = null;
  const dr = argv.find((a) => a.startsWith('--delete-ranks='));
  if (dr) {
    deleteRanks = dr
      .slice('--delete-ranks='.length)
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => Number.isFinite(n) && n >= 1);
  }
  return { apply, deleteRanks, printSortedIndex };
}

function stripReferenceFromName(name) {
  const cleaned = name.replace(REFERENCE_SEGMENT_RE, ' ').replace(/\s+/g, ' ').trim();
  return cleaned;
}

async function deleteUniversityCascade(universityId, logPrefix) {
  const programs = await Program.find({ university: universityId }).select('_id').lean();
  const programIds = programs.map((p) => p._id);

  const appFilter =
    programIds.length > 0
      ? { $or: [{ university: universityId }, { program: { $in: programIds } }] }
      : { university: universityId };

  const [appRes, critRes] = await Promise.all([
    Application.deleteMany(appFilter),
    UniversityCriteria.deleteMany({
      $or: [{ university: universityId }, ...(programIds.length ? [{ program: { $in: programIds } }] : [])],
    }),
  ]);

  const [progRes, saveRes] = await Promise.all([
    Program.deleteMany({ university: universityId }),
    SavedUniversity.deleteMany({ university: universityId }),
  ]);

  await University.deleteOne({ _id: universityId });
  console.log(
    logPrefix,
    `deleted university; programs=${progRes.deletedCount} saves=${saveRes.deletedCount} apps=${appRes.deletedCount} criteria=${critRes.deletedCount}`
  );
}

async function main() {
  const { apply, deleteRanks, printSortedIndex } = parseArgs(process.argv.slice(2));
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/manzil';
  await mongoose.connect(uri);
  console.log('[cleanup] connected', uri.replace(/\/\/.*@/, '//***@'));
  console.log('[cleanup] mode:', apply ? 'APPLY (writes)' : 'DRY-RUN (no writes)');

  const all = await University.find({}).select('_id name city').lean();
  console.log('[cleanup] total universities in DB:', all.length);

  const notSpecifiedName = all.filter((u) => NOT_SPECIFIED_RE.test(u.name));
  const notSpecifiedCity = all.filter((u) => /^not specified$/i.test(String(u.city || '').trim()));
  const seenDelete = new Set();
  const notSpecified = [];
  for (const u of notSpecifiedName) {
    const k = String(u._id);
    if (!seenDelete.has(k)) {
      seenDelete.add(k);
      notSpecified.push(u);
    }
  }
  for (const u of notSpecifiedCity) {
    const k = String(u._id);
    if (!seenDelete.has(k)) {
      seenDelete.add(k);
      notSpecified.push(u);
    }
  }

  const unknownCity = all.filter((u) => /^unknown$/i.test(String(u.city || '').trim()));
  for (const u of unknownCity) {
    const k = String(u._id);
    if (!seenDelete.has(k)) {
      seenDelete.add(k);
      notSpecified.push(u);
    }
  }

  console.log(
    '[cleanup] delete targets (name "(Not specified)" OR city Not specified OR city Unknown):',
    notSpecified.length
  );
  for (const u of notSpecified) {
    console.log('  -', u._id, u.name, '| city:', JSON.stringify(u.city));
    if (apply) {
      await deleteUniversityCascade(u._id, '[delete-placeholder-city-or-name]');
    }
  }

  const referenceInName = all.filter((u) => /\(reference\)/i.test(u.name));
  console.log('[cleanup] names containing "(reference)":', referenceInName.length);
  for (const u of referenceInName) {
    const next = stripReferenceFromName(u.name);
    if (next === u.name) continue;
    console.log('  rename:', JSON.stringify(u.name), '→', JSON.stringify(next));
    if (apply) {
      try {
        await University.updateOne({ _id: u._id }, { $set: { name: next } });
        console.log('  [ok]', u._id);
      } catch (e) {
        if (e && e.code === 11000) {
          console.warn('  [skip duplicate name]', u._id, next);
        } else {
          throw e;
        }
      }
    }
  }

  if (printSortedIndex) {
    const sorted = [...all].sort((a, b) => a.name.localeCompare(b.name));
    console.log('[cleanup] universities sorted by name (rank → name):');
    sorted.forEach((u, idx) => console.log(`  ${idx + 1}\t${u.name}`));
  }

  if (deleteRanks && deleteRanks.length) {
    const sorted = [...all].sort((a, b) => a.name.localeCompare(b.name));
    const toDeleteByRank = new Set(deleteRanks);
    console.log('[cleanup] --delete-ranks requested:', [...toDeleteByRank].sort((a, b) => a - b));
    sorted.forEach((u, idx) => {
      const rank = idx + 1;
      if (!toDeleteByRank.has(rank)) return;
      console.log(`  rank ${rank}:`, u._id, u.name);
    });
    if (apply) {
      for (let idx = 0; idx < sorted.length; idx++) {
        const rank = idx + 1;
        if (!toDeleteByRank.has(rank)) continue;
        const u = sorted[idx];
        await deleteUniversityCascade(u._id, `[delete-rank-${rank}]`);
      }
    }
  } else {
    console.log(
      '[cleanup] Skipping rank-based deletes (none). If you meant "rows 4–8" in a list, re-run with e.g. --delete-ranks=4,5,6,7,8 after verifying the sorted-by-name order printed above.'
    );
  }

  await mongoose.disconnect();
  console.log('[cleanup] done');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
