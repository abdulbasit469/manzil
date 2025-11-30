const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Test Schema for Basit folder
const basitTestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  testData: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  connectionTest: {
    type: Boolean,
    default: true
  }
}, {
  collection: 'basit_test_collection' // Collection name with "basit"
});

const BasitTest = mongoose.model('BasitTest', basitTestSchema);

async function testConnection() {
  try {
    console.log('🔌 Attempting to connect to MongoDB Atlas...');
    console.log(`📍 Connection String: ${process.env.MONGODB_URI ? process.env.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') : 'Not found'}\n`);

    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected Successfully!`);
    console.log(`🌐 Host: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🔗 Connection State: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}\n`);

    // Create dummy data
    console.log('📝 Creating dummy test data...');
    
    const testData = {
      name: 'Basit Test Data',
      testData: 'This is a test document to verify MongoDB Atlas connection is working properly.',
      connectionTest: true
    };

    // Insert test document
    const result = await BasitTest.create(testData);
    console.log(`✅ Test document created successfully!`);
    console.log(`📄 Document ID: ${result._id}`);
    console.log(`📅 Created at: ${result.timestamp}\n`);

    // Verify by reading it back
    console.log('🔍 Verifying data by reading it back...');
    const retrievedData = await BasitTest.findById(result._id);
    
    if (retrievedData) {
      console.log('✅ Data retrieved successfully!');
      console.log(`📋 Document Details:`);
      console.log(`   - Name: ${retrievedData.name}`);
      console.log(`   - Test Data: ${retrievedData.testData}`);
      console.log(`   - Connection Test: ${retrievedData.connectionTest}`);
      console.log(`   - Timestamp: ${retrievedData.timestamp}\n`);
    }

    // Count documents in collection
    const count = await BasitTest.countDocuments();
    console.log(`📊 Total documents in 'basit_test_collection': ${count}\n`);

    // List all documents
    console.log('📚 All documents in basit_test_collection:');
    const allDocs = await BasitTest.find().sort({ timestamp: -1 });
    allDocs.forEach((doc, index) => {
      console.log(`   ${index + 1}. ${doc.name} - ${doc.timestamp}`);
    });

    console.log('\n✅ Connection test completed successfully!');
    console.log('🎉 MongoDB Atlas connection is working perfectly!\n');

    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Connection closed.');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Connection Test Failed!');
    console.error(`Error: ${error.message}\n`);
    
    if (error.message.includes('authentication failed')) {
      console.error('💡 Tip: Check your MongoDB Atlas username and password.');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error('💡 Tip: Check your internet connection and MongoDB Atlas cluster URL.');
    } else if (error.message.includes('IP')) {
      console.error('💡 Tip: Add your IP address to MongoDB Atlas Network Access whitelist.');
      console.error('   Go to: MongoDB Atlas → Network Access → Add IP Address');
    } else {
      console.error('💡 Tip: Check your connection string in .env file.');
    }
    
    process.exit(1);
  }
}

// Run the test
testConnection();

