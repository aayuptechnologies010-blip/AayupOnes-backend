const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { connectDB } = require('../config/mongo');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');

async function auditPhase3() {
  await connectDB();
  
  // 1. Audit Leaves & Approvals
  const leaves = await Leave.find({});
  console.log('=== PHASE 3: LEAVE ENGINE & TIME ATTENDANCE AUDIT ===');
  console.log('Total Leave Applications in MongoDB:', leaves.length);
  
  leaves.forEach((l, i) => {
    console.log(`\n[Leave ${i + 1}] Employee: ${l.employeeName} (${l.employeeId})`);
    console.log(`    Type: ${l.leaveType} | Status: ${l.status}`);
    console.log(`    Dates: ${l.fromDate} to ${l.toDate} (${l.days} days)`);
    console.log(`    Reason: ${l.reason}`);
  });

  // 2. Audit Attendance Logs
  const attendances = await Attendance.find({});
  console.log('\n--- Real-Time Attendance Punches in MongoDB: ' + attendances.length + ' ---');
  attendances.forEach((a, i) => {
    console.log(`[Punch ${i + 1}] EmpId: ${a.employeeId} | Date: ${a.date} | In: ${a.checkInTime} | Out: ${a.checkOutTime || 'Active'} | Status: ${a.status} | Mode: ${a.workMode || 'Office'}`);
  });

  process.exit(0);
}

auditPhase3();

