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

const createAdminUser = async () => {
  try {
    await connectDB();

    const adminUsers = [
      {
        name: 'Admin User',
        email: 'jsheta15@gmail.com',
        password: '12345678',
        phone: '+1234567890',
        company: 'Nexarion Global Exports',
        country: 'India',
        role: 'admin',
        adminRole: 'super-admin'
      },
      {
        name: 'Nexarion Admin',
        email: 'nexarionglobalexports@gmail.com',
        password: '12345678',
        phone: '+1234567890',
        company: 'Nexarion Global Exports',
        country: 'India',
        role: 'admin',
        adminRole: 'super-admin'
      },
      {
        name: 'Super Admin',
        email: 'admin@nexarion.com',
        password: 'Password123!',
        phone: '+1234567890',
        company: 'Nexarion Global Exports',
        country: 'United States',
        role: 'admin',
        adminRole: 'super-admin'
      }
    ];

    console.log('\n🔐 ===== CREATING/UPDATING ADMIN USERS =====\n');

    for (const adminData of adminUsers) {
      // Check if admin already exists
      const existingAdmin = await User.findOne({ email: adminData.email }).select('+password');
      
      if (existingAdmin) {
        console.log(`⚠️  Admin user already exists: ${adminData.email}`);
        
        // Force update password and role
        existingAdmin.password = adminData.password;
        existingAdmin.name = adminData.name;
        existingAdmin.role = 'admin';
        existingAdmin.adminRole = 'super-admin';
        existingAdmin.isActive = true;
        existingAdmin.isVerified = true;
        existingAdmin.isEmailVerified = true;
        existingAdmin.authProvider = 'local';
        await existingAdmin.save();
        console.log(`✅ Admin user updated: ${existingAdmin.email}`);
        console.log(`🔑 Password: ${adminData.password}\n`);
      } else {
        // Create new admin user
        const admin = await User.create({
          ...adminData,
          role: 'admin',
          adminRole: 'super-admin',
          isActive: true,
          isVerified: true,
          isEmailVerified: true,
          authProvider: 'local'
        });

        console.log('🎉 Admin user created successfully!');
        console.log('📧 Email:', admin.email);
        console.log('🔑 Password:', adminData.password);
        console.log('👤 Name:', admin.name);
        console.log('🛡️  Role:', admin.role);
        console.log('👑 Admin Role:', admin.adminRole);
        console.log('');
      }
    }

    console.log('==========================================');
    console.log('✅ All admin users processed successfully!');
    console.log('==========================================');
    console.log('\n🔐 Available Admin Logins:');
    console.log('1. Email: jsheta15@gmail.com | Password: 12345678');
    console.log('2. Email: nexarionglobalexports@gmail.com | Password: 12345678');
    console.log('3. Email: admin@nexarion.com | Password: Password123!');
    console.log('\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
};

// Run the script
createAdminUser();
