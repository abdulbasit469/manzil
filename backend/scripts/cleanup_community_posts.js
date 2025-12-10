const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function cleanupCommunityPosts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get the newest post
    const newestPost = await Post.findOne().sort({ createdAt: -1 });
    
    if (!newestPost) {
      console.log('ℹ️  No posts found in database');
      await mongoose.connection.close();
      return;
    }

    console.log(`\n📌 Keeping newest post: "${newestPost.title}" (ID: ${newestPost._id})`);
    console.log(`   Created at: ${newestPost.createdAt}`);

    // Update all "Study Abroad" posts to "Admissions"
    const updateStudyAbroad = await Post.updateMany(
      { category: 'Study Abroad' },
      { $set: { category: 'Admissions' } }
    );
    
    if (updateStudyAbroad.modifiedCount > 0) {
      console.log(`\n🔄 Updated ${updateStudyAbroad.modifiedCount} post(s) from "Study Abroad" to "Admissions"`);
    }

    // Fix category case issues (normalize to proper case)
    const categoryMap = {
      'general': 'General',
      'General': 'General',
      'test preparation': 'Test Preparation',
      'Test Preparation': 'Test Preparation',
      'universities': 'Universities',
      'Universities': 'Universities',
      'scholarships': 'Scholarships',
      'Scholarships': 'Scholarships',
      'admissions': 'Admissions',
      'Admissions': 'Admissions'
    };

    let totalFixed = 0;
    for (const [wrongCase, correctCase] of Object.entries(categoryMap)) {
      if (wrongCase !== correctCase) {
        const fixed = await Post.updateMany(
          { category: wrongCase },
          { $set: { category: correctCase } }
        );
        if (fixed.modifiedCount > 0) {
          console.log(`\n🔄 Fixed ${fixed.modifiedCount} post(s) from "${wrongCase}" to "${correctCase}"`);
          totalFixed += fixed.modifiedCount;
        }
      }
    }

    if (totalFixed > 0) {
      console.log(`\n✅ Total category case fixes: ${totalFixed} post(s)`);
    }

    // Find all posts except the newest one
    const postsToDelete = await Post.find({
      _id: { $ne: newestPost._id }
    });

    if (postsToDelete.length === 0) {
      console.log('\n✅ No posts to delete. Only the newest post exists.');
      await mongoose.connection.close();
      return;
    }

    console.log(`\n🗑️  Found ${postsToDelete.length} post(s) to delete:`);
    postsToDelete.forEach((post, index) => {
      console.log(`   ${index + 1}. "${post.title}" (ID: ${post._id})`);
    });

    // Get all post IDs to delete
    const postIdsToDelete = postsToDelete.map(post => post._id);

    // Delete all comments associated with posts to be deleted
    const deletedComments = await Comment.deleteMany({
      post: { $in: postIdsToDelete }
    });
    console.log(`\n🗑️  Deleted ${deletedComments.deletedCount} comment(s) associated with old posts`);

    // Delete all posts except the newest one
    const deleteResult = await Post.deleteMany({
      _id: { $in: postIdsToDelete }
    });

    console.log(`\n✅ Successfully deleted ${deleteResult.deletedCount} post(s)`);
    console.log(`\n📊 Summary:`);
    console.log(`   - Posts kept: 1`);
    console.log(`   - Posts deleted: ${deleteResult.deletedCount}`);
    console.log(`   - Comments deleted: ${deletedComments.deletedCount}`);
    console.log(`   - Study Abroad → Admissions: ${updateStudyAbroad.modifiedCount}`);
    console.log(`   - Category case fixes: ${totalFixed}`);

    await mongoose.connection.close();
    console.log('\n✅ Cleanup completed successfully!');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the cleanup
cleanupCommunityPosts();

