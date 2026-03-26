/**
 * One-off: set indicative PKR fee ranges from Manzil reference tables (screenshots).
 * Matches University by canonical name or regex hints; only updates fee* fields.
 *
 * Run from project root: node backend/scripts/seedIndicativeUniversityFees.js
 */
require('dotenv').config();
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const mongoose = require('mongoose');
const University = require('../models/University');

const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/manzil';

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * @param {string[]} exactNames - try exact match first (order matters)
 * @param {RegExp} [fallbackRegex] - single document expected
 */
async function findUniversity(exactNames, fallbackRegex) {
  for (const n of exactNames) {
    const u = await University.findOne({ name: n });
    if (u) return u;
  }
  for (const n of exactNames) {
    const u = await University.findOne({ name: new RegExp(`^${escapeRegex(n)}$`, 'i') });
    if (u) return u;
  }
  if (fallbackRegex) {
    const list = await University.find({ name: fallbackRegex }).limit(5).lean();
    if (list.length === 1) return University.findById(list[0]._id);
    if (list.length > 1) {
      list.sort((a, b) => a.name.length - b.name.length);
      return University.findById(list[0]._id);
    }
  }
  return null;
}

/** @type {{ label: string; exactNames: string[]; fallbackRegex?: RegExp; set: Record<string, string> }[]} */
const ROWS = [
  {
    label: 'NUST',
    exactNames: ['National University of Sciences & Technology (NUST)'],
    fallbackRegex: /NUST/i,
    set: {
      feeComputingEngSemester: 'Rs. 197,050',
      feeBusinessSocialSemester: 'Rs. 275,400',
    },
  },
  {
    label: 'FAST-NUCES',
    exactNames: [
      'FAST National University of Computer and Emerging Sciences (FAST-NU)',
      'FAST-NUCES',
    ],
    fallbackRegex: /FAST.*Emerging Sciences|FAST-NUCES/i,
    set: {
      feeComputingEngSemester: 'Rs. 185,000 – 210,000',
      feeBusinessSocialSemester: 'Rs. 160,000 – 190,000',
    },
  },
  {
    label: 'GIKI',
    exactNames: ['Ghulam Ishaq Khan Institute of Engineering Sciences and Technology (GIKI)'],
    fallbackRegex: /GIKI/i,
    set: {
      feeComputingEngSemester: 'Rs. 450,000 – 520,000',
      feeBusinessSocialSemester: 'Rs. 400,000 – 480,000',
    },
  },
  {
    label: 'ITU Lahore',
    exactNames: ['Information Technology University', 'Information Technology University (ITU)'],
    fallbackRegex: /Information Technology University/i,
    set: {
      feeComputingEngSemester: 'Rs. 110,000 – 140,000',
      feeBusinessSocialSemester: 'Rs. 95,000 – 120,000',
    },
  },
  {
    label: 'PIEAS',
    exactNames: ['Pakistan Institute of Engineering & Applied Sciences (PIEAS)'],
    fallbackRegex: /PIEAS/i,
    set: {
      feeComputingEngSemester: 'Rs. 75,000 – 95,000',
      feeBusinessSocialSemester: '',
    },
  },
  {
    label: 'LUMS',
    exactNames: ['Lahore University of Management Sciences (LUMS)'],
    fallbackRegex: /Lahore University of Management Sciences/i,
    set: {
      feeBsTypicalSemester: 'Rs. 650,000 – 720,000',
      feeMbbsPerYear: '',
    },
  },
  {
    label: 'IBA Karachi',
    exactNames: ['Institute of Business Administration (IBA)'],
    fallbackRegex: /^Institute of Business Administration/i,
    set: {
      feeBsTypicalSemester: 'Rs. 380,000 – 460,000',
      feeMbbsPerYear: '',
    },
  },
  {
    label: 'Aga Khan University',
    exactNames: ['Aga Khan University'],
    fallbackRegex: /Aga Khan University/i,
    set: {
      feeBsTypicalSemester: 'Rs. 400,000+ (Nursing; per semester)',
      feeMbbsPerYear: 'Rs. 1,760,000 – 2,100,000',
    },
  },
  {
    label: 'LSE Lahore',
    exactNames: ['Lahore School of Economics (LSE)', 'Lahore School of Economics'],
    fallbackRegex: /Lahore School of Economics/i,
    set: {
      feeBsTypicalSemester: 'Rs. 280,000 – 350,000',
      feeMbbsPerYear: '',
    },
  },
  {
    label: 'University of the Punjab',
    exactNames: ['University of the Punjab'],
    fallbackRegex: /^University of the Punjab$/i,
    set: {
      feePublicRegularSemester: 'Rs. 25,000 – 40,000',
      feePublicSelfFinanceSemester: 'Rs. 65,000 – 90,000',
    },
  },
  {
    label: 'University of Karachi',
    exactNames: ['University of Karachi'],
    fallbackRegex: /^University of Karachi$/i,
    set: {
      feePublicRegularSemester: 'Rs. 22,000 – 45,000',
      feePublicSelfFinanceSemester: 'Rs. 60,000 – 85,000',
    },
  },
  {
    label: 'University of Peshawar',
    exactNames: ['University of Peshawar'],
    fallbackRegex: /^University of Peshawar$/i,
    set: {
      feePublicRegularSemester: 'Rs. 40,000 – 55,000',
      feePublicSelfFinanceSemester: 'Rs. 75,000 – 95,000',
    },
  },
  {
    label: 'BZU Multan',
    exactNames: ['Bahauddin Zakariya University (BZU)'],
    fallbackRegex: /Bahauddin Zakariya University/i,
    set: {
      feePublicRegularSemester: 'Rs. 35,000 – 50,000',
      feePublicSelfFinanceSemester: 'Rs. 70,000 – 90,000',
    },
  },
  {
    label: 'University of Gujrat',
    exactNames: ['University of Gujrat (UOG)', 'University of Gujrat'],
    fallbackRegex: /University of Gujrat/i,
    set: {
      feePublicRegularSemester: 'Rs. 30,000 – 45,000',
      feePublicSelfFinanceSemester: 'Rs. 65,000 – 80,000',
    },
  },
  {
    label: 'UCP',
    exactNames: ['University of Central Punjab (UCP)'],
    fallbackRegex: /University of Central Punjab \(UCP\)|University of Central Punjab$/i,
    set: {
      feeBsTypicalSemester: 'Rs. 145,000 – 220,000',
    },
  },
  {
    label: 'UMT',
    exactNames: ['University of Management and Technology', 'UMT Lahore'],
    fallbackRegex: /University of Management and Technology/i,
    set: {
      feeBsTypicalSemester: 'Rs. 145,000 – 220,000',
    },
  },
  {
    label: 'Superior University',
    exactNames: ['Superior University'],
    fallbackRegex: /^Superior University/i,
    set: {
      feeBsTypicalSemester: 'Rs. 145,000 – 220,000',
    },
  },
  {
    label: 'Riphah International University',
    exactNames: ['Riphah International University'],
    fallbackRegex: /Riphah International University/i,
    set: {
      feeBsTypicalSemester: 'Rs. 130,000 – 210,000',
    },
  },
  {
    label: 'Bahria University',
    exactNames: ['Bahria University'],
    fallbackRegex: /^Bahria University/i,
    set: {
      feeBsTypicalSemester: 'Rs. 95,000 – 135,000',
    },
  },
  {
    label: 'Air University',
    exactNames: ['Air University'],
    fallbackRegex: /^Air University/i,
    set: {
      feeBsTypicalSemester: 'Rs. 95,000 – 135,000',
    },
  },
  {
    label: 'Iqra University',
    exactNames: ['Iqra National University', 'Iqra University'],
    fallbackRegex: /Iqra (National )?University/i,
    set: {
      feeBsTypicalSemester: 'Rs. 90,000 – 150,000',
    },
  },
  {
    label: 'Foundation University',
    exactNames: ['Foundation University Islamabad', 'Foundation University'],
    fallbackRegex: /^Foundation University/i,
    set: {
      feeBsTypicalSemester: 'Rs. 110,000 – 160,000',
    },
  },
  {
    label: 'Virtual University',
    exactNames: ['Virtual University of Pakistan', 'Virtual University'],
    fallbackRegex: /Virtual University/i,
    set: {
      feeBsTypicalSemester: 'Rs. 18,000 – 28,000',
    },
  },
  {
    label: 'AIOU',
    exactNames: ['AIOU - Allama Iqbal Open University', 'Allama Iqbal Open University (AIOU)'],
    fallbackRegex: /Allama Iqbal Open University|AIOU - Allama/i,
    set: {
      feeBsTypicalSemester: 'Rs. 12,000 – 25,000 (varies by program)',
    },
  },
  {
    label: 'University of Baltistan',
    exactNames: ['University of Baltistan', 'University of Baltistan, Skardu'],
    fallbackRegex: /Baltistan.*Skardu|University of Baltistan/i,
    set: {
      feeBsTypicalSemester: 'Rs. 30,000 – 45,000',
    },
  },
];

/**
 * These were missing from the HEC import; create minimal University rows with indicative fees only.
 * (name + city + type are required by schema.)
 */
const UPSERT_IF_MISSING = [
  {
    label: 'ITU Lahore',
    name: 'Information Technology University',
    city: 'Lahore',
    type: 'Public',
    set: {
      feeComputingEngSemester: 'Rs. 110,000 – 140,000',
      feeBusinessSocialSemester: 'Rs. 95,000 – 120,000',
    },
  },
  {
    label: 'PIEAS',
    name: 'Pakistan Institute of Engineering & Applied Sciences (PIEAS)',
    city: 'Islamabad',
    type: 'Public',
    set: {
      feeComputingEngSemester: 'Rs. 75,000 – 95,000',
    },
  },
  {
    label: 'LSE Lahore',
    name: 'Lahore School of Economics (LSE)',
    city: 'Lahore',
    type: 'Private',
    set: {
      feeBsTypicalSemester: 'Rs. 280,000 – 350,000',
    },
  },
  {
    label: 'UMT',
    name: 'University of Management and Technology (UMT)',
    city: 'Lahore',
    type: 'Private',
    set: {
      feeBsTypicalSemester: 'Rs. 145,000 – 220,000',
    },
  },
  {
    label: 'Superior University',
    name: 'Superior University',
    city: 'Lahore',
    type: 'Private',
    set: {
      feeBsTypicalSemester: 'Rs. 145,000 – 220,000',
    },
  },
  {
    label: 'Foundation University',
    name: 'Foundation University Islamabad',
    city: 'Islamabad',
    type: 'Private',
    set: {
      feeBsTypicalSemester: 'Rs. 110,000 – 160,000',
    },
  },
  {
    label: 'Virtual University',
    name: 'Virtual University of Pakistan',
    city: 'Lahore',
    type: 'Public',
    set: {
      feeBsTypicalSemester: 'Rs. 18,000 – 28,000',
    },
  },
  {
    label: 'University of Baltistan',
    name: 'University of Baltistan, Skardu',
    city: 'Skardu',
    type: 'Public',
    set: {
      feeBsTypicalSemester: 'Rs. 30,000 – 45,000',
    },
  },
];

async function upsertIfMissing() {
  for (const row of UPSERT_IF_MISSING) {
    const existing = await University.findOne({
      name: new RegExp(`^${escapeRegex(row.name)}$`, 'i'),
    });
    if (existing) {
      await University.updateOne({ _id: existing._id }, { $set: row.set });
      console.log(`[upsert OK] ${row.label} → existing "${existing.name}"`);
      continue;
    }

    try {
      await University.create({
        name: row.name,
        city: row.city,
        type: row.type,
        ...row.set,
      });
      console.log(`[upsert OK] ${row.label} → created "${row.name}"`);
    } catch (e) {
      if (e && e.code === 11000) {
        const prefix = row.name.split(/[(\s]/)[0];
        const alt = prefix
          ? await University.findOne({ name: new RegExp(escapeRegex(prefix), 'i') })
          : null;
        if (alt) {
          await University.updateOne({ _id: alt._id }, { $set: row.set });
          console.log(`[upsert OK] ${row.label} → duplicate key, updated "${alt.name}"`);
        } else {
          console.warn(`[upsert FAIL] ${row.label}`, e.message);
        }
      } else {
        console.warn(`[upsert FAIL] ${row.label}`, e.message || e);
      }
    }
  }
}

async function main() {
  await mongoose.connect(uri);
  console.log('[seedIndicativeUniversityFees] connected');

  let ok = 0;
  let missing = 0;

  for (const row of ROWS) {
    const u = await findUniversity(row.exactNames, row.fallbackRegex);
    if (!u) {
      console.warn(`[MISS] ${row.label} — no matching University document`);
      missing += 1;
      continue;
    }

    const set = { ...row.set };
    Object.keys(set).forEach((k) => {
      if (set[k] === '') delete set[k];
    });

    await University.updateOne({ _id: u._id }, { $set: set });
    console.log(`[OK] ${row.label} → "${u.name}"`, set);
    ok += 1;
  }

  console.log(`\n[match pass] updated: ${ok}, not found: ${missing}`);

  console.log('\n--- Upsert missing universities (screenshot list not in import) ---');
  await upsertIfMissing();

  console.log('\n[done]');
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
