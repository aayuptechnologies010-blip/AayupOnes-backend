const { mongoose } = require('../config/mongo');

const payslipSchema = new mongoose.Schema(
  {
    payslipNumber: {
      type: String,
      required: true,
      unique: true, // e.g. PAY-2026-10-0024
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    employeeId: {
      type: String,
      required: true,
    },
    employeeName: {
      type: String,
      required: true,
    },
    month: {
      type: String, // e.g. "October 2026"
      required: true,
    },
    year: {
      type: Number,
      default: 2026,
    },
    basicPay: { type: Number, required: true },
    hra: { type: Number, default: 0 },
    specialAllowance: { type: Number, default: 0 },
    grossPay: { type: Number, required: true },
    pf: { type: Number, default: 0 },
    tds: { type: Number, default: 0 },
    professionalTax: { type: Number, default: 200 },
    totalDeductions: { type: Number, required: true },
    netPay: { type: Number, required: true },
    daysWorked: { type: Number, default: 30 },
    status: {
      type: String,
      enum: ['GENERATED', 'DISBURSED', 'PENDING'],
      default: 'GENERATED',
    },
    pdfUrl: { type: String, default: '' },
    sentViaEmail: { type: Boolean, default: false },
    sentToApp: { type: Boolean, default: false },
    lastSentAt: { type: Date, default: null },
    generatedDate: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Payslip || mongoose.model('Payslip', payslipSchema);

