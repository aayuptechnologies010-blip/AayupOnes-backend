const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { connectDB } = require('../config/mongo');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');

async function auditPhase1() {
  await connectDB();
  const usersCount = await User.countDocuments();
  const admin = await User.findOne({ role: 'admin' });
  const attCount = await Attendance.countDocuments();
  const leaveCount = await Leave.countDocuments();

  console.log('=== PHASE 1 LIVE AUDIT ===');
  console.log('Total Users in MongoDB:      ', usersCount);
  console.log('Admin Email in MongoDB:      ', admin ? admin.email : 'NOT FOUND');
  console.log('Admin Role in MongoDB:       ', admin ? admin.role : 'N/A');
  console.log('Attendance Records in DB:    ', attCount);
  console.log('Leave Records in DB:         ', leaveCount);
  process.exit(0);
}

auditPhase1();

