/**
 * Seed DegreeScope collection (Option A).
 * Run: node scripts/seed_degree_scope.js
 */
const path = require('path');
// .env at project root (same as npm start), not only backend/.env
const rootEnv = path.join(__dirname, '..', '..', '.env');
const backendEnv = path.join(__dirname, '..', '.env');
require('dotenv').config({ path: rootEnv });
require('dotenv').config({ path: backendEnv });
const mongoose = require('mongoose');

const DegreeScope = require('../models/DegreeScope');
const degreeScopeSeed = require('../data/degreeScopeSeed');

/** Must match backend/controllers/degreeScopeController.js (cleanup renamed cards) */
const DEPRECATED_DEGREE_SCOPE_NAMES = [
  'MBBS',
  'BDS',
  'DPT',
  'Pharm-D',
  'BS Computer Science',
  'BS Software Engineering',
  'BS Data Science',
  'BS Electrical Engineering',
  'BS Mechanical Engineering',
  'BS Civil Engineering',
  'BS Chemical Engineering',
  'BS Mechatronics Engineering',
  'BS Aerospace Engineering',
  'BS Industrial Engineering',
  'BS Petroleum Engineering',
  'BS Biomedical Engineering',
  'BS Environmental Engineering',
  'BS Computer Engineering',
  'BS Information Technology (IT)',
  'BS Artificial Intelligence (AI)',
  'MBA',
];

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/manzil';

async function seedDegreeScope() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB\n');
    const existing = await DegreeScope.countDocuments();
    if (existing > 0) {
      console.log(`DegreeScope already has ${existing} documents. Upserting by degreeName...`);
      for (const item of degreeScopeSeed) {
        await DegreeScope.updateOne(
          { degreeName: item.degreeName },
          { $set: item },
          { upsert: true }
        );
      }
    } else {
      await DegreeScope.insertMany(degreeScopeSeed);
    }
    await DegreeScope.deleteMany({ degreeName: { $in: DEPRECATED_DEGREE_SCOPE_NAMES } });
    const count = await DegreeScope.countDocuments();
    console.log(`\n✅ DegreeScope seed done. Total documents: ${count}\n`);
  } catch (err) {
    console.error('Seed error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

seedDegreeScope();
