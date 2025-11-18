/**
 * Import Undergraduate Programs from CSV to MongoDB
 * Links programs to universities and matches the Program schema
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import models
const Program = require('../models/Program');
const University = require('../models/University');

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/manzil';

// Degree type mapping from program name
function extractDegreeType(programName) {
  const name = programName.toUpperCase();
  
  if (name.includes('PHARM-D') || name.includes('PHARMD')) return 'Pharm-D';
  if (name.includes('BA-LLB') || (name.includes('LLB') && name.includes('BA'))) return 'BA-LLB';
  if (name.includes('BBA')) return 'BBA';
  if (name.includes('BS ') || name.startsWith('BS ')) return 'BS';
  if (name.includes('BSC ') || name.includes('B.SC') || name.startsWith('BSC')) return 'BS';
  if (name.includes('BA ') || name.startsWith('BA ')) return 'BA';
  if (name.includes('BE ') || name.startsWith('BE ')) return 'BE';
  if (name.includes('MBA')) return 'MBA';
  if (name.includes('MS ') || name.startsWith('MS ')) return 'MS';
  if (name.includes('PHD')) return 'PhD';
  
  // Default for undergraduate
  return 'BS';
}

// Category mapping from program name
function extractCategory(programName) {
  const name = programName.toLowerCase();
  
  if (name.includes('computer') || name.includes('software') || name.includes('cyber') || name.includes('it ') || name.includes(' information')) {
    return 'Computer Science';
  }
  if (name.includes('electrical') || name.includes('mechanical') || name.includes('civil') || name.includes('engineering') || name.includes('chemical')) {
    return 'Engineering';
  }
  if (name.includes('business') || name.includes('management') || name.includes('accounting') || name.includes('finance') || name.includes('bba') || name.includes('mba')) {
    return 'Business';
  }
  if (name.includes('medical') || name.includes('medicine') || name.includes('pharm') || name.includes('health')) {
    return 'Medical';
  }
  if (name.includes('law') || name.includes('llb')) {
    return 'Law';
  }
  if (name.includes('english') || name.includes('arts') || name.includes('humanities')) {
    return 'Arts';
  }
  if (name.includes('chemistry') || name.includes('physics') || name.includes('mathematics') || name.includes('biology') || name.includes('biotechnology') || name.includes('environmental')) {
    return 'Computer Science'; // Sciences category
  }
  
  return 'Other';
}

// University name matching (fuzzy matching)
function findUniversityByName(universityName, universities) {
  const normalized = universityName.trim().toLowerCase();
  
  // Exact match
  for (const uni of universities) {
    if (uni.name.toLowerCase() === normalized) {
      return uni._id;
    }
  }
  
  // Partial match (contains)
  for (const uni of universities) {
    const uniName = uni.name.toLowerCase();
    if (uniName.includes(normalized) || normalized.includes(uniName)) {
      return uni._id;
    }
  }
  
  // Abbreviation matching
  const abbrevMap = {
    'lums': 'Lahore University of Management Sciences',
    'nust': 'National University of Sciences & Technology',
    'fast-nuces': 'FAST National University of Computer and Emerging Sciences',
    'fast': 'FAST National University of Computer and Emerging Sciences',
    'comsats': 'COMSATS University Islamabad',
    'qa': 'Quaid-i-Azam University',
    'quaid': 'Quaid-i-Azam University',
    'uet': 'University of Engineering & Technology',
    'gc': 'Government College University',
    'gcu': 'Government College University Lahore',
    'bzu': 'Bahauddin Zakariya University',
    'numl': 'National University of Modern Languages',
    'aiou': 'Allama Iqbal Open University',
    'uaf': 'University of Agriculture, Faisalabad',
    'uvas': 'University of Veterinary and Animal Sciences',
    'uoh': 'University of Haripur',
    'uog': 'University of Gujrat',
    'uol': 'University of Lahore',
    'ucp': 'University of Central Punjab',
    'uop': 'University of Peshawar',
    'uos': 'University of Sargodha',
    'uob': 'University of Balochistan',
    'uok': 'University of Karachi',
    'uoh': 'University of Haripur'
  };
  
  for (const [abbrev, fullName] of Object.entries(abbrevMap)) {
    if (normalized.includes(abbrev)) {
      for (const uni of universities) {
        if (uni.name.toLowerCase().includes(fullName.toLowerCase())) {
          return uni._id;
        }
      }
    }
  }
  
  return null;
}

async function importPrograms() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Load all universities for matching
    console.log('📚 Loading universities...');
    const universities = await University.find({ isActive: { $ne: false } });
    console.log(`✅ Loaded ${universities.length} universities\n`);

    // Read CSV file
    const csvPath = path.join(__dirname, '../../undergraduate_programs_option1.csv');
    console.log(`📄 Reading CSV file: ${csvPath}`);
    
    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found at: ${csvPath}`);
    }

    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      throw new Error('CSV file is empty or has no data rows');
    }

    // Parse CSV (skip header)
    const programs = [];
    const seenPrograms = new Set(); // Track unique programs (university + program name)
    
    console.log(`📊 Parsing ${lines.length - 1} rows...\n`);

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Parse CSV line (handle quoted values)
      const values = [];
      let current = '';
      let inQuotes = false;

      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim()); // Add last value

      if (values.length < 2) {
        console.log(`⚠️  Skipping invalid row ${i + 1}: ${line.substring(0, 50)}...`);
        continue;
      }

      const [universityName, programName] = values;

      if (!universityName || !programName || programName.trim().length < 3) {
        continue;
      }

      // Normalize names
      const normalizedUniName = universityName.trim();
      const normalizedProgName = programName.trim();

      // Skip duplicates (same university + program)
      const uniqueKey = `${normalizedUniName.toLowerCase()}|${normalizedProgName.toLowerCase()}`;
      if (seenPrograms.has(uniqueKey)) {
        console.log(`   ⏭️  Duplicate skipped: ${normalizedProgName} at ${normalizedUniName}`);
        continue;
      }
      seenPrograms.add(uniqueKey);

      // Find university ID
      const universityId = findUniversityByName(normalizedUniName, universities);
      
      if (!universityId) {
        console.log(`   ⚠️  University not found: ${normalizedUniName} (skipping ${normalizedProgName})`);
        continue;
      }

      // Extract degree type and category
      const degreeType = extractDegreeType(normalizedProgName);
      const category = extractCategory(normalizedProgName);

      // Create program object
      const program = {
        name: normalizedProgName,
        degree: degreeType,
        university: universityId,
        duration: '4 years', // Default for undergraduate
        feePerSemester: 0, // Will be updated later
        eligibility: 'FSc/FA/ICS with minimum 50% marks',
        category: category,
        isActive: true
      };

      programs.push({
        program,
        universityName: normalizedUniName
      });
    }

    console.log(`\n✅ Parsed ${programs.length} unique programs\n`);
    console.log('💾 Importing to MongoDB...\n');

    // Import to MongoDB
    let imported = 0;
    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const { program, universityName } of programs) {
      try {
        // Check if program already exists (same name + university)
        const existing = await Program.findOne({
          name: { $regex: new RegExp(`^${program.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
          university: program.university
        });

        if (existing) {
          // Update existing program
          await Program.findByIdAndUpdate(existing._id, program, { new: true });
          updated++;
          console.log(`   🔄 Updated: ${program.name} at ${universityName}`);
        } else {
          // Create new program
          await Program.create(program);
          imported++;
          console.log(`   ✅ Imported: ${program.name} at ${universityName}`);
        }
      } catch (error) {
        if (error.code === 11000) {
          skipped++;
          console.log(`   ⏭️  Duplicate (skipped): ${program.name} at ${universityName}`);
        } else {
          errors++;
          console.log(`   ❌ Error importing ${program.name} at ${universityName}: ${error.message}`);
        }
      }
    }

    console.log(`\n\n📊 Import Summary:`);
    console.log(`   ✅ Newly Imported: ${imported}`);
    console.log(`   🔄 Updated: ${updated}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📝 Total Processed: ${imported + updated + skipped + errors}`);
    
    // Get total count in database
    const totalInDB = await Program.countDocuments();
    console.log(`   🎓 Total Programs in DB: ${totalInDB}\n`);

    console.log('✅ Import completed successfully!');
    
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run import
importPrograms();

