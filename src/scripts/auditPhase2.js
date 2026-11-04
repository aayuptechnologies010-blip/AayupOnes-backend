const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { connectDB } = require('../config/mongo');
const User = require('../models/User');

async function auditPhase2() {
  await connectDB();
  
  // 1. Check all users in MongoDB
  const users = await User.find({}).select('fullName email employeeId department designation status onboardingDetails');
  console.log('=== PHASE 2: WORKFORCE REGISTRY & ONBOARDING AUDIT ===');
  console.log('Total Registered Employees in MongoDB:', users.length);
  
  users.forEach((u, i) => {
    console.log(`\n[${i + 1}] ${u.fullName} (${u.employeeId})`);
    console.log(`    Dept: ${u.department} | Role: ${u.designation} | Status: ${u.status}`);
    const ob = u.onboardingDetails || {};
    const sections = Object.keys(ob);
    console.log(`    Onboarding Sections Recorded: ${sections.length > 0 ? sections.join(', ') : 'Direct Admin Provisioned'}`);
  });

  // 2. Check counts for the cards
  const total = await User.countDocuments();
  const active = await User.countDocuments({ status: 'ACTIVE' });
  const underReview = await User.countDocuments({ status: 'UNDER_REVIEW' });
  const correction = await User.countDocuments({ status: 'CORRECTION_REQUIRED' });

  console.log('\n--- KPI Metric Cards Counts ---');
  console.log(`Total: ${total} | Active: ${active} | Under Review: ${underReview} | Correction Required: ${correction}`);

  process.exit(0);
}

auditPhase2();
