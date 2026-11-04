const { mongoose } = require('../config/mongo');

const attendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    employeeId: {
      type: String,
      required: true,
      uppercase: true,
    },
    employeeName: {
      type: String,
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    punchIn: {
      type: String,
      required: true,
    },
    punchOut: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['PRESENT', 'ABSENT', 'HALF_DAY', 'ON_LEAVE', 'WFH'],
      default: 'PRESENT',
    },
    workMode: {
      type: String,
      enum: ['Office', 'Remote', 'Client Site'],
      default: 'Office',
    },
    location: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
      address: { type: String, default: 'Headquarters' },
    },
    totalHours: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);

