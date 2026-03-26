const mongoose = require('mongoose');
const dns = require('dns');

if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

/**
 * Prefer MONGODB_URI; fall back to MONGO_URI (same as seed scripts).
 * Append Atlas-friendly defaults if missing (helps driver + Atlas).
 */
function resolveMongoUri() {
  const raw = (process.env.MONGODB_URI || process.env.MONGO_URI || '').trim();
  if (!raw) return '';
  let uri = raw;
  const hasQuery = uri.includes('?');
  const needsRetry = !/[\?&]retryWrites=/i.test(uri);
  const needsW = !/[\?&]w=/i.test(uri);
  if (needsRetry || needsW) {
    const parts = [];
    if (needsRetry) parts.push('retryWrites=true');
    if (needsW) parts.push('w=majority');
    uri += (hasQuery ? '&' : '?') + parts.join('&');
  }
  return uri;
}

function maskUri(uri) {
  if (!uri) return '(empty)';
  return uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
}

/**
 * Connect to MongoDB database
 * Uses connection string from environment variables
 */
const connectDB = async () => {
  try {
    const mongoUri = resolveMongoUri();
    if (!mongoUri) {
      throw new Error('Set MONGODB_URI or MONGO_URI in .env');
    }

    console.log('🔌 Connecting to MongoDB...');

    const options = {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      family: 4,
      maxPoolSize: 10,
    };

    const conn = await mongoose.connect(mongoUri, options);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🔗 Connection String: ${maskUri(mongoUri)}`);

    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB Connection Error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected successfully');
    });

    return true;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error(`💡 Possible fixes:`);
    console.error(`   1. Check your internet connection`);
    console.error(`   2. Make sure your IP is whitelisted in MongoDB Atlas`);
    console.error(`   3. Try using Google DNS (8.8.8.8) or Cloudflare DNS (1.1.1.1)`);
    console.error(`   4. Check if a VPN or firewall is blocking the connection`);
    console.error(`   5. If password has @ # : etc., URL-encode it in the URI`);
    console.error(`\n⚠️  Server will continue running but database operations will fail until connection is established.`);
  }
};

module.exports = connectDB;
