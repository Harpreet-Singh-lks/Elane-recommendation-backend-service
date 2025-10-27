const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Simple local connection - no environment variables needed
    await mongoose.connect('mongodb://127.0.0.1:27017/elara-outfits');
    console.log('✅ MongoDB connected to local database');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    console.log('💡 Make sure MongoDB is running: brew services start mongodb-community');
    process.exit(1);
  }
};

module.exports = connectDB;