/**
 * One-off: remove universities + fix website URLs per executor instructions.
 * Run: node backend/scripts/executorUniversityCleanup.js
 */
require('dotenv').config();
const { execSync } = require('child_process');
const path = require('path');
const mongoose = require('mongoose');
const University = require('../models/University');
const Program = require('../models/Program');
const SavedUniversity = require('../models/SavedUniversity');

const TO_DELETE = [
  'Qurtaba University of Science & Information Technology',
  'University of Agriculture, Faisalabad (UAF)',
  'University of Jhang',
  'University of Kohat',
  'University of Lahore - City Campus (reference)',
  'University of Lahore - Sargodha Campus (reference)',
  'University of Veterinary and Animal Sciences - Lahore (reference duplicate)',
];

/** [name, website] — clears scraped fields so next targeted enrich refetches */
const TO_UPDATE = [
  ['Fatima Jinnah Medical University, Lahore', 'https://www.fjmu.edu.pk/'],
  ['Forman Christian College', 'https://www.fccollege.edu.pk/'],
  ['Institute of Management Sciences (IMSciences)', 'https://imsciences.edu.pk/'],
  ['Iqra National University', 'https://iqra.edu.pk/'],
  ['National University of Sciences & Technology (NUST)', 'https://nust.edu.pk/'],
  ['Pakistan Institute of Development Economics (PIDE)', 'https://pide.org.pk/'],
  ['Shaheed Benazir Bhutto Women University (Peshawar)', 'https://sbbwu.edu.pk/sbbwu/'],
  ['University of Balochistan', 'https://www.uob.ac.pk/index.php'],
  ['University of Lahore (UOL)', 'https://uol.edu.pk/'],
  ['University of Peshawar', 'http://uop.edu.pk/'],
  ['Ziauddin University', 'https://zu.edu.pk/'],
  ['Ibrahim Medical College (reference)', 'https://imc.ac.bd/'],
  ['Nipas (placeholder entry)', 'https://nipakarachi.gov.pk/'],
  [
    'Quaid-i-Azam University - Medical College (reference)',
    'https://pmdc.org.pk/quaid-e-azam-university-medical-sciences-islamabad/',
  ],
  ['Shaheed Benazir Bhutto University (Sheringal)', 'https://sbbu.edu.pk/'],
  ['Shaheed Zulfiqar Ali Bhutto Medical University', 'https://www.szabmu.edu.pk/'],
  ['University of Central Punjab - Lahore Campus (reference)', 'https://ucp.edu.pk/'],
  ['University of Chakwal', 'https://www.uoc.edu.pk/'],
  ['University of Engineering & Technology - Kala Shah Kaku Campus (reference)', 'https://newcampus.uet.edu.pk/'],
  ['University of Gwadar', 'https://ug.edu.pk/'],
  ['University of Karachi, Institute of Business Administration (IBA Karachi)', 'https://iba.edu.pk/'],
  ['University of Sahiwal', 'https://uosahiwal.edu.pk/'],
  ['University of Turbat', 'https://uot.edu.pk/'],
  ['University of Veterinary & Animal Sciences, RYK Campus', 'https://www.uvas.edu.pk/'],
];

async function deleteByName(name) {
  const u = await University.findOne({ name });
  if (!u) {
    console.warn('[delete] NOT_FOUND', name);
    return;
  }
  const id = u._id;
  const [p, s] = await Promise.all([
    Program.deleteMany({ university: id }),
    SavedUniversity.deleteMany({ university: id }),
  ]);
  await University.deleteOne({ _id: id });
  console.log('[delete]', name, `programs=${p.deletedCount} saved=${s.deletedCount}`);
}

async function updateByName(name, website) {
  const res = await University.updateOne(
    { name },
    {
      $set: { website: website.trim() },
      $unset: { scrapedSummary: '', scrapedHighlights: '', scrapedAt: '', scrapedSourceUrl: '' },
    }
  );
  if (res.matchedCount === 0) {
    console.warn('[update] NOT_FOUND', name);
    return null;
  }
  const doc = await University.findOne({ name }).select('_id name website').lean();
  console.log('[update]', name, '→', website.trim());
  return doc ? String(doc._id) : null;
}

async function main() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/manzil';
  await mongoose.connect(uri);
  console.log('[executor] connected');

  for (const name of TO_DELETE) {
    await deleteByName(name);
  }

  const idsToEnrich = [];
  for (const [name, url] of TO_UPDATE) {
    const id = await updateByName(name, url);
    if (id) idsToEnrich.push(id);
  }

  console.log('[executor] total enrich targets:', idsToEnrich.length);

  await mongoose.disconnect();

  const enrichScript = path.join(__dirname, 'enrichUniversitiesFromWebsites.js');
  const rootDir = path.join(__dirname, '..', '..');
  for (const id of idsToEnrich) {
    console.log('\n========== targeted enrich:', id, '==========');
    try {
      execSync(`node "${enrichScript}" --id=${id}`, { stdio: 'inherit', cwd: rootDir });
    } catch (e) {
      console.warn('[enrich] failed for', id);
    }
  }
  console.log('\n[executor] done');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
