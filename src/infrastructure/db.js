const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    console.log("connection started")
    await mongoose.connect(process.env.MONGODB_URI)
    logger.info('MongoDB Connected successfully');
  } catch (error) {
    logger.error('MongoDB connection error', error);
    process.exit(1);
  }
};

module.exports = connectDB;
