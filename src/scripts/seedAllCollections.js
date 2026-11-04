/**
 * Complete Database Seeder: Seeds ALL collections into MongoDB
 * Run: node src/scripts/seedAllCollections.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const { connectDB } = require('../config/mongo');

const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Document = require('../models/Document');
const Holiday = require('../models/Holiday');
const Payroll = require('../models/Payroll');
const Payslip = require('../models/Payslip');
const Reimbursement = require('../models/Reimbursement');
const Ticket = require('../models/Ticket');
const SystemSetting = require('../models/SystemSetting');

async function seedAll() {
  console.log(`\n======================================================`);
  console.log(` 🍃 Seeding Complete Enterprise Data into MongoDB`);
  console.log(`    Target Database: aayupones_hrms`);
  console.log(`======================================================`);

  await connectDB();

  // 1. USERS & ADMINS
  console.log(`\n1. 👤 Seeding Users & Admins...`);
  const salt = await bcrypt.genSalt(10);
  const adminPass = await bcrypt.hash('admin@1234', salt);
  const rahulPass = await bcrypt.hash('temp@1234', salt);

  const admin = await User.findOneAndUpdate(
    { employeeId: 'AAYUP-ADM-0001' },
    {
      employeeId: 'AAYUP-ADM-0001',
      name: 'Saurabh Sharma',
      email: 'admin@aayuptechnologies.com',
      passwordHash: adminPass,
      role: 'admin',
      designation: 'Head of Operations & IT',
      department: 'Management & Operations',
      joiningDate: '01/01/2025',
      status: 'ACTIVE',
      avatarInitials: 'SS',
      phone: '+91 98765 43210'
    },
    { upsert: true, returnDocument: 'after' }
  );

  const rahul = await User.findOneAndUpdate(
    { employeeId: 'AAYUP-DEV-0024' },
    {
      employeeId: 'AAYUP-DEV-0024',
      name: 'Rahul Kumar',
      email: 'rahul.k@aayup.com',
      passwordHash: rahulPass,
      role: 'admin',
      designation: 'Senior Developer & HR Admin',
      department: 'Engineering',
      joiningDate: '14 Jan 2024',
      status: 'ACTIVE',
      avatarInitials: 'RK',
      phone: '+91 98765 43210'
    },
    { upsert: true, returnDocument: 'after' }
  );

  const priya = await User.findOneAndUpdate(
    { employeeId: 'AAYUP-EMP-2026-37583' },
    {
      employeeId: 'AAYUP-EMP-2026-37583',
      name: 'Rahul Verma',
      email: 'rahul.verma@aayuptechnologies.com',
      passwordHash: rahulPass,
      role: 'employee',
      designation: 'Associate Software Engineer',
      department: 'Core Engineering',
      joiningDate: '02/11/2026',
      status: 'ACTIVE',
      avatarInitials: 'RV',
      phone: '+91 91234 56780',
      shift: '24/7 Unrestricted'
    },
    { upsert: true, returnDocument: 'after' }
  );
  console.log(`   ✓ Seeded 3 core enterprise users.`);

  // 2. ATTENDANCE
  console.log(`\n2. ⏱️ Seeding Attendance Records...`);
  const today = new Date().toISOString().split('T')[0];
  await Attendance.findOneAndUpdate(
    { employeeId: 'AAYUP-EMP-2026-37583', date: today },
    {
      userId: priya._id,
      employeeId: 'AAYUP-EMP-2026-37583',
      employeeName: 'Rahul Verma',
      date: today,
      punchIn: '09:00:15 AM',
      status: 'PRESENT',
      workMode: 'Office',
      location: { latitude: 28.5355, longitude: 77.3910, address: 'Noida HQ' }
    },
    { upsert: true }
  );
  console.log(`   ✓ Seeded attendance records.`);

  // 3. LEAVES
  console.log(`\n3. 🌴 Seeding Leaves & Requests...`);
  await Leave.findOneAndUpdate(
    { employeeId: 'AAYUP-EMP-2026-37583', fromDate: '2026-11-10' },
    {
      userId: priya._id,
      employeeId: 'AAYUP-EMP-2026-37583',
      employeeName: 'Rahul Verma',
      leaveType: 'Casual Leave (CL)',
      fromDate: '2026-11-10',
      toDate: '2026-11-10',
      session: 'Full Day',
      days: 1.0,
      reason: 'Family celebration / Personal visit',
      status: 'PENDING'
    },
    { upsert: true }
  );
  console.log(`   ✓ Seeded leaves.`);

  // 4. PAYROLL & PAYSLIPS
  console.log(`\n4. 💰 Seeding Payroll & Payslips Collections...`);
  await Payslip.findOneAndUpdate(
    { payslipNumber: 'PAY-2026-10-37583' },
    {
      payslipNumber: 'PAY-2026-10-37583',
      userId: priya._id,
      employeeId: 'AAYUP-EMP-2026-37583',
      employeeName: 'Rahul Verma',
      month: 'October 2026',
      year: 2026,
      basicPay: 40000,
      hra: 15000,
      specialAllowance: 7500,
      grossPay: 62500,
      pf: 4800,
      tds: 2000,
      professionalTax: 200,
      totalDeductions: 7000,
      netPay: 55500,
      daysWorked: 31,
      status: 'GENERATED'
    },
    { upsert: true }
  );
  console.log(`   ✓ Seeded payslips.`);

  // 5. REIMBURSEMENTS
  console.log(`\n5. 🧾 Seeding Reimbursements Claims...`);
  await Reimbursement.findOneAndUpdate(
    { claimId: 'EXP-2026-0041' },
    {
      claimId: 'EXP-2026-0041',
      userId: priya._id,
      employeeId: 'AAYUP-EMP-2026-37583',
      employeeName: 'Rahul Verma',
      category: 'Internet & Mobile',
      title: 'October High-Speed Fiber Broadband Bill',
      amount: 1499,
      expenseDate: '2026-10-28',
      receiptFileName: 'airtel_fiber_invoice_oct.pdf',
      status: 'PENDING'
    },
    { upsert: true }
  );
  console.log(`   ✓ Seeded reimbursement claims.`);

  // 6. HELPDESK TICKETS
  console.log(`\n6. 🎧 Seeding Internal Helpdesk Tickets...`);
  await Ticket.findOneAndUpdate(
    { ticketId: 'TKT-2026-0012' },
    {
      ticketId: 'TKT-2026-0012',
      userId: priya._id,
      employeeId: 'AAYUP-EMP-2026-37583',
      employeeName: 'Rahul Verma',
      category: 'IT & Hardware Support',
      priority: 'HIGH',
      subject: 'Secondary Monitor and HDMI Adapter Request',
      description: 'Need dual-monitor setup for frontend responsive testing and device simulators.',
      status: 'OPEN',
      assignedTo: 'IT Hardware Ops'
    },
    { upsert: true }
  );
  console.log(`   ✓ Seeded helpdesk tickets.`);

  // 7. SYSTEM SETTINGS
  console.log(`\n7. ⚙️  Seeding System Enterprise Configuration...`);
  await SystemSetting.findOneAndUpdate(
    { companyName: 'Aayup Technologies Private Limited' },
    {
      companyName: 'Aayup Technologies Private Limited',
      leavePolicies: { casualLeavesPerYear: 12, sickLeavesPerYear: 10, earnedLeavesPerYear: 15, halfDayAllowed: true },
      securitySettings: { enforceBiometricsOnMobile: true, sessionTimeoutMinutes: 10080, allowSelfOnboarding: true }
    },
    { upsert: true }
  );
  console.log(`   ✓ Seeded system settings.`);

  console.log(`\n======================================================`);
  console.log(` 🎉 All Collections Successfully Initialized & Seeded!`);
  console.log(`======================================================\n`);
  process.exit(0);
}

seedAll().catch(e => {
  console.error('❌ Seeding error:', e.message);
  process.exit(1);
});

