const { mongoose } = require('../config/mongo');

const leaveSchema = new mongoose.Schema(
  {
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
    leaveType: {
      type: String,
      required: true, // Casual Leave (CL), Sick Leave (SL), Compensatory Off, etc.
    },
    fromDate: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    toDate: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    session: {
      type: String,
      enum: ['Full Day', 'First Half', 'Second Half'],
      default: 'Full Day',
    },
    days: {
      type: Number,
      required: true,
      default: 1.0,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
    adminRemark: {
      type: String,
      default: '',
    },
    appliedOn: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Leave || mongoose.model('Leave', leaveSchema);

