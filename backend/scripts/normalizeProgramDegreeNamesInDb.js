/**
 * One-off migration: collapse duplicate degree tokens (e.g. "BA BA") and strip redundant degree prefixes from program names.
 *
 * Usage (from repo root, same folder as package.json):
 *   node backend/scripts/normalizeProgramDegreeNamesInDb.js
 *   node backend/scripts/normalizeProgramDegreeNamesInDb.js --dry-run
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Program = require('../models/Program');
const { normalizeProgramFieldsForApi } = require('../utils/programDisplayNormalize');

const dryRun = process.argv.includes('--dry-run');

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI missing in .env');
    process.exit(1);
  }
  await mongoose.connect(uri);
  const cursor = Program.find({}).cursor();
  let scanned = 0;
  let updated = 0;
  for await (const doc of cursor) {
    scanned++;
    const beforeD = String(doc.degree || '');
    const beforeN = String(doc.name || '');
    const { degree, name } = normalizeProgramFieldsForApi(beforeD, beforeN);
    if (degree === beforeD && name === beforeN) continue;
    updated++;
    console.log(`[${dryRun ? 'dry' : 'apply'}] ${doc._id} degree: "${beforeD}" -> "${degree}" | name: "${beforeN}" -> "${name}"`);
    if (!dryRun) {
      await Program.updateOne({ _id: doc._id }, { $set: { degree, name } });
    }
  }
  await mongoose.disconnect();
  console.log(`Done. scanned=${scanned} wouldUpdate=${updated} dryRun=${dryRun}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
