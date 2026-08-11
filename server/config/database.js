const mongoose = require('mongoose');

let isConnected = false;

const connectDatabase = async () => {
  if (isConnected) {
    
    return;
  }

  try {
    const isProduction = process.env.NODE_ENV === 'production';
    const maxPoolSize = parseInt(process.env.MONGO_MAX_POOL_SIZE, 10) || 20;
    const minPoolSize = parseInt(process.env.MONGO_MIN_POOL_SIZE, 10) || 5;

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize,
      minPoolSize,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      autoIndex: !isProduction,
    });

    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      
      isConnected = true;
    });

    // Handle SIGINT separately for mongoose
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        
      } catch (err) {
        console.error('Error closing MongoDB connection:', err.message);
      }
    });

  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    isConnected = false;
    // Don't exit - let the app retry
    
    setTimeout(connectDatabase, 5000);
  }
};

module.exports = connectDatabase;
