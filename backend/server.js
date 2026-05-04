const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

const rootEnvPath = path.join(__dirname, '..', '.env');
const backendEnvPath = path.join(__dirname, '.env');

// Primary: project root (same folder as package.json)
dotenv.config({ path: rootEnvPath });

/**
 * If root .env leaves a key blank, fill it from backend/.env (some editors open that file by mistake).
 * Does not overwrite non-empty values from root.
 */
function mergeBackendEnvForEmptyKeys() {
  try {
    if (!fs.existsSync(backendEnvPath)) return;
    const parsed = dotenv.parse(fs.readFileSync(backendEnvPath));
    for (const [key, val] of Object.entries(parsed)) {
      const cur = process.env[key];
      if (cur !== undefined && String(cur).trim() !== '') continue;
      if (val === undefined || String(val).trim() === '') continue;
      process.env[key] = val;
    }
  } catch (e) {
    console.warn('[env] Could not merge backend/.env:', e.message);
  }
}

mergeBackendEnvForEmptyKeys();

if (!process.env.MONGODB_URI && !process.env.MONGO_URI) {
  dotenv.config();
}

const { getApiKey, maskApiKeyForLog, providerLabel } = require('./services/grokClient');
const llmKeyRaw = getApiKey();
const llmKeyLen = llmKeyRaw.length;
if (!llmKeyLen) {
  console.warn(
    `[env] Chat AI disabled: set GROQ_API_KEY (Groq, gsk_…) and/or XAI_API_KEY (xai-…) in:\n` +
      `    ${rootEnvPath}\n` +
      `    (Groq key is used first if GROQ_API_KEY is set.)`
  );
} else {
  console.log(
    `[env] ${providerLabel(llmKeyRaw)} API key loaded (${llmKeyLen} chars, fingerprint ${maskApiKeyForLog(llmKeyRaw)})`
  );
  console.log(`[env] Resolved .env file: ${rootEnvPath}`);
}

const dns = require('dns');
// Helps Node resolve mongodb+srv on some Windows/network setups (querySrv issues)
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const os = require('os');
const connectDB = require('./config/db');

// Initialize Express app
const app = express();

// Connect to MongoDB
const mongoose = require('mongoose');
let isDBConnected = false;

// Helper function to check connection state
const checkConnectionState = () => {
  return mongoose.connection.readyState === 1; // 1 = connected
};

// Set up connection state tracking
mongoose.connection.on('connected', () => {
  isDBConnected = true;
  console.log('✅ MongoDB connection established');
});

mongoose.connection.on('disconnected', () => {
  isDBConnected = false;
  console.warn('⚠️  MongoDB connection lost');
});

// Check initial connection state (in case connection happens synchronously)
isDBConnected = checkConnectionState();

// Connect to MongoDB (async, but don't await to allow server to start)
connectDB().then(() => {
  isDBConnected = checkConnectionState();
}).catch(() => {
  isDBConnected = false;
});

// CORS configuration - Allow multiple origins for development
const extraOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:5173', // Vite default port
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  ...extraOrigins,
].filter(Boolean); // Remove undefined values

/** True for typical LAN/dev URLs so the SPA works when opened via machine IP (e.g. phone on same Wi‑Fi). */
function isLikelyDevLanOrigin(origin) {
  try {
    const u = new URL(origin);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;
    const h = u.hostname;
    if (h === 'localhost' || h === '127.0.0.1') return true;
    if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(h)) return true;
    if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(h)) return true;
    if (/^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(h)) return true;
  } catch {
    return false;
  }
  return false;
}

const corsRelaxedForDev = process.env.NODE_ENV !== 'production';

// CORS middleware - apply before static files
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    // Non-production: allow same-machine + LAN browser origins (Vite on :3000, etc.)
    if (corsRelaxedForDev && isLikelyDevLanOrigin(origin)) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve static files from uploads directory with explicit CORS middleware
app.use('/uploads', (req, res, next) => {
  // Set CORS headers explicitly
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Expose-Headers', 'Content-Type');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware
// Configure helmet to allow CORS for static files
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
})); // Security headers

// Increase body parser limit for profile pictures and media (base64 images can be large)
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies - increased limit for images
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies

// Request logging middleware (for debugging)
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path} - ${new Date().toLocaleTimeString()}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Manzil API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Manzil API',
    version: '1.0.0',
    description: 'Smart Career Counseling & University Guidance Portal'
  });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/saved-universities', require('./routes/savedUniversityRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/universities', require('./routes/universityRoutes'));
app.use('/api/community', require('./routes/communityRoutes'));
app.use('/api/programs', require('./routes/programRoutes'));
app.use('/api/degree-scope', require('./routes/degreeScopeRoutes'));
app.use('/api/assessment', require('./routes/assessmentRoutes'));
app.use('/api/chatbot', require('./routes/chatbotRoutes'));
app.use('/api/merit', require('./routes/meritRoutes'));
app.use('/api/comparison', require('./routes/comparisonRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// 404 Handler - Route not found
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  console.error(err.stack);
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Backup scheduler - runs every 10 minutes
const performBackup = async () => {
  // Check if MongoDB is connected before attempting backup
  const isConnected = checkConnectionState();
  if (!isConnected) {
    console.log('⏳ Skipping backup - MongoDB not connected yet');
    return;
  }

  try {
    const Settings = require('./models/Settings');
    const settings = await Settings.getSettings();
    settings.lastBackup = new Date();
    await settings.save();
    console.log(`💾 Backup timestamp updated: ${settings.lastBackup.toLocaleString()}`);
  } catch (error) {
    console.error(`❌ Backup timestamp update failed: ${error.message}`);
  }
};

function getLanIpv4s() {
  const nets = os.networkInterfaces();
  const out = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      const v4 = net.family === 'IPv4' || net.family === 4;
      if (v4 && !net.internal) out.push(net.address);
    }
  }
  return out;
}

// Start server — listen on all interfaces so phones / other PCs on the LAN can reach the API
const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.HOST || '0.0.0.0';
const server = app.listen(PORT, HOST, () => {
  console.log(`\n🚀 Manzil Server is running on ${HOST}:${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 API URL (this machine): http://localhost:${PORT}`);
  const lan = getLanIpv4s();
  if (lan.length) {
    console.log(`🌐 API URL (LAN): ${lan.map((ip) => `http://${ip}:${PORT}`).join(' · ')}`);
  }
  console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
  
  // Wait for MongoDB connection before performing initial backup
  const waitForConnection = async () => {
    let attempts = 0;
    const maxAttempts = 30; // Wait up to 30 seconds (30 * 1 second)
    
    while (!checkConnectionState() && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      attempts++;
    }
    
    if (checkConnectionState()) {
      performBackup();
    } else {
      console.log('⏳ Initial backup delayed - MongoDB connection pending');
    }
  };
  
  waitForConnection();
  
  // Schedule backups every 10 minutes (600000 ms)
  setInterval(performBackup, 10 * 60 * 1000);
  console.log(`💾 Automatic backups scheduled every 10 minutes\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

