const Program = require('../models/Program');

// Admin: Create program
exports.createProgram = async (req, res) => {
  try {
    // Map degreeType to degree if provided
    if (req.body.degreeType && !req.body.degree) {
      req.body.degree = req.body.degreeType;
    }
    const program = await Program.create(req.body);
    await program.populate('university', 'name city');
    console.log(`✅ Program created: ${program.name}`);
    res.status(201).json({
      success: true,
      message: 'Program created successfully',
      program
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Admin: Update program
exports.updateProgram = async (req, res) => {
  try {
    // Map degreeType to degree if provided
    if (req.body.degreeType && !req.body.degree) {
      req.body.degree = req.body.degreeType;
    }
    const program = await Program.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('university', 'name city');
    
    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }
    res.status(200).json({ success: true, message: 'Program updated', program });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Admin: Delete program
exports.deleteProgram = async (req, res) => {
  try {
    const program = await Program.findByIdAndDelete(req.params.id);
    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }
    res.status(200).json({ success: true, message: 'Program deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Public: Get all programs
exports.getAllPrograms = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, degree, search, university } = req.query; // Default 10 per page
    
    const query = { isActive: { $ne: false } }; // Include all active programs
    if (category && category.trim()) query.category = category.trim();
    if (degree && degree.trim()) query.degree = { $regex: new RegExp(`^${degree.trim()}$`, 'i') };
    if (search && search.trim()) query.name = { $regex: search.trim(), $options: 'i' };
    if (university && university.trim()) {
      // Validate ObjectId format
      if (university.match(/^[0-9a-fA-F]{24}$/)) {
        query.university = university.trim();
      }
    }

    const programs = await Program.find(query)
      .populate('university', 'name city type')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ name: 1 }); // Sort by name for better organization

    const count = await Program.countDocuments(query);

    res.status(200).json({
      success: true,
      count: programs.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      programs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Public: Get single program
exports.getProgram = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id).populate('university');
    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }
    res.status(200).json({ success: true, program });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




