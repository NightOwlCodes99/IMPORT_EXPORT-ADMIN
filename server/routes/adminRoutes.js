const express = require('express');
const router = express.Router();
const {
  getAdminDashboardOverview,
  getAllUsers,
  getUserById,
  createAdminUser,
  updateUser,
  deleteUser,
  toggleUserActive,
  getAllOrders,
  getOrderStats,
  getOrderById,
  updateOrderStatus,
  createOrder,
  deleteOrder,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  approveProduct,
  rejectProduct,
  toggleProductActive,
  toggleProductFeatured,
  getProductStats,
  uploadProductImage,
  createAdminProduct,
  getAllQuotes,
  getQuoteStats,
  getQuoteById,
  updateQuoteStatus,
  sendQuoteResponse,
  assignQuote,
  deleteQuote,
  convertQuoteToOrder,
  contactBuyer,
  adminAcceptQuote,
  createAdminQuote,
  getAllShipments,
  getAllContacts,
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  approveSupplier,
  rejectSupplier,
  getAllPayments,
  getSystemStats
} = require('../controllers/adminController');
const { protect, requireAdmin } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(protect);
router.use(requireAdmin);

// Dashboard
router.get('/dashboard/overview', getAdminDashboardOverview);
router.get('/stats', getSystemStats);

// User Management
router.get('/users', getAllUsers);
router.post('/users', createAdminUser);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/toggle-active', toggleUserActive);

// Suppliers Management
router.get('/suppliers', getAllSuppliers);
router.get('/suppliers/:id', getSupplierById);
router.post('/suppliers', createSupplier);
router.put('/suppliers/:id/approve', approveSupplier);
router.put('/suppliers/:id/reject', rejectSupplier);

// Orders Management
router.get('/orders/stats', getOrderStats);
router.get('/orders', getAllOrders);
router.post('/orders', createOrder);
router.get('/orders/:id', getOrderById);
router.put('/orders/:id/status', updateOrderStatus);
router.delete('/orders/:id', deleteOrder);

// Products Management
router.post('/products/upload-image', uploadProductImage);
router.post('/products', createAdminProduct);
router.get('/products', getAllProducts);
router.get('/products/stats', getProductStats);
router.get('/products/:id', getProductById);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.put('/products/:id/approve', approveProduct);
router.put('/products/:id/reject', rejectProduct);
router.patch('/products/:id/toggle-active', toggleProductActive);
router.patch('/products/:id/toggle-featured', toggleProductFeatured);

// Payments Management
router.get('/payments', getAllPayments);

// Quotes Management
router.get('/quotes/stats', getQuoteStats);
router.get('/quotes', getAllQuotes);
router.post('/quotes', createAdminQuote);
router.get('/quotes/:id', getQuoteById);
router.patch('/quotes/:id/status', updateQuoteStatus);
router.post('/quotes/:id/respond', sendQuoteResponse);
router.post('/quotes/:id/accept', adminAcceptQuote);
router.patch('/quotes/:id/assign', assignQuote);
router.post('/quotes/:id/convert-to-order', convertQuoteToOrder);
router.post('/quotes/:id/contact-buyer', contactBuyer);
router.delete('/quotes/:id', deleteQuote);

// Shipments Management
router.get('/shipments', getAllShipments);

// Contact Submissions
router.get('/contacts', getAllContacts);

module.exports = router;
