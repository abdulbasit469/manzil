/**
 * Merge duplicate University documents: move programs, saved rows, applications, criteria; delete duplicate.
 * Run: node backend/scripts/mergeDuplicateUniversities.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const University = require('../models/University');
const Program = require('../models/Program');
const SavedUniversity = require('../models/SavedUniversity');
const Application = require('../models/Application');
const UniversityCriteria = require('../models/UniversityCriteria');

const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/manzil';

/** Exact names as stored in DB — remove row merges INTO keep row */
const MERGE_PAIRS = [
  { keep: 'AIOU - Allama Iqbal Open University', remove: 'Allama Iqbal Open University (AIOU)' },
  { keep: 'Benazir Bhutto Shaheed University (Lyari)', remove: 'Benazir Bhutto Shaheed University Lyari' },
  { keep: 'Government College University Lahore (GCU)', remove: 'Government College University, Lahore' },
  {
    keep: 'Ghulam Ishaq Khan Institute of Engineering Sciences and Technology (GIKI)',
    remove: 'Ghulam Ishaq Khan Institute of Engineering Sciences & Technology',
  },
  { keep: 'University of Central Punjab (UCP)', remove: 'University of Central Punjab - Lahore Campus (reference)' },
  { keep: 'University of the Punjab', remove: 'University of the Punjab - Quaid-e-Azam Campus (reference)' },
  {
    keep: 'University of Azad Jammu & Kashmir',
    remove: 'University of Azad Jammu & Kashmir - Neelum Campus (reference)',
  },
  {
    keep: 'University of Engineering & Technology, Lahore (UET Lahore)',
    remove: 'University of Engineering & Technology - Kala Shah Kaku Campus (reference)',
  },
  {
    keep: 'University of Karachi',
    remove: 'University of Karachi - Centre for Excellence in Marine Biology (reference)',
  },
  {
    keep: 'University of Karachi',
    remove: 'University of Karachi - Federal Urdu Campus (reference)',
  },
  {
    keep: 'University of Karachi',
    remove: 'University of Karachi - NED University Campus (reference)',
  },
  {
    keep: 'Institute of Business Administration (IBA)',
    remove: 'University of Karachi, Institute of Business Administration (IBA Karachi)',
  },
];

async function dedupeProgramsForUniversity(universityId) {
  const programs = await Program.find({ university: universityId }).lean();
  const seen = new Map();
  const toDelete = [];
  for (const p of programs) {
    const key = `${(p.name || '').trim().toLowerCase()}|${(p.degree || '').trim().toLowerCase()}`;
    if (seen.has(key)) {
      toDelete.push(p._id);
    } else {
      seen.set(key, p._id);
    }
  }
  if (toDelete.length) {
    await Program.deleteMany({ _id: { $in: toDelete } });
    console.log(`  [dedupe] removed ${toDelete.length} duplicate program rows`);
  }
}

async function mergeOne(keepName, removeName) {
  console.log(`[merge] → "${removeName}" into "${keepName}"`);
  const keep = await University.findOne({ name: keepName });
  const remove = await University.findOne({ name: removeName });
  if (!keep) {
    console.log(`[skip] keep not found: ${keepName}`);
    return;
  }
  if (!remove) {
    console.log(`[skip] remove not found: ${removeName}`);
    return;
  }
  if (String(keep._id) === String(remove._id)) return;

  const keepId = keep._id;
  const removeId = remove._id;

  const progRes = await Program.updateMany({ university: removeId }, { $set: { university: keepId } });
  console.log(`  programs moved: ${progRes.modifiedCount}`);

  const savedRows = await SavedUniversity.find({ university: removeId });
  let savedMoved = 0;
  for (const s of savedRows) {
    const exists = await SavedUniversity.findOne({ user: s.user, university: keepId });
    if (exists) {
      await SavedUniversity.deleteOne({ _id: s._id });
    } else {
      await SavedUniversity.updateOne({ _id: s._id }, { $set: { university: keepId } });
      savedMoved += 1;
    }
  }
  console.log(`  saved-university rows: ${savedMoved} moved, ${savedRows.length - savedMoved} dropped (duplicate user)`);

  const appRes = await Application.updateMany({ university: removeId }, { $set: { university: keepId } });
  console.log(`  applications updated: ${appRes.modifiedCount}`);

  const crit = await UniversityCriteria.find({ university: removeId });
  for (const c of crit) {
    const clash = await UniversityCriteria.findOne({ university: keepId, program: c.program });
    if (clash) {
      await UniversityCriteria.deleteOne({ _id: c._id });
    } else {
      await UniversityCriteria.updateOne({ _id: c._id }, { $set: { university: keepId } });
    }
  }

  await dedupeProgramsForUniversity(keepId);

  await University.deleteOne({ _id: removeId });
  console.log(`[merged] "${removeName}" → "${keepName}"`);
}

async function main() {
  await mongoose.connect(uri);
  console.log('[merge] connected');

  for (const { keep, remove } of MERGE_PAIRS) {
    try {
      await mergeOne(keep, remove);
    } catch (e) {
      console.error(`[error] ${keep} / ${remove}:`, e.message);
    }
  }

  console.log('[merge] done');
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
