/**
 * Migration & Seeding Script: Sync all mock data directly into MongoDB
 * Run: node src/scripts/syncMongo.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { connectDB, mongoose } = require('../config/mongo');
const User = require('../models/User');
const Document = require('../models/Document');
const Leave = require('../models/Leave');
const Holiday = require('../models/Holiday');
const Attendance = require('../models/Attendance');
const { readDb } = require('../config/db');

async function syncToMongo() {
  console.log(`\n======================================================`);
  console.log(` 🍃 Syncing AayupOnes Data Directly to MongoDB`);
  console.log(`    Target: ${process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aayupones_hrms'}`);
  console.log(`======================================================`);

  await connectDB();

  const db = readDb();

  // 1. Sync Users
  console.log(`\n👤 Syncing Users (${db.users.length} records)...`);
  for (const u of db.users) {
    await User.findOneAndUpdate(
      { employeeId: u.employeeId },
      {
        employeeId: u.employeeId,
        name: u.name,
        email: u.email.toLowerCase(),
        passwordHash: u.passwordHash,
        role: u.role || 'employee',
        designation: u.designation || 'Team Member',
        department: u.department || 'General',
        joiningDate: u.joiningDate || '02/11/2026',
        status: u.status || 'ACTIVE',
        avatarInitials: u.avatarInitials || 'AP',
        phone: u.phone || '',
        shift: u.shift || '24/7 Unrestricted',
        isOnDuty: u.isOnDuty ?? true,
        lastPunchTime: u.lastPunchTime || '09:00:00 AM'
      },
      { upsert: true, new: true }
    );
    console.log(`   ✓ User synced: [${u.employeeId}] ${u.name} (${u.role})`);
  }

  // 2. Sync Holidays
  console.log(`\n🎉 Syncing Holidays (${db.holidays.length} records)...`);
  for (const h of db.holidays) {
    await Holiday.findOneAndUpdate(
      { name: h.name, date: h.date },
      { name: h.name, date: h.date, day: h.day, type: h.type || 'National', year: 2026 },
      { upsert: true, new: true }
    );
    console.log(`   ✓ Holiday synced: ${h.name} (${h.date})`);
  }

  // 3. Sync Documents
  console.log(`\n📄 Syncing Documents (${db.documents.length} records)...`);
  const adminUser = await User.findOne({ role: 'admin' });
  const rahulUser = await User.findOne({ employeeId: 'AAYUP-EMP-2026-37583' }) || adminUser;

  for (const d of db.documents) {
    await Document.findOneAndUpdate(
      { title: d.title, employeeId: rahulUser ? rahulUser.employeeId : 'AAYUP-EMP-2026-37583' },
      {
        userId: rahulUser ? rahulUser._id : new mongoose.Types.ObjectId(),
        employeeId: rahulUser ? rahulUser.employeeId : 'AAYUP-EMP-2026-37583',
        type: d.type,
        profileMode: d.profileMode || 'All',
        category: d.category,
        title: d.title,
        fileName: d.fileName,
        uploadDate: d.uploadDate,
        status: d.status,
        allowDownload: d.allowDownload ?? false
      },
      { upsert: true, new: true }
    );
    console.log(`   ✓ Document synced: [${d.type}] ${d.title}`);
  }

  // 4. Sync Leaves
  console.log(`\n🌴 Syncing Leaves (${db.leaves.length} records)...`);
  for (const l of db.leaves) {
    await Leave.findOneAndUpdate(
      { reason: l.reason, fromDate: l.fromDate },
      {
        userId: rahulUser ? rahulUser._id : new mongoose.Types.ObjectId(),
        employeeId: rahulUser ? rahulUser.employeeId : 'AAYUP-EMP-2026-37583',
        employeeName: l.userName || 'Rahul Verma',
        leaveType: l.leaveType,
        fromDate: l.fromDate,
        toDate: l.toDate,
        session: l.session || 'Full Day',
        days: l.days || 1.0,
        reason: l.reason,
        status: l.status || 'PENDING',
        appliedOn: l.appliedOn || '2026-11-02'
      },
      { upsert: true, new: true }
    );
    console.log(`   ✓ Leave synced: ${l.leaveType} (${l.days} days)`);
  }

  console.log(`\n======================================================`);
  console.log(` 🎉 All Collections Successfully Synced to MongoDB!`);
  console.log(`======================================================\n`);
  process.exit(0);
}

syncToMongo().catch(err => {
  console.error('❌ MongoDB sync error:', err.message);
  process.exit(1);
});

