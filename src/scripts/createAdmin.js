/**
 * Production Script to Create / Seed Admin User into MongoDB and Local Store
 * Usage:
 *   node src/scripts/createAdmin.js <email> <password> <name> <employeeId>
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const { connectDB, mongoose } = require('../config/mongo');
const User = require('../models/User');
const { readDb, writeDb } = require('../config/db');

async function createAdminUser() {
  const email = process.argv[2] || 'admin@aayuptechnologies.com';
  const password = process.argv[3] || 'admin@1234';
  const name = process.argv[4] || 'Saurabh Sharma';
  const employeeId = (process.argv[5] || 'AAYUP-ADM-0001').toUpperCase();

  console.log(`\n======================================================`);
  console.log(` 🛡️  AayupOnes HRMS: Provisioning Administrative User`);
  console.log(`======================================================`);
  console.log(`📧 Email:       ${email}`);
  console.log(`🆔 Employee ID: ${employeeId}`);
  console.log(`👤 Name:        ${name}`);

  // Generate secure Bcrypt salt and hash
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const adminData = {
    employeeId: employeeId,
    name: name,
    email: email.toLowerCase(),
    passwordHash: passwordHash,
    role: 'admin',
    designation: 'Head of Operations & IT',
    department: 'Management & Operations',
    joiningDate: '01/01/2025',
    status: 'ACTIVE',
    avatarInitials: name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
    phone: '+91 98765 43210',
    shift: '24/7 Unrestricted',
    isOnDuty: true,
    lastPunchTime: '09:00:00 AM'
  };

  // 1. Save directly into MongoDB
  try {
    await connectDB();
    const mongoUser = await User.findOneAndUpdate(
      { $or: [{ email: email.toLowerCase() }, { employeeId: employeeId }] },
      adminData,
      { upsert: true, returnDocument: 'after' }
    );
    console.log(`🍃 Saved successfully to MongoDB (ID: ${mongoUser._id})`);
  } catch (mongoErr) {
    console.warn(`⚠️  MongoDB Notice: ${mongoErr.message}`);
  }

  // 2. Also save into local high-speed store
  const db = readDb();
  const existingIdx = db.users.findIndex(
    u => u.email.toLowerCase() === email.toLowerCase() || 
         (u.employeeId && u.employeeId.toLowerCase() === employeeId.toLowerCase())
  );

  const recordWithId = {
    id: existingIdx >= 0 ? db.users[existingIdx].id : `usr_adm_${Date.now()}`,
    ...adminData,
    createdAt: new Date().toISOString()
  };

  if (existingIdx >= 0) {
    db.users[existingIdx] = { ...db.users[existingIdx], ...recordWithId };
  } else {
    db.users.unshift(recordWithId);
  }
  writeDb(db);
  console.log(`💾 Saved successfully to High-Speed Database store`);

  console.log(`------------------------------------------------------`);
  console.log(`✅ Admin Created Successfully! Use these credentials:`);
  console.log(`   Employee ID: ${employeeId}`);
  console.log(`   Email:       ${email}`);
  console.log(`   Password:    ${password}`);
  console.log(`   Role:        admin`);
  console.log(`======================================================\n`);

  process.exit(0);
}

createAdminUser().catch(err => {
  console.error('❌ Error creating admin user:', err.message);
  process.exit(1);
});
