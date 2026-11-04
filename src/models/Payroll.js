const { mongoose } = require('../config/mongo');

const payrollSchema = new mongoose.Schema(
  {
    month: {
      type: String, // e.g. "October 2026", "2026-10"
      required: true,
    },
    totalEmployees: {
      type: Number,
      required: true,
    },
    totalGrossPay: {
      type: Number,
      required: true,
    },
    totalDeductions: {
      type: Number,
      default: 0,
    },
    totalNetPay: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['Draft', 'Processed', 'Disbursed', 'Pending Approval'],
      default: 'Processed',
    },
    disbursalDate: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
    records: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        employeeId: String,
        name: String,
        department: String,
        designation: String,
        basicSalary: Number,
        hra: Number,
        allowances: Number,
        grossSalary: Number,
        pfDeduction: Number,
        taxDeduction: Number,
        netSalary: Number,
        status: { type: String, enum: ['Paid', 'Pending'], default: 'Paid' },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.models.Payroll || mongoose.model('Payroll', payrollSchema);

