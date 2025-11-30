/**
 * Seed Dummy Merit Criteria Data for Testing
 * Creates sample UniversityCriteria for existing universities and programs
 */

const mongoose = require('mongoose');
require('dotenv').config();

const University = require('../models/University');
const Program = require('../models/Program');
const UniversityCriteria = require('../models/UniversityCriteria');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/manzil';

async function seedMeritCriteria() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all universities
    const universities = await University.find({ isActive: true });
    
    if (universities.length === 0) {
      console.log('⚠️  No universities found. Please add universities first.');
      process.exit(1);
    }

    console.log(`📚 Found ${universities.length} universities\n`);
    console.log('🌱 Seeding merit criteria for all programs...\n');

    let created = 0;
    let updated = 0;

    for (const university of universities) {
      // Get ALL programs for this university (not limited)
      const programs = await Program.find({ 
        university: university._id, 
        isActive: true 
      });

      if (programs.length === 0) {
        console.log(`   ⏭️  Skipping ${university.name} - No programs found`);
        continue;
      }

      for (const program of programs) {
        try {
          // Check if criteria already exists
          const existing = await UniversityCriteria.findOne({
            university: university._id,
            program: program._id
          });

          // Determine entry test based on program category
          let entryTestName = 'ECAT';
          let entryTestTotalMarks = 200;
          
          if (program.category === 'Medical') {
            entryTestName = 'MDCAT';
            entryTestTotalMarks = 200;
          } else if (program.category === 'Computer Science' || program.category === 'Engineering') {
            entryTestName = 'ECAT';
            entryTestTotalMarks = 200;
          } else if (program.category === 'Business') {
            entryTestName = 'NTS';
            entryTestTotalMarks = 100;
          }

          // Default weights (can be customized per program)
          const criteriaData = {
            university: university._id,
            program: program._id,
            matricWeight: 10,
            firstYearWeight: 0,
            secondYearWeight: 0,
            intermediateWeight: 40,
            entryTestWeight: 50,
            entryTestRequired: true,
            entryTestName: entryTestName,
            entryTestTotalMarks: entryTestTotalMarks,
            minimumMatricMarks: 600,
            minimumIntermediateMarks: 650,
            minimumEntryTestMarks: 100,
            pastMeritTrends: [
              {
                year: 2024,
                closingMerit: 75.5 + Math.random() * 10, // Random between 75-85
                programName: program.name
              },
              {
                year: 2023,
                closingMerit: 74.0 + Math.random() * 10,
                programName: program.name
              },
              {
                year: 2022,
                closingMerit: 72.5 + Math.random() * 10,
                programName: program.name
              }
            ],
            isActive: true
          };

          if (existing) {
            // Update existing
            await UniversityCriteria.findByIdAndUpdate(existing._id, criteriaData);
            updated++;
            console.log(`   🔄 Updated: ${university.name} - ${program.name}`);
          } else {
            // Create new
            await UniversityCriteria.create(criteriaData);
            created++;
            console.log(`   ✅ Created: ${university.name} - ${program.name}`);
          }
        } catch (error) {
          console.log(`   ❌ Error: ${university.name} - ${program.name}: ${error.message}`);
        }
      }
    }

    console.log(`\n\n📊 Seed Summary:`);
    console.log(`   ✅ Created: ${created}`);
    console.log(`   🔄 Updated: ${updated}`);
    console.log(`\n✅ Merit criteria seeding completed!\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the seed function
seedMeritCriteria();

