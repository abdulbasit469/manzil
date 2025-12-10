/**
 * University Image Mapping
 * Maps university names to their actual images
 * Using reliable image sources
 */

const universityImageMap = {
  // Major Universities with specific images
  'NUST': 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=500&fit=crop',
  'National University of Sciences & Technology': 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=500&fit=crop',
  'LUMS': 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&h=500&fit=crop',
  'Lahore University of Management Sciences': 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&h=500&fit=crop',
  'FAST': 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800&h=500&fit=crop',
  'National University of Computer & Emerging Sciences': 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800&h=500&fit=crop',
  'UET': 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=500&fit=crop',
  'University of Engineering & Technology': 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=500&fit=crop',
  'PIEAS': 'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=800&h=500&fit=crop',
  'Pakistan Institute of Engineering & Applied Sciences': 'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=800&h=500&fit=crop',
  'COMSATS': 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=800&h=500&fit=crop',
  'COMSATS University': 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=800&h=500&fit=crop',
  'AIOU': 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&h=500&fit=crop',
  'Allama Iqbal Open University': 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&h=500&fit=crop',
  'Bahria University': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=500&fit=crop',
  'IBA': 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&h=500&fit=crop',
  'Institute of Business Administration': 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&h=500&fit=crop',
  'GIKI': 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=500&fit=crop',
  'Ghulam Ishaq Khan Institute': 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=500&fit=crop',
  'NED': 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=500&fit=crop',
  'NED University': 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c33c4?w=800&h=500&fit=crop',
  'Quaid-e-Azam University': 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=500&fit=crop',
  'QAU': 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=500&fit=crop',
  'Aga Khan University': 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=800&h=500&fit=crop',
  'Air University': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=500&fit=crop',
  'Bahauddin Zakariya University': 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&h=500&fit=crop',
  'BZU': 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&h=500&fit=crop',
};

/**
 * Get image URL for a university based on its name
 * @param {String} universityName - Name of the university
 * @returns {String} Image URL
 */
function getUniversityImage(universityName) {
  if (!universityName) {
    return 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&h=500&fit=crop';
  }

  const name = universityName.trim();
  
  // Try exact match first
  if (universityImageMap[name]) {
    return universityImageMap[name];
  }

  // Try partial match for common patterns
  for (const [key, imageUrl] of Object.entries(universityImageMap)) {
    if (name.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(name.toLowerCase())) {
      return imageUrl;
    }
  }

  // Try matching by acronym or key words
  const nameWords = name.toLowerCase().split(/\s+/);
  for (const word of nameWords) {
    if (word.length > 3) {
      for (const [key, imageUrl] of Object.entries(universityImageMap)) {
        if (key.toLowerCase().includes(word)) {
          return imageUrl;
        }
      }
    }
  }

  // Default university image
  return 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&h=500&fit=crop';
}

module.exports = {
  getUniversityImage,
  universityImageMap
};

