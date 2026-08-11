const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

const seedUsers = async () => {
  try {
    await connectDB();

    const usersToSeed = [
      {
        name: 'Admin User',
        email: 'jsheta15@gmail.com',
        password: '12345678',
        role: 'admin',
        adminRole: 'super-admin',
        phone: '+1234567890',
        company: 'Nexarion Global Exports',
        country: 'India',
        isActive: true,
        isVerified: true,
        isEmailVerified: true
      },
      {
        name: 'Test User',
        email: '23se02cs114@ppsu.ac.in',
        password: '12345678',
        role: 'user',
        phone: '+9876543210',
        company: 'PPSU',
        country: 'India',
        isActive: true,
        isVerified: true,
        isEmailVerified: true
      }
    ];

    console.log('\n🌱 ===== SEEDING USERS =====\n');

    for (const userData of usersToSeed) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        console.log(`⚠️  User already exists: ${userData.email}`);
        
        // Update user data
        existingUser.role = userData.role;
        existingUser.adminRole = userData.adminRole || null;
        existingUser.isActive = true;
        existingUser.isVerified = true;
        existingUser.isEmailVerified = true;
        
        // Update password
        const salt = await bcrypt.genSalt(10);
        existingUser.password = await bcrypt.hash(userData.password, salt);
        
        await existingUser.save();
        console.log(`✅ Updated: ${userData.email} (Role: ${userData.role})\n`);
      } else {
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        // Create new user
        const newUser = await User.create({
          ...userData,
          password: hashedPassword
        });

        console.log(`✅ Created: ${userData.email}`);
        console.log(`   Role: ${userData.role}`);
        console.log(`   ID: ${newUser._id}\n`);
      }
    }

    console.log('🎉 ===== SEEDING COMPLETE =====\n');
    console.log('Login Credentials:');
    console.log('------------------');
    console.log('Admin:');
    console.log('  Email: jsheta15@gmail.com');
    console.log('  Password: 12345678');
    console.log('\nUser:');
    console.log('  Email: 23se02cs114@ppsu.ac.in');
    console.log('  Password: 12345678');
    console.log('------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();
