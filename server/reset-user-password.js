const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const resetPassword = async () => {
  try {
    // Get email and password from command line arguments
    const email = process.argv[2];
    const newPassword = process.argv[3];

    if (!email || !newPassword) {
      console.log('❌ Usage: node reset-user-password.js <email> <new-password>');
      console.log('Example: node reset-user-password.js user@example.com myNewPass123');
      process.exit(1);
    }

    if (newPassword.length < 6) {
      console.log('❌ Password must be at least 6 characters long');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const User = require('./models/User');
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`❌ User with email "${email}" not found`);
      process.exit(1);
    }

    console.log('Found user:', user.name);
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password directly (bypass pre-save hook)
    await User.updateOne(
      { email },
      { password: hashedPassword }
    );

    console.log(`\n✅ Password has been reset successfully!`);
    console.log('User can now login with:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${newPassword}`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

resetPassword();
