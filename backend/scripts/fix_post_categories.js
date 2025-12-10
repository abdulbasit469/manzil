const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Post = require('../models/Post');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function fixPostCategories() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Category normalization map
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
      'Admissions': 'Admissions',
      'study abroad': 'Admissions',
      'Study Abroad': 'Admissions'
    };

    // Get all posts
    const posts = await Post.find({});
    console.log(`\n📊 Found ${posts.length} post(s) to check`);

    let totalFixed = 0;
    const fixedPosts = [];

    for (const post of posts) {
      const currentCategory = post.category;
      const normalizedCategory = categoryMap[currentCategory] || categoryMap[currentCategory?.toLowerCase()];
      
      if (normalizedCategory && currentCategory !== normalizedCategory) {
        post.category = normalizedCategory;
        await post.save();
        fixedPosts.push({
          id: post._id,
          title: post.title,
          old: currentCategory,
          new: normalizedCategory
        });
        totalFixed++;
      }
    }

    if (totalFixed > 0) {
      console.log(`\n🔄 Fixed ${totalFixed} post(s):`);
      fixedPosts.forEach((fp, index) => {
        console.log(`   ${index + 1}. "${fp.title}" - "${fp.old}" → "${fp.new}"`);
      });
    } else {
      console.log('\n✅ All posts already have correct category format');
    }

    await mongoose.connection.close();
    console.log('\n✅ Category fix completed successfully!');
  } catch (error) {
    console.error('❌ Error fixing categories:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the fix
fixPostCategories();

