const express = require('express');
const {
  getMe,
  updateDetails,
  updatePassword,
  logout,
  adminLogin,
  verifyAdminOTP
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate, loginValidation } = require('../middleware/validation');

const router = express.Router();

// Admin Authentication (Hidden Endpoints)
router.post('/admin', loginValidation, validate, adminLogin);
router.post('/admin-verify-otp', verifyAdminOTP);

// Protected routes (admin)
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);

module.exports = router;
