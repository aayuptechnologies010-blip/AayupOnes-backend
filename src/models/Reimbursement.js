const { mongoose } = require('../config/mongo');

const reimbursementSchema = new mongoose.Schema(
  {
    claimId: {
      type: String,
      required: true,
      unique: true, // e.g. EXP-2026-0041
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
    category: {
      type: String,
      enum: ['Travel & Commute', 'Internet & Mobile', 'Client Meal / Entertainment', 'Office Supplies', 'Certification / Training', 'Medical / Health'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    expenseDate: {
      type: String,
      required: true,
    },
    receiptFileName: {
      type: String,
      default: '',
    },
    receiptUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'DISBURSED'],
      default: 'PENDING',
    },
    adminRemark: {
      type: String,
      default: '',
    },
    paymentReference: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Reimbursement || mongoose.model('Reimbursement', reimbursementSchema);

