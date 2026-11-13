const { mongoose } = require('../config/mongo');

const taskSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      uppercase: true,
    },
    project: {
      type: String,
      default: 'General Project',
    },
    module: {
      type: String,
      default: 'General',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    priority: {
      type: String,
      enum: ['High Priority', 'Medium Priority', 'Low Priority', 'High', 'Medium', 'Low'],
      default: 'Medium Priority',
    },
    deadline: {
      type: String,
      default: 'Due Today',
    },
    progress: {
      type: Number,
      default: 0,
    },
    assignedBy: {
      type: String,
      default: 'Aayup Admin (HR Head)',
    },
    status: {
      type: String,
      enum: ['TODAY', 'UPCOMING', 'COMPLETED'],
      default: 'TODAY',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Task', taskSchema);

