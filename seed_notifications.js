const mongoose = require('mongoose');
const Notification = require('./src/models/Notification');
const Employee = require('./src/models/Employee');

async function seedNotifications() {
  await mongoose.connect('mongodb://127.0.0.1:27017/aayupones_hrms');
  console.log('Connected to DB');

  const emp = await Employee.findOne({ employeeId: 'AAYUP-EMP-2026-6359' });
  if (!emp) {
    console.log('Emp not found');
    process.exit(1);
  }

  await Notification.deleteMany({ employeeId: emp.employeeId });

  const notifications = [
    {
      userId: emp._id,
      employeeId: emp.employeeId,
      type: 'ONBOARDING',
      title: 'Dossier Verification in Progress 📑',
      desc: 'Your employee onboarding dossier and 13 sections have been submitted for HR review.',
      isUnread: true,
      route: 'onboarding'
    },
    {
      userId: emp._id,
      employeeId: emp.employeeId,
      type: 'ATTENDANCE',
      title: 'Geofence Swipe Logged 🟢',
      desc: 'Office check-in verified at 09:30 AM inside Lucknow Headquarters.',
      isUnread: true,
      route: 'attendance'
    },
    {
      userId: emp._id,
      employeeId: emp.employeeId,
      type: 'WORK',
      title: 'Active Task Assigned 📋',
      desc: 'Aayup Admin assigned you "Authentication & Biometric Punch Sync".',
      isUnread: true,
      route: 'work'
    },
    {
      userId: emp._id,
      employeeId: emp.employeeId,
      type: 'HR',
      title: 'Casual Leave Approved ✨',
      desc: 'Your 1-day Casual Leave was reviewed and approved by HR Admin.',
      isUnread: false,
      route: 'leave'
    },
    {
      userId: emp._id,
      employeeId: emp.employeeId,
      type: 'PAYROLL',
      title: 'Monthly Payslip Generated 💰',
      desc: 'October 2026 salary slip (₹55,425 Net Pay) is available for download.',
      isUnread: false,
      route: 'payslip'
    }
  ];

  await Notification.insertMany(notifications);
  console.log('Notifications seeded successfully!');
  process.exit(0);
}

seedNotifications();

