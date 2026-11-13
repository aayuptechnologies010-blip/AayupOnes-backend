const { mongoose } = require('../config/mongo');

const offboardingSchema = new mongoose.Schema(
  {
    exitId: {
      type: String,
      unique: true,
      required: true
    },
    emp: {
      type: String,
      required: true
    },
    empId: {
      type: String,
      required: true
    },
    role: {
      type: String,
      default: 'Employee'
    },
    dept: {
      type: String,
      default: 'Engineering'
    },
    appliedOn: {
      type: String,
      default: '18 Oct 2026'
    },
    lastWorkingDay: {
      type: String,
      default: '18 Nov 2026'
    },
    noticePeriod: {
      type: String,
      default: '30 Days'
    },
    daysLeft: {
      type: Number,
      default: 15
    },
    reason: {
      type: String,
      default: 'Personal reasons'
    },
    status: {
      type: String,
      enum: ['Clearance In Progress', 'Ready for F&F Settlement', 'Settlement Completed'],
      default: 'Clearance In Progress'
    },
    clearances: {
      itAsset: { type: Boolean, default: false },
      financeDues: { type: Boolean, default: false },
      adminBadge: { type: Boolean, default: false },
      managerKT: { type: Boolean, default: false }
    },
    settlementAmount: {
      type: String,
      default: '₹ 50,000.00'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Offboarding || mongoose.model('Offboarding', offboardingSchema);

