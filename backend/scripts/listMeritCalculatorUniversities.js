/**
 * Lists universities returned by the same filters as the merit calculator dropdown.
 * Run: node backend/scripts/listMeritCalculatorUniversities.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const University = require('../models/University');

async function main() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/manzil';
  await mongoose.connect(uri);

  const query = {
    $and: [
      { name: { $not: /\(\s*not specified\s*\)/i } },
      { city: { $not: /^not specified$/i } },
      { city: { $not: /^unknown$/i } },
    ],
  };

  const raw = await University.find(query).select('name city').sort({ name: 1 }).limit(5000).lean();

  const filtered = raw.filter(
    (u) =>
      u &&
      u.name &&
      !/\(\s*not specified\s*\)/i.test(u.name) &&
      !/^not specified$/i.test(String(u.city || '').trim()) &&
      !/^unknown$/i.test(String(u.city || '').trim())
  );

  filtered.forEach((u, i) => {
    const city = (u.city || '').trim();
    console.log(`${i + 1}. ${u.name}${city ? ` — ${city}` : ''}`);
  });
  console.log('\n---');
  console.log('Total:', filtered.length);

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
