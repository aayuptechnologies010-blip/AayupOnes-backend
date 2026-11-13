const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { connectDB } = require('../config/mongo');
const User = require('../models/User');

async function checkNames() {
  await connectDB();
  const users = await User.find();
  console.log(users.map(u => ({ id: u.employeeId, name: u.name, email: u.email, role: u.designation })));
  process.exit(0);
}

checkNames();

