const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
require('dotenv').config();

const testPassword = async () => {
  try {
    // Get email and password from command line arguments
    const email = process.argv[2];
    const passwordToTest = process.argv[3];

    if (!email || !passwordToTest) {
      console.log('❌ Usage: node test-password.js <email> <password>');
      console.log('Example: node test-password.js user@example.com myPassword123');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const User = require('./models/User');
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log(`❌ User with email "${email}" not found`);
      process.exit(1);
    }

    console.log('Found user:', user.name);
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    console.log(`\nTesting password: "${passwordToTest}"`);
    
    const isMatch = await bcrypt.compare(passwordToTest, user.password);
    console.log('Password match result:', isMatch);

    if (!isMatch) {
      console.log(`\n⚠️  The password "${passwordToTest}" does NOT match the stored hash.`);
      console.log('User needs to:');
      console.log('1. Remember the correct password they used during registration');
      console.log('2. Use the "Forgot Password" feature to reset their password');
      console.log(`3. Or run: node reset-user-password.js ${email} <new-password>`);
    } else {
      console.log(`\n✅ Password "${passwordToTest}" matches! Login should work.`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

testPassword();
