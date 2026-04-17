const University = require('../models/University');
const Program = require('../models/Program');
const {
  sanitizeUniversityFields,
  sanitizeProgramsArray,
} = require('../utils/sanitizeUniversityStrings');

// Admin: Create university
exports.createUniversity = async (req, res) => {
  try {
    const { getUniversityImage } = require('../utils/universityImages');

    if (typeof req.body.name === 'string') {
      req.body.name = sanitizeUniversityFields({ name: req.body.name }).name;
    }
    if (typeof req.body.city === 'string') {
      req.body.city = sanitizeUniversityFields({ city: req.body.city }).city;
    }
    if (typeof req.body.address === 'string') {
      req.body.address = sanitizeUniversityFields({ address: req.body.address }).address;
    }

    // Add image if not provided
    if (!req.body.image && req.body.name) {
      req.body.image = getUniversityImage(req.body.name);
    }
    
    const university = await University.create(req.body);
    console.log(`✅ University created: ${university.name}`);
    res.status(201).json({
      success: true,
      message: 'University created successfully',
      university: sanitizeUniversityFields(university.toObject())
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Admin: Update university
exports.updateUniversity = async (req, res) => {
  try {
    const { getUniversityImage } = require('../utils/universityImages');

    if (typeof req.body.name === 'string') {
      req.body.name = sanitizeUniversityFields({ name: req.body.name }).name;
    }
    if (typeof req.body.city === 'string') {
      req.body.city = sanitizeUniversityFields({ city: req.body.city }).city;
    }
    if (typeof req.body.address === 'string') {
      req.body.address = sanitizeUniversityFields({ address: req.body.address }).address;
    }

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
    res.status(200).json({
      success: true,
      message: 'University updated',
      university: sanitizeUniversityFields(university.toObject())
    });
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
    
    const omitPlaceholder =
      req.query.omitPlaceholderUniversities === 'true' || req.query.omitPlaceholderUniversities === '1';

    const nameClauses = [];
    if (search && search.trim()) {
      nameClauses.push({ name: { $regex: search.trim(), $options: 'i' } });
    }
    if (omitPlaceholder) {
      // Name suffix "(Not specified)" OR city placeholders (merit / curated lists)
      nameClauses.push({ name: { $not: /\(\s*not specified\s*\)/i } });
      nameClauses.push({ city: { $not: /^not specified$/i } });
      nameClauses.push({ city: { $not: /^unknown$/i } });
    }
    if (nameClauses.length === 1) {
      Object.assign(query, nameClauses[0]);
    } else if (nameClauses.length > 1) {
      query.$and = nameClauses;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('University query:', JSON.stringify(query));
    }

    const meritPicker =
      req.query.meritPicker === 'true' || req.query.meritPicker === '1';

    /**
     * Merit calculator dropdown: only _id/name/city — skips per-row image URL resolution
     * (which was O(n×keys) and very slow for thousands of universities).
     */
    if (meritPicker) {
      const rawLim = parseInt(limit, 10);
      const lim = Math.min(
        Math.max(Number.isFinite(rawLim) && rawLim > 0 ? rawLim : 8000, 1),
        15000
      );
      const universities = await University.find(query)
        .select('_id name city')
        .sort({ name: 1 })
        .limit(lim)
        .lean();

      const list = universities.map((u) =>
        sanitizeUniversityFields({
          _id: u._id,
          name: u.name || '',
          city: u.city || '',
        })
      );

      return res.status(200).json({
        success: true,
        count: list.length,
        total: list.length,
        totalPages: 1,
        currentPage: 1,
        universities: list,
      });
    }

    /** List view only — omit large text fields (scrapedSummary etc.) for fast JSON + smaller payloads */
    const universities = await University.find(query)
      .select('name city type website image logo hecRanking establishedYear isActive')
      .limit(parseInt(limit, 10))
      .skip((parseInt(page, 10) - 1) * parseInt(limit, 10))
      .sort({ name: 1 })
      .lean();

    const { getUniversityImage } = require('../utils/universityImages');

    const universitiesWithImages = universities.map((uni) => {
      const uniObj = sanitizeUniversityFields({ ...uni });
      if (!uniObj.image) {
        uniObj.image = getUniversityImage(uniObj.name || uni.name);
      }
      if (!uniObj.type || (uniObj.type !== 'Public' && uniObj.type !== 'Private')) {
        uniObj.type = 'Public';
      }
      return uniObj;
    });

    const count = await University.countDocuments(query);

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
    
    const { getUniversityImage } = require('../utils/universityImages');

    const programCount = await Program.countDocuments({ university: university._id, isActive: true });
    let uniObj = university.toObject();
    uniObj = sanitizeUniversityFields(uniObj);

    // Add image if not present
    if (!uniObj.image) {
      uniObj.image = getUniversityImage(uniObj.name || university.name);
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
      programs: sanitizeProgramsArray(programs)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




