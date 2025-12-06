const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
const imagesDir = path.join(uploadsDir, 'images');
const videosDir = path.join(uploadsDir, 'videos');

[uploadsDir, imagesDir, videosDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage for images
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'image-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure storage for videos
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, videosDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'video-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for images
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed!'));
  }
};

// File filter for videos
const videoFilter = (req, file, cb) => {
  const allowedTypes = /mp4|webm|ogg|mov|avi/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only video files (mp4, webm, ogg, mov, avi) are allowed!'));
  }
};

// Create multer instances
const uploadImage = multer({
  storage: imageStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for images
  },
  fileFilter: imageFilter
});

const uploadVideo = multer({
  storage: videoStorage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit for videos
  },
  fileFilter: videoFilter
});

// Combined upload middleware for both images and videos
const uploadMedia = (req, res, next) => {
  // Use multer fields to handle both images and videos
  const upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        if (file.fieldname === 'images') {
          cb(null, imagesDir);
        } else if (file.fieldname === 'videos') {
          cb(null, videosDir);
        }
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const prefix = file.fieldname === 'images' ? 'image' : 'video';
        cb(null, prefix + '-' + uniqueSuffix + ext);
      }
    }),
    fileFilter: (req, file, cb) => {
      if (file.fieldname === 'images') {
        imageFilter(req, file, cb);
      } else if (file.fieldname === 'videos') {
        videoFilter(req, file, cb);
      } else {
        cb(new Error('Invalid field name'));
      }
    },
    limits: {
      fileSize: file => {
        if (file.fieldname === 'images') {
          return 10 * 1024 * 1024; // 10MB for images
        } else if (file.fieldname === 'videos') {
          return 100 * 1024 * 1024; // 100MB for videos
        }
      }
    }
  }).fields([
    { name: 'images', maxCount: 10 }, // Max 10 images
    { name: 'videos', maxCount: 5 }   // Max 5 videos
  ]);

  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload error'
      });
    }
    next();
  });
};

module.exports = {
  uploadImage,
  uploadVideo,
  uploadMedia
};

