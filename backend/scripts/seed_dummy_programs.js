/**
 * Seed Dummy Programs for Universities
 * Adds 5 programs to each university that doesn't have programs
 */

const mongoose = require('mongoose');
require('dotenv').config();

const University = require('../models/University');
const Program = require('../models/Program');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/manzil';

// Dummy programs data
const dummyPrograms = [
  {
    name: 'BS Computer Science',
    degree: 'BS',
    duration: '4 years',
    feePerSemester: 50000,
    eligibility: 'FSc Pre-Engineering/ICS with minimum 60% marks',
    description: 'Comprehensive computer science program covering programming, algorithms, and software development',
    careerScope: 'Software Engineer, Web Developer, Data Scientist, System Analyst',
    category: 'Computer Science'
  },
  {
    name: 'BS Electrical Engineering',
    degree: 'BS',
    duration: '4 years',
    feePerSemester: 55000,
    eligibility: 'FSc Pre-Engineering with minimum 65% marks',
    description: 'Electrical engineering program focusing on power systems, electronics, and telecommunications',
    careerScope: 'Electrical Engineer, Power Systems Engineer, Electronics Engineer',
    category: 'Engineering'
  },
  {
    name: 'BS Business Administration',
    degree: 'BBA',
    duration: '4 years',
    feePerSemester: 45000,
    eligibility: 'FSc/FA/ICS/ICOM with minimum 50% marks',
    description: 'Business administration program covering management, marketing, finance, and entrepreneurship',
    careerScope: 'Business Manager, Marketing Manager, Financial Analyst, Entrepreneur',
    category: 'Business'
  },
  {
    name: 'BS Mechanical Engineering',
    degree: 'BS',
    duration: '4 years',
    feePerSemester: 52000,
    eligibility: 'FSc Pre-Engineering with minimum 60% marks',
    description: 'Mechanical engineering program covering design, manufacturing, and thermal systems',
    careerScope: 'Mechanical Engineer, Design Engineer, Manufacturing Engineer',
    category: 'Engineering'
  },
  {
    name: 'BS Software Engineering',
    degree: 'BS',
    duration: '4 years',
    feePerSemester: 48000,
    eligibility: 'FSc Pre-Engineering/ICS with minimum 55% marks',
    description: 'Software engineering program focusing on software development lifecycle and project management',
    careerScope: 'Software Engineer, Full Stack Developer, DevOps Engineer, Project Manager',
    category: 'Computer Science'
  }
];

async function seedDummyPrograms() {
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
    console.log('🌱 Seeding dummy programs...\n');

    let created = 0;
    let skipped = 0;

    for (const university of universities) {
      // Check if university already has programs
      const existingPrograms = await Program.countDocuments({ 
        university: university._id 
      });

      if (existingPrograms > 0) {
        console.log(`   ⏭️  Skipping ${university.name} - Already has ${existingPrograms} programs`);
        skipped++;
        continue;
      }

      console.log(`\n   📝 Adding programs to ${university.name}:`);

      // Add 5 dummy programs to this university
      for (const programData of dummyPrograms) {
        try {
          const program = await Program.create({
            ...programData,
            university: university._id,
            isActive: true
          });
          created++;
          console.log(`      ✅ ${program.name}`);
        } catch (error) {
          if (error.code === 11000) {
            console.log(`      ⏭️  Duplicate: ${programData.name}`);
          } else {
            console.log(`      ❌ Error: ${programData.name} - ${error.message}`);
          }
        }
      }
    }

    console.log(`\n\n📊 Seed Summary:`);
    console.log(`   ✅ Created: ${created} programs`);
    console.log(`   ⏭️  Skipped: ${skipped} universities (already have programs)`);
    console.log(`\n✅ Dummy programs seeding completed!\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the seed function
seedDummyPrograms();


