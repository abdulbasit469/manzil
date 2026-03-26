/**
 * Seed DegreeScope collection (Option A).
 * Run: node scripts/seed_degree_scope.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

const DegreeScope = require('../models/DegreeScope');
const degreeScopeSeed = require('../data/degreeScopeSeed');

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
    const count = await DegreeScope.countDocuments();
    console.log(`\n✅ DegreeScope seed done. Total documents: ${count}\n`);
  } catch (err) {
    console.error('Seed error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

seedDegreeScope();
