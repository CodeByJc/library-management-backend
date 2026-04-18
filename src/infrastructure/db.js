const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    console.log("connection started")
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('Missing MONGO_URI (or MONGODB_URI)');
    }
    await mongoose.connect(mongoUri)
    logger.info('MongoDB Connected successfully');
  } catch (error) {
    logger.error('MongoDB connection error', error);
    process.exit(1);
  }
};

module.exports = connectDB;
