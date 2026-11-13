/**
 * Interactive CLI Tool to Create Admin User into Dedicated 'admins' Collection
 * User inputs details step-by-step in terminal.
 * Usage:
 *   cd backend
 *   node src/scripts/createAdmin.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const readline = require('readline');
const bcrypt = require('bcryptjs');
const { connectDB, mongoose } = require('../config/mongo');
const Admin = require('../models/Admin');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ask = (query) => new Promise((resolve) => rl.question(query, resolve));

async function runInteractiveCreateAdmin() {
  console.log('\n======================================================');
  console.log('       🛡️  AayupOnes HRMS - Create Dedicated Admin');
  console.log('       (Saved in "admins" collection, NOT employees)');
  console.log('======================================================\n');

  try {
    // 1. Interactive Inputs
    let name = '';
    while (!name) {
      name = (await ask('👤 Admin Full Name: ')).trim();
      if (!name) console.log('   ⚠️ Name is required. Please enter.');
    }

    let email = '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    while (!email || !emailRegex.test(email)) {
      email = (await ask('📧 Admin Email: ')).trim().toLowerCase();
      if (!email || !emailRegex.test(email)) console.log('   ⚠️ Please enter a valid email address.');
    }

    let password = '';
    while (!password || password.length < 6) {
      password = (await ask('🔑 Admin Password (min 6 chars): ')).trim();
      if (!password || password.length < 6) console.log('   ⚠️ Password must be at least 6 characters.');
    }

    const defaultEmpId = `AAYUP-ADM-${Math.floor(1000 + Math.random() * 9000)}`;
    const empIdInput = (await ask(`🆔 Admin ID [Press Enter for ${defaultEmpId}]: `)).trim();
    const employeeId = (empIdInput || defaultEmpId).toUpperCase();

    const designationInput = (await ask('💼 Designation [Press Enter for "Super Administrator"]: ')).trim();
    const designation = designationInput || 'Super Administrator';

    const departmentInput = (await ask('🏢 Department [Press Enter for "Management"]: ')).trim();
    const department = departmentInput || 'Management';

    console.log('\n⏳ Connecting to MongoDB...');
    await connectDB();

    console.log('⏳ Hashing password securely with Bcrypt...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const adminData = {
      employeeId,
      name,
      email,
      passwordHash,
      role: 'admin',
      designation,
      department,
      status: 'ACTIVE',
      avatarInitials: name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
      phone: '+91 98765 43210'
    };

    const mongoAdmin = await Admin.findOneAndUpdate(
      { $or: [{ email: email }, { employeeId: employeeId }] },
      adminData,
      { upsert: true, returnDocument: 'after' }
    );

    console.log('\n======================================================');
    console.log(' 🎉 ADMIN ACCOUNT STORED IN "admins" COLLECTION!');
    console.log('======================================================');
    console.log(` 👤 Name:         ${mongoAdmin.name}`);
    console.log(` 📧 Email:        ${mongoAdmin.email}`);
    console.log(` 🆔 Admin ID:     ${mongoAdmin.employeeId}`);
    console.log(` 💼 Designation:  ${mongoAdmin.designation}`);
    console.log(` 📁 Collection:   admins (Isolated from employees)`);
    console.log(` 🍃 MongoDB _id:  ${mongoAdmin._id}`);
    console.log('======================================================\n');

  } catch (error) {
    console.error('\n❌ Error creating admin:', error.message);
  } finally {
    rl.close();
    await mongoose.disconnect();
    process.exit(0);
  }
}

runInteractiveCreateAdmin();
