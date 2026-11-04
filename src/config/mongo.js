const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aayupones_hrms';

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 4000, // Quick timeout fallback if local mongo daemon is off
    });

    isConnected = true;
    console.log(`🍃 MongoDB Connected Successfully: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.warn(`⚠️  MongoDB Connection Notice: ${error.message}`);
    console.warn(`ℹ️  Continuing with High-Speed Database Store until MongoDB daemon is started.`);
  }
};

module.exports = { connectDB, mongoose };

