const University = require('../models/University');
const Program = require('../models/Program');

// Admin: Create university
exports.createUniversity = async (req, res) => {
  try {
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
    const { page = 1, limit = 10, city, type, search } = req.query; // Default 10 per page
    
    const query = { isActive: { $ne: false } }; // Include all active universities (default is true)
    if (city && city.trim()) query.city = { $regex: city.trim(), $options: 'i' };
    if (type && type.trim()) {
      // Handle both capitalized and lowercase type
      query.type = { $regex: new RegExp(`^${type.trim()}$`, 'i') };
    }
    if (search && search.trim()) query.name = { $regex: search.trim(), $options: 'i' };

    const universities = await University.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ name: 1 }); // Sort by name for better organization

    const count = await University.countDocuments(query);

    res.status(200).json({
      success: true,
      count: universities.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      universities
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Public: Get single university
exports.getUniversity = async (req, res) => {
  try {
    const university = await University.findById(req.params.id);
    if (!university) {
      return res.status(404).json({ success: false, message: 'University not found' });
    }
    res.status(200).json({ success: true, university });
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




