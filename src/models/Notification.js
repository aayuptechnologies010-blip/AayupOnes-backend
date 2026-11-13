const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: false
  },
  employeeId: {
    type: String,
    required: false
  },
  type: {
    type: String,
    enum: ['ALL', 'WORK', 'HR', 'ATTENDANCE', 'ONBOARDING', 'PAYROLL'],
    default: 'HR'
  },
  title: {
    type: String,
    required: true
  },
  desc: {
    type: String,
    required: true
  },
  isUnread: {
    type: Boolean,
    default: true
  },
  route: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', notificationSchema);

