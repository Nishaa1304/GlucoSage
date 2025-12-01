/**
 * Seed Script to Insert Sample ABHA Users into MongoDB
 * Run: npm run seed:abha
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const sampleUsers = require('./mockData/sampleUsers');

// Load environment variables
dotenv.config();

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m'
};

const seedAbhaUsers = async () => {
  try {
    console.log(`${colors.cyan}╔═══════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.cyan}║        🏥 ABHA Users Seeding Script              ║${colors.reset}`);
    console.log(`${colors.cyan}╚═══════════════════════════════════════════════════╝${colors.reset}\n`);

    // Connect to MongoDB
    console.log(`${colors.blue}📡 Connecting to MongoDB...${colors.reset}`);
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/glucosage', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`${colors.green}✅ MongoDB Connected Successfully!\n${colors.reset}`);

    // Extract emails from sample users
    const sampleEmails = sampleUsers.map(user => user.email);

    // Delete existing users with same emails
    console.log(`${colors.yellow}🗑️  Deleting existing sample users (if any)...${colors.reset}`);
    const deleteResult = await User.deleteMany({ email: { $in: sampleEmails } });
    console.log(`${colors.yellow}   Deleted ${deleteResult.deletedCount} existing user(s)\n${colors.reset}`);

    // Insert sample users
    console.log(`${colors.blue}📝 Inserting ${sampleUsers.length} sample ABHA users...${colors.reset}`);
    const insertedUsers = await User.insertMany(sampleUsers);
    
    console.log(`${colors.green}✅ Successfully inserted ${insertedUsers.length} users!\n${colors.reset}`);

    // Display inserted users
    console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.cyan}         📋 INSERTED USERS WITH ABHA IDs          ${colors.reset}`);
    console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}\n`);

    insertedUsers.forEach((user, index) => {
      console.log(`${colors.green}${index + 1}. ${user.name}${colors.reset}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🆔 ABHA Number: ${user.abhaNumber}`);
      console.log(`   📬 ABHA Address: ${user.abhaAddress}`);
      console.log(`   👤 Age: ${user.age} | Gender: ${user.gender}`);
      console.log(`   🔗 Linked: ${user.abhaLinked ? 'Yes ✓' : 'No ✗'}`);
      console.log(`   💊 Diagnosis: ${user.diagnosisType}`);
      console.log(`   🗣️  Language: ${user.language === 'hi' ? 'Hindi' : 'English'}`);
      console.log('');
    });

    console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.green}✅ Seeding completed successfully!${colors.reset}`);
    console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}\n`);

    console.log(`${colors.blue}📌 Next Steps:${colors.reset}`);
    console.log(`   1. Test GET /api/users - to fetch all users`);
    console.log(`   2. Test PATCH /api/users/:id/abha - to update ABHA info`);
    console.log(`   3. Use these emails to test login functionality\n`);

    console.log(`${colors.yellow}🔐 Default Password for all users: Test@123${colors.reset}\n`);

  } catch (error) {
    console.error(`${colors.red}❌ Error seeding ABHA users:${colors.reset}`, error.message);
    console.error(error);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log(`${colors.blue}📡 MongoDB connection closed${colors.reset}`);
    process.exit(0);
  }
};

// Run the seed function
seedAbhaUsers();
