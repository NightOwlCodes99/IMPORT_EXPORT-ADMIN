const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/import_export_local_db', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to DB');
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('No admin found');
    } else {
      console.log('Admin:', admin.email);
      console.log('Current OTP:', admin.verificationCode);
      console.log('OTP Expire:', admin.verificationCodeExpire);
      console.log('Is Expired?', admin.verificationCodeExpire < Date.now());
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
