/**
 * Import HEC Recognized Universities from CSV to MongoDB
 * Ensures unique universities and matches the scraper format
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import University model
const University = require('../models/University');

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/manzil';

// Province mapping from CSV to standard format
const provinceMapping = {
  'ICT': 'Islamabad Capital Territory',
  'Punjab': 'Punjab',
  'Sindh': 'Sindh',
  'Khyber Pakhtunkhwa': 'Khyber Pakhtunkhwa',
  'KP': 'Khyber Pakhtunkhwa',
  'Balochistan': 'Balochistan',
  'AJK': 'Azad Jammu and Kashmir',
  'GB': 'Gilgit-Baltistan'
};

// Type mapping
const typeMapping = {
  'Public': 'Public',
  'Private': 'Private',
  'Public/Autonomous': 'Public',
  'Public/Private Sector': 'Public'
};

async function importUniversities() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Read CSV file
    const csvPath = path.join(__dirname, '../../hec_recognized_universities_compiled.csv');
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
    const universities = [];
    const seenNames = new Set(); // Track unique names
    
    console.log(`\n📊 Parsing ${lines.length - 1} rows...\n`);

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

      if (values.length < 4) {
        console.log(`⚠️  Skipping invalid row ${i + 1}: ${line.substring(0, 50)}...`);
        continue;
      }

      const [name, city, province, type, source] = values;

      if (!name || name.trim().length < 3) {
        continue;
      }

      // Normalize name (remove extra spaces, trim)
      const normalizedName = name.trim().replace(/\s+/g, ' ');

      // Skip duplicates (case-insensitive)
      const nameLower = normalizedName.toLowerCase();
      if (seenNames.has(nameLower)) {
        console.log(`   ⏭️  Duplicate skipped: ${normalizedName}`);
        continue;
      }
      seenNames.add(nameLower);

      // Map province
      const normalizedProvince = provinceMapping[province] || province || 'Unknown';
      
      // Map type
      const normalizedType = typeMapping[type] || (type && type.includes('Private') ? 'Private' : 'Public');

      // Create university object matching MongoDB schema
      const university = {
        name: normalizedName,
        city: city ? city.trim() : 'Unknown',
        type: normalizedType,
        isActive: true
      };

      // Add province info to description or address
      if (normalizedProvince !== 'Unknown') {
        university.address = `${city || 'Unknown'}, ${normalizedProvince}`;
      }

      universities.push(university);
    }

    console.log(`\n✅ Parsed ${universities.length} unique universities\n`);
    console.log('💾 Importing to MongoDB...\n');

    // Import to MongoDB with upsert (update if exists, insert if new)
    let imported = 0;
    let updated = 0;
    let skipped = 0;

    for (const uni of universities) {
      try {
        // Use upsert to avoid duplicates
        const result = await University.findOneAndUpdate(
          { name: { $regex: new RegExp(`^${uni.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } },
          uni,
          { 
            upsert: true, 
            new: true,
            setDefaultsOnInsert: true
          }
        );

        if (result.isNew) {
          imported++;
          console.log(`   ✅ Imported: ${uni.name}`);
        } else {
          updated++;
          console.log(`   🔄 Updated: ${uni.name}`);
        }
      } catch (error) {
        if (error.code === 11000) {
          // Duplicate key error
          skipped++;
          console.log(`   ⏭️  Duplicate (skipped): ${uni.name}`);
        } else {
          console.log(`   ❌ Error importing ${uni.name}: ${error.message}`);
          skipped++;
        }
      }
    }

    console.log(`\n\n📊 Import Summary:`);
    console.log(`   ✅ Newly Imported: ${imported}`);
    console.log(`   🔄 Updated: ${updated}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   📝 Total Processed: ${imported + updated + skipped}`);
    
    // Get total count in database
    const totalInDB = await University.countDocuments();
    console.log(`   🎓 Total Universities in DB: ${totalInDB}\n`);

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
importUniversities();




