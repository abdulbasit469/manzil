const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 * Uses connection string from environment variables
 */
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    console.log('🔌 Connecting to MongoDB...');
    
    // Connection options to help with DNS timeout issues
    const options = {
      serverSelectionTimeoutMS: 30000,  // Increase timeout to 30 seconds
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,  // Connection timeout
      family: 4,  // Force IPv4 (helps with DNS issues)
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🔗 Connection String: ${process.env.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);

    // Handle connection events (these will work even if set up after connection)
    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB Connection Error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected successfully');
    });

    // Return connection state
    return true;

  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error(`💡 Possible fixes:`);
    console.error(`   1. Check your internet connection`);
    console.error(`   2. Make sure your IP is whitelisted in MongoDB Atlas`);
    console.error(`   3. Try using Google DNS (8.8.8.8) or Cloudflare DNS (1.1.1.1)`);
    console.error(`   4. Check if a VPN or firewall is blocking the connection`);
    console.error(`\n⚠️  Server will continue running but database operations will fail until connection is established.`);
    // Don't exit - let the server run and attempt reconnection
  }
};

module.exports = connectDB;










