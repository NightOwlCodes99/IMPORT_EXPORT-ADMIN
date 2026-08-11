const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const PendingUser = require('../models/PendingUser');
const Supplier = require('../models/Supplier');
const { ErrorResponse } = require('../middleware/error');
const { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail, sendAdminOTPEmail } = require('../config/email');

// @desc    Register user (sends verification code)
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  
  const { name, email, password, role, phone, company, country } = req.body;

  // Check if user already exists (fully registered)
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    
    return next(new ErrorResponse('An account with this email already exists. Please login instead.', 400));
  }

  // Check if pending registration exists
  let pendingUser = await PendingUser.findOne({ email });
  
  if (pendingUser) {
    
    // Update existing pending registration
    pendingUser.name = name;
    pendingUser.password = password;
    pendingUser.role = role || 'user';
    pendingUser.phone = phone;
    pendingUser.company = company;
    pendingUser.country = country;
  } else {
    
    // Create new pending registration
    pendingUser = await PendingUser.create({
      name,
      email,
      password,
      role: role || 'user',
      phone,
      company,
      country
    });
  }

  // Generate verification code
  const verificationCode = pendingUser.generateVerificationCode();
  await pendingUser.save();

  // Log OTP for development/testing purposes (always show in console)

  // Send verification email (non-blocking in development)
  try {
    
    await sendVerificationEmail(email, name, verificationCode);
    
  } catch (error) {
    
    // In development, continue anyway (OTP is shown in console)
    if (process.env.NODE_ENV !== 'development') {
      
      await PendingUser.findByIdAndDelete(pendingUser._id);
      return next(new ErrorResponse('Unable to send verification email. Please check your email address or try again later.', 500));
    }
    
  }

  // Include OTP in response for development (remove in production)
  const responseData = {
    success: true,
    message: 'Registration successful! Please check your email for verification code.',
    email: pendingUser.email
  };
  
  // Add OTP to response in development mode
  if (process.env.NODE_ENV === 'development') {
    responseData.devOTP = verificationCode;
  }
  
  res.status(201).json(responseData);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  
  const { email, password } = req.body;

  // Validate inputs
  if (!email || !password) {
    
    return next(new ErrorResponse('Please provide email and password', 400));
  }

  // Check if user exists
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    
    // Check if user is in pending state
    const pendingUser = await PendingUser.findOne({ email });
    if (pendingUser) {
      return next(new ErrorResponse('Please verify your email first. Check your inbox for the verification code.', 403));
    }
    return next(new ErrorResponse('Invalid email or password', 401));
  }

  // Block admin users from logging in through the normal login route
  if (user.role === 'admin') {
    
    return next(new ErrorResponse('Invalid email or password', 401));
  }

  // Check if user registered via Google
  if (user.authProvider === 'google' && !user.password) {
    return next(new ErrorResponse('This account was created using Google. Please sign in with Google.', 400));
  }

  // Check if password matches
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next(new ErrorResponse('Invalid email or password', 401));
  }

  // Check if email is verified
  if (!user.isEmailVerified) {
    return next(new ErrorResponse('Please verify your email before logging in. Check your inbox for the verification code.', 403));
  }

  // Check if user is active
  if (!user.isActive) {
    return next(new ErrorResponse('Your account has not been activated. Please contact support.', 403));
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async (req, res, next) => {

  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    company: req.body.company,
    country: req.body.country,
    address: req.body.address,
    city: req.body.city,
    postalCode: req.body.postalCode,
    bio: req.body.bio
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(key => 
    fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
  );

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  }).select('-password');

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: user
  });
});

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {

  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.comparePassword(req.body.currentPassword))) {
    
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse('No user found with that email', 404));
  }

  // Generate reset token
  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Create reset URL
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  try {
    await sendPasswordResetEmail(user.email, user.name, resetUrl);
    
    res.status(200).json({
      success: true,
      message: 'Password reset email sent successfully'
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    
    return next(new ErrorResponse('Email could not be sent', 500));
  }
});

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');
      const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new ErrorResponse('Invalid or expired token', 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password reset successful'
  });
});

// @desc    Verify email with code
// @route   POST /api/auth/verify-email
// @access  Public
exports.verifyEmail = asyncHandler(async (req, res, next) => {
  const { email, code } = req.body;

  // Hash the provided code to compare with stored hash
  const hashedCode = crypto
    .createHash('sha256')
    .update(code)
    .digest('hex');

  // Find pending user with matching code
  const pendingUser = await PendingUser.findOne({
    email,
    verificationCode: hashedCode,
    verificationCodeExpire: { $gt: Date.now() }
  });

  if (!pendingUser) {
    return next(new ErrorResponse('Invalid or expired verification code', 400));
  }

  // Create actual user account
  // Password is already hashed from PendingUser - User model will detect this
  const user = await User.create({
    name: pendingUser.name,
    email: pendingUser.email,
    password: pendingUser.password, // Already hashed, User model will skip re-hashing
    role: pendingUser.role,
    phone: pendingUser.phone,
    company: pendingUser.company,
    country: pendingUser.country,
    isEmailVerified: true,
    isActive: true
  });

  // If user is a supplier, create a Supplier profile
  if (user.role === 'supplier') {
    
    await Supplier.create({
      user: user._id,
      companyName: pendingUser.company || user.name + "'s Business",
      businessType: 'Trading Company',
      country: pendingUser.country || 'Not specified',
      city: 'Not specified',
      verificationStatus: 'pending'
    });
    
  }

  // Delete pending user after successful verification
  await PendingUser.findByIdAndDelete(pendingUser._id);

  // Send welcome email (non-blocking)
  sendWelcomeEmail(user.email, user.name, user.role).catch(err => {
    
  });

  // Send token response for auto-login
  sendTokenResponse(user, 200, res);
});

// @desc    Resend verification code
// @route   POST /api/auth/resend-code
// @access  Public
exports.resendCode = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  // Check if user already verified
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorResponse('Email already verified. Please login.', 400));
  }

  // Find pending user
  const pendingUser = await PendingUser.findOne({ email });

  if (!pendingUser) {
    return next(new ErrorResponse('No pending registration found with this email. Please register first.', 404));
  }

  // Generate new verification code
  const verificationCode = pendingUser.generateVerificationCode();
  await pendingUser.save();

  // Log OTP for development/testing purposes

  // Send verification email
  try {
    await sendVerificationEmail(email, pendingUser.name, verificationCode);
    
    // Include OTP in response for development mode
    const responseData = {
      success: true,
      message: 'Verification code resent successfully'
    };
    
    if (process.env.NODE_ENV === 'development') {
      responseData.devOTP = verificationCode;
    }
    
    res.status(200).json(responseData);
  } catch (error) {
    return next(new ErrorResponse('Unable to send verification email. Please try again.', 500));
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
    data: null
  });
});

// @desc    Google Firebase login
// @route   POST /api/auth/google
// @access  Public
exports.googleLogin = asyncHandler(async (req, res, next) => {

  const { idToken, email, name, photoURL } = req.body;

  if (!email) {
    
    return next(new ErrorResponse('Email is required from Google sign-in', 400));
  }

  // Check if user exists
  let user = await User.findOne({ email });

  if (user) {

    // Block admin users from logging in through Google on the normal route
    if (user.role === 'admin') {
      
      return next(new ErrorResponse('Invalid email or password', 401));
    }

    // User exists - login
    if (!user.isActive) {
      user.isActive = true;
      user.isEmailVerified = true;
      await user.save();
      
    }

    return sendTokenResponse(user, 200, res);
  }

  // Create new user from Google data
  user = await User.create({
    name: name || email.split('@')[0],
    email,
    password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8), // Random password
    role: 'customer',
    avatar: photoURL || '',
    authProvider: 'google',
    isEmailVerified: true,
    isActive: true
  });

  // Send welcome email for first-time Google users (non-blocking)
  sendWelcomeEmail(user.email, user.name, user.role).catch(() => {});

  sendTokenResponse(user, 201, res);
});

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
exports.googleCallback = asyncHandler(async (req, res, next) => {
  // User is authenticated by passport
  const token = req.user.getJWTToken();
  const user = {
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    isVerified: req.user.isVerified,
    isEmailVerified: req.user.isEmailVerified
  };

  // Redirect to frontend with token and user data
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  res.redirect(`${clientUrl}/auth/google/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`);
});

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getJWTToken();

  const options = {
    expires: new Date(
      Date.now() + (process.env.COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        isEmailVerified: user.isEmailVerified
      }
    });
};

// @desc    Get user settings
// @route   GET /api/auth/settings
// @access  Private
exports.getUserSettings = asyncHandler(async (req, res, next) => {

  const user = await User.findById(req.user.id).select('settings');

  res.status(200).json({
    success: true,
    data: user.settings || {}
  });
});

// @desc    Update user settings
// @route   PUT /api/auth/settings
// @access  Private
exports.updateUserSettings = asyncHandler(async (req, res, next) => {

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { settings: req.body },
    { new: true, runValidators: true }
  ).select('settings');

  res.status(200).json({
    success: true,
    message: 'Settings updated successfully',
    data: user.settings
  });
});

// @desc    Admin Login (Hidden Route - Enhanced Security)
// @route   POST /api/auth/admin-secure-portal-2026
// @access  Public
exports.adminLogin = asyncHandler(async (req, res, next) => {
  
  const { email, password } = req.body;

  // Validate inputs
  if (!email || !password) {
    
    return next(new ErrorResponse('Please provide email and password', 400));
  }

  // Check if user exists
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    
    return next(new ErrorResponse('Invalid admin credentials', 401));
  }

  // Check if user is admin
  if (user.role !== 'admin') {
    
    return next(new ErrorResponse('Unauthorized access. Admin privileges required.', 403));
  }

  // Check if password matches
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    
    return next(new ErrorResponse('Invalid admin credentials', 401));
  }

  // Check if user is active
  if (!user.isActive) {
    
    return next(new ErrorResponse('Your admin account has been deactivated. Please contact support.', 403));
  }

  // ========================================
  // OTP VERIFICATION FOR ADMIN LOGIN
  // ========================================
  // Generate OTP
  const otp = user.generateVerificationCode();
  await user.save();

  if (process.env.NODE_ENV === 'development') {
    console.log(`🔐 Admin OTP for ${email}: ${otp}`);
  }

  // Send OTP email
  try {
    await sendAdminOTPEmail(email, user.name, otp);

    const responsePayload = {
      success: true,
      requiresOTP: true,
      message: 'OTP sent to your email. Please verify to continue.',
      email: user.email
    };

    if (process.env.NODE_ENV === 'development') {
      responsePayload.devOTP = otp;
    }

    return res.status(200).json(responsePayload);
  } catch (error) {
    
    // In development, still allow login (OTP is shown in console)
    if (process.env.NODE_ENV === 'development') {
      return res.status(200).json({
        success: true,
        requiresOTP: true,
        message: 'OTP sent (check server console in dev mode)',
        email: user.email,
        devOTP: otp
      });
    }
    return next(new ErrorResponse('Unable to send OTP. Please try again.', 500));
  }
});

// @desc    Verify Admin OTP (For Production Use)
// @route   POST /api/auth/admin-verify-otp
// @access  Public
exports.verifyAdminOTP = asyncHandler(async (req, res, next) => {
  
  const { email, otp } = req.body;

  if (!email || !otp) {
    return next(new ErrorResponse('Please provide email and OTP', 400));
  }

  const user = await User.findOne({ 
    email,
    role: 'admin',
    verificationCode: otp,
    verificationCodeExpire: { $gt: Date.now() }
  });

  if (!user) {
    
    return next(new ErrorResponse('Invalid or expired OTP', 400));
  }

  // Clear OTP
  user.verificationCode = undefined;
  user.verificationCodeExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

