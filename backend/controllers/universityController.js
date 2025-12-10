const University = require('../models/University');
const Program = require('../models/Program');

// Admin: Create university
exports.createUniversity = async (req, res) => {
  try {
    const { getUniversityImage } = require('../utils/universityImages');
    
    // Add image if not provided
    if (!req.body.image && req.body.name) {
      req.body.image = getUniversityImage(req.body.name);
    }
    
    const university = await University.create(req.body);
    console.log(`✅ University created: ${university.name}`);
    res.status(201).json({
      success: true,
      message: 'University created successfully',
      university
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Admin: Update university
exports.updateUniversity = async (req, res) => {
  try {
    const { getUniversityImage } = require('../utils/universityImages');
    
    // Only auto-generate image if name is being updated and no image provided
    // If image is provided (even as base64), use it
    if (req.body.name && !req.body.image) {
      // Check if existing university has an image
      const existingUniversity = await University.findById(req.params.id);
      if (!existingUniversity || !existingUniversity.image) {
        req.body.image = getUniversityImage(req.body.name);
      } else {
        // Keep existing image if not being updated
        req.body.image = existingUniversity.image;
      }
    }
    
    const university = await University.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!university) {
      return res.status(404).json({ success: false, message: 'University not found' });
    }
    res.status(200).json({ success: true, message: 'University updated', university });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Admin: Delete university
exports.deleteUniversity = async (req, res) => {
  try {
    const university = await University.findByIdAndDelete(req.params.id);
    if (!university) {
      return res.status(404).json({ success: false, message: 'University not found' });
    }
    res.status(200).json({ success: true, message: 'University deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Public: Get all universities
exports.getAllUniversities = async (req, res) => {
  try {
    const { page = 1, limit = 12, city, type, search } = req.query; // Default 12 per page
    
    // Build query - get all universities by default
    // Only exclude if isActive is explicitly false
    const query = {};
    
    // Don't filter by isActive unless explicitly requested
    // This ensures we get all universities from database
    
    if (city && city.trim() && city !== 'All Cities') {
      query.city = { $regex: city.trim(), $options: 'i' };
    }
    
    if (type && type.trim() && type !== 'All Types') {
      // Handle both capitalized and lowercase type
      query.type = { $regex: new RegExp(`^${type.trim()}$`, 'i') };
    }
    
    if (search && search.trim()) {
      query.name = { $regex: search.trim(), $options: 'i' };
    }

    console.log('🔍 University query:', JSON.stringify(query, null, 2));

    const universities = await University.find(query)
      .select('name city type website image logo description address email phone hecRanking establishedYear facilities isActive')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ name: 1 }); // Sort by name for better organization

    console.log(`✅ Found ${universities.length} universities`);

    // Get program counts for each university
    const Program = require('../models/Program');
    const { getUniversityImage } = require('../utils/universityImages');
    
    const universitiesWithImages = await Promise.all(
      universities.map(async (uni) => {
        const uniObj = uni.toObject();
        
        // Add image if not present
        if (!uniObj.image) {
          uniObj.image = getUniversityImage(uni.name);
        }
        
        // Ensure type is included (required field, but double-check)
        // Type should always be present as it's required in schema, but ensure it's set
        if (!uniObj.type || (uniObj.type !== 'Public' && uniObj.type !== 'Private')) {
          uniObj.type = 'Public'; // Default to Public if missing or invalid
        }
        
        // Log for debugging
        console.log(`University: ${uniObj.name}, Type: ${uniObj.type}`);
        
        return uniObj;
      })
    );

    const count = await University.countDocuments(query);
    console.log(`📊 Total universities matching query: ${count}`);

    res.status(200).json({
      success: true,
      count: universitiesWithImages.length,
      total: count,
      totalPages: Math.ceil(count / parseInt(limit)),
      currentPage: parseInt(page),
      universities: universitiesWithImages
    });
  } catch (error) {
    console.error('❌ Error fetching universities:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to fetch universities',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Public: Get single university
exports.getUniversity = async (req, res) => {
  try {
    const university = await University.findById(req.params.id);
    if (!university) {
      return res.status(404).json({ success: false, message: 'University not found' });
    }
    
    const Program = require('../models/Program');
    const { getUniversityImage } = require('../utils/universityImages');
    
    const programCount = await Program.countDocuments({ university: university._id, isActive: true });
    const uniObj = university.toObject();
    
    // Add image if not present
    if (!uniObj.image) {
      uniObj.image = getUniversityImage(university.name);
    }
    
    // Add program count
    uniObj.programCount = programCount;
    
    res.status(200).json({ success: true, university: uniObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Public: Get university programs
exports.getUniversityPrograms = async (req, res) => {
  try {
    const programs = await Program.find({ 
      university: req.params.id,
      isActive: true 
    }).populate('university', 'name city');
    
    res.status(200).json({
      success: true,
      count: programs.length,
      programs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




