const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const xss = require('xss');
const hpp = require('hpp');
const fileUpload = require('express-fileupload');
const session = require('express-session');
const mongoose = require('mongoose');
const passport = require('./config/passport');
const connectDB = require('./config/database');
const { errorHandler } = require('./middleware/error');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Security middleware
app.use(helmet());
app.use(compression()); // Compress all responses
app.use(mongoSanitize());
app.use(hpp());

// Session middleware (required for passport)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Rate limiting - more generous limits for normal usage
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // increased limit for admin dashboards with many API calls
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for admin routes (they make many calls)
    return req.path.startsWith('/api/admin');
  }
});
app.use('/api/', limiter);

// Stripe webhook needs raw body - must be before express.json()
app.use('/api/payments/stripe/webhook', express.raw({ type: 'application/json' }));

// Body parser middleware with limits to prevent memory issues
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// File upload
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// CORS - Allow requests from frontend
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://nexarionimpex.com',
  'https://www.nexarionimpex.com',
  "https://nexarion-production-f.vercel.app",
  "https://nexarion-development.vercel.app",
  'https://main.d3ry7pqpwswyf4.amplifyapp.com',

  'https://nexarion-production.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Allow all localhost origins in development
    if (process.env.NODE_ENV === 'development' && origin.startsWith('http://localhost')) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list or is a Vercel preview URL
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS' , 'HEADERS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
};

// Handle preflight requests BEFORE rate limiter
app.options('*', cors(corsOptions));

// Apply CORS
app.use(cors(corsOptions));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); 
}

// Routes
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'Nexarion Admin Panel API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      admin: '/api/admin',
      users: '/api/users',
      products: '/api/products',
      categories: '/api/categories',
      orders: '/api/orders',
      quotes: '/api/quotes',
      payments: '/api/payments',
      shipments: '/api/shipments',
      notifications: '/api/notifications',
      reports: '/api/reports',
      inventory: '/api/inventory',
      supportTickets: '/api/support-tickets',
      catalogs: '/api/catalogs',
      siteStats: '/api/site-stats'
    }
  });
});

// Mount routers - Admin Only
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/quotes', require('./routes/quoteRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/shipments', require('./routes/shipmentRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/admin/brands', require('./routes/brandRoutes'));
app.use('/api/support-tickets', require('./routes/supportTicketRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/catalogs', require('./routes/catalogRoutes'));
app.use('/api/site-stats', require('./routes/siteStatsRoutes'));

// Error handler middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`✅ Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);

  // Initialize report scheduler
  const { initScheduler } = require('./utils/reportScheduler');
  initScheduler();
});

// Configure server timeouts to prevent hanging connections
server.keepAliveTimeout = 65000; // Slightly higher than typical load balancer timeout
server.headersTimeout = 66000; // Slightly higher than keepAliveTimeout

// Memory monitoring - log memory usage every 5 minutes
setInterval(() => {
  const used = process.memoryUsage();
  
}, 5 * 60 * 1000);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  if (err.stack) console.error(err.stack);
  // Don't exit - just log the error to keep server running
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`❌ Uncaught Exception: ${err.message}`);
  if (err.stack) console.error(err.stack);
  // In development, log but don't exit
  // In production, gracefully restart
  if (process.env.NODE_ENV === 'production') {
    
    server.close(() => {
      process.exit(1);
    });
  }
});

// Increase max listeners to prevent warnings
process.setMaxListeners(20);
require('events').EventEmitter.defaultMaxListeners = 20;

// Graceful shutdown
process.on('SIGTERM', () => {
  
  server.close(() => {
    
    mongoose.connection.close();
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  
  server.close(() => {
    
    mongoose.connection.close();
    process.exit(0);
  });
});
